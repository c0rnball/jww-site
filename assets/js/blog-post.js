/**
 * JWW Blog Post Renderer
 * Fetches metadata from posts.json and markdown from ./markdown.md,
 * renders via marked.js, sanitizes with DOMPurify, generates a table of contents.
 */
(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /**
   * Extract the slug from the URL path (e.g. /blog/posts/welcome/ → "welcome").
   */
  function getSlug() {
    var parts = window.location.pathname.replace(/\/+$/, '').split('/');
    return parts[parts.length - 1] || '';
  }

  /**
   * Format a date string (YYYY-MM-DD) into readable form.
   */
  function formatDate(dateStr) {
    if (!dateStr) return '';
    var parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    var months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    var month = months[parseInt(parts[1], 10) - 1] || parts[1];
    return month + ' ' + parseInt(parts[2], 10) + ', ' + parts[0];
  }

  // ---------------------------------------------------------------------------
  // Table of Contents generator
  // ---------------------------------------------------------------------------
  function generateTOC(container) {
    var headings = container.querySelectorAll('h2, h3');
    if (headings.length === 0) return;

    var tocNav = document.getElementById('table-of-contents');
    var tocList = document.getElementById('toc-list');
    if (!tocNav || !tocList) return;

    for (var i = 0; i < headings.length; i++) {
      var heading = headings[i];
      if (!heading.id) {
        heading.id = 'heading-' + i;
      }

      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + heading.id;
      a.textContent = heading.textContent;
      a.className = 'text-air-force-blue hover:text-dark-goldenrod transition-colors';

      if (heading.tagName === 'H3') {
        li.className = 'ml-4';
      }

      li.appendChild(a);
      tocList.appendChild(li);
    }

    tocNav.classList.remove('hidden');
  }

  // ---------------------------------------------------------------------------
  // Apply prose-like styling classes to rendered content
  // ---------------------------------------------------------------------------
  function applyProseStyles(container) {
    container.className = 'prose-jww';

    var h2s = container.querySelectorAll('h2');
    for (var i = 0; i < h2s.length; i++) {
      h2s[i].className = 'text-2xl font-serif font-bold text-pitch-black mt-10 mb-4';
    }
    var h3s = container.querySelectorAll('h3');
    for (var j = 0; j < h3s.length; j++) {
      h3s[j].className = 'text-xl font-serif font-bold text-pitch-black mt-8 mb-3';
    }
    var h4s = container.querySelectorAll('h4');
    for (var k = 0; k < h4s.length; k++) {
      h4s[k].className = 'text-lg font-bold text-pitch-black mt-6 mb-2';
    }

    var ps = container.querySelectorAll('p');
    for (var p = 0; p < ps.length; p++) {
      ps[p].className = 'text-tar-blue leading-relaxed mb-5';
    }

    var links = container.querySelectorAll('a');
    for (var l = 0; l < links.length; l++) {
      links[l].className = 'text-air-force-blue hover:text-dark-goldenrod underline transition-colors';
    }

    var uls = container.querySelectorAll('ul');
    for (var u = 0; u < uls.length; u++) {
      uls[u].className = 'list-disc list-inside text-tar-blue mb-5 space-y-2';
    }
    var ols = container.querySelectorAll('ol');
    for (var o = 0; o < ols.length; o++) {
      ols[o].className = 'list-decimal list-inside text-tar-blue mb-5 space-y-2';
    }

    var bqs = container.querySelectorAll('blockquote');
    for (var b = 0; b < bqs.length; b++) {
      bqs[b].className = 'border-l-4 border-dark-goldenrod pl-6 py-2 my-6 bg-light-gold/10 rounded-r-lg text-charcoal-blue italic';
    }

    var pres = container.querySelectorAll('pre');
    for (var pr = 0; pr < pres.length; pr++) {
      pres[pr].className = 'bg-pitch-black text-light-blue rounded-xl p-6 overflow-x-auto mb-5 text-sm';
    }

    var codes = container.querySelectorAll('code');
    for (var c = 0; c < codes.length; c++) {
      if (codes[c].parentElement && codes[c].parentElement.tagName === 'PRE') continue;
      codes[c].className = 'bg-powder-blue/20 text-charcoal-blue px-1.5 py-0.5 rounded text-sm font-mono';
    }

    var imgs = container.querySelectorAll('img');
    for (var im = 0; im < imgs.length; im++) {
      imgs[im].className = 'rounded-xl shadow-md my-6 max-w-full h-auto';
    }

    var hrs = container.querySelectorAll('hr');
    for (var h = 0; h < hrs.length; h++) {
      hrs[h].className = 'border-t border-powder-blue/30 my-10';
    }

    var tables = container.querySelectorAll('table');
    for (var t = 0; t < tables.length; t++) {
      tables[t].className = 'w-full border-collapse mb-5';
    }
    var ths = container.querySelectorAll('th');
    for (var th = 0; th < ths.length; th++) {
      ths[th].className = 'bg-tar-blue text-pure-white text-left px-4 py-2 text-sm font-semibold';
    }
    var tds = container.querySelectorAll('td');
    for (var td = 0; td < tds.length; td++) {
      tds[td].className = 'border-b border-powder-blue/30 px-4 py-2 text-sm';
    }
  }

  // ---------------------------------------------------------------------------
  // Show error state
  // ---------------------------------------------------------------------------
  function showError() {
    var loadingEl = document.getElementById('post-loading');
    if (loadingEl) {
      loadingEl.innerHTML =
        '<div class="text-center py-20">' +
          '<svg class="w-16 h-16 text-powder-blue mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
            '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>' +
          '</svg>' +
          '<h2 class="text-2xl font-serif font-bold text-pitch-black mb-2">Post Not Found</h2>' +
          '<p class="text-charcoal-blue mb-6">The article you are looking for could not be loaded.</p>' +
          '<a href="/blog/" class="px-6 py-3 bg-dark-goldenrod text-pure-white rounded-full font-medium hover:bg-honey-bronze transition-colors shadow-lg">Back to Blog</a>' +
        '</div>';
    }
  }

  // ---------------------------------------------------------------------------
  // Main render
  // ---------------------------------------------------------------------------
  function renderPost() {
    var slug = getSlug();
    if (!slug) return;

    // Fetch metadata from posts.json and markdown content in parallel
    Promise.all([
      fetch('/blog/posts.json').then(function (res) {
        if (!res.ok) throw new Error('Failed to load posts.json');
        return res.json();
      }),
      fetch('./markdown.md').then(function (res) {
        if (!res.ok) throw new Error('Post not found');
        return res.text();
      })
    ])
      .then(function (results) {
        var posts = results[0];
        var body = results[1];

        // Find metadata for this post
        var post = null;
        for (var i = 0; i < posts.length; i++) {
          if (posts[i].slug === slug) {
            post = posts[i];
            break;
          }
        }

        if (!post) {
          showError();
          return;
        }

        // Update page title
        document.title = post.title + ' - Joy With Wealth Blog';

        // Populate header
        var titleEl = document.getElementById('post-title');
        var metaEl = document.getElementById('post-meta');
        var tagsEl = document.getElementById('post-tags');
        var coverEl = document.getElementById('post-cover');
        var headerEl = document.getElementById('post-header');

        if (titleEl) titleEl.textContent = post.title;

        if (metaEl) {
          var metaHTML =
            '<span>' + formatDate(post.date) + '</span>' +
            '<span class="w-1 h-1 rounded-full bg-powder-blue"></span>' +
            '<span>' + (post.author || 'Joy With Wealth') + '</span>' +
            '<span class="w-1 h-1 rounded-full bg-powder-blue"></span>' +
            '<span>' + post.readingTime + ' min read</span>';
          metaEl.innerHTML = metaHTML;
        }

        if (tagsEl && post.tags && post.tags.length > 0) {
          var tagsHTML = '';
          for (var t = 0; t < post.tags.length; t++) {
            tagsHTML +=
              '<span class="px-3 py-1 text-xs font-medium bg-light-gold/20 text-dark-goldenrod rounded-full border border-light-gold/50">' +
              post.tags[t] +
              '</span>';
          }
          tagsEl.innerHTML = tagsHTML;
        }

        if (coverEl && post.coverImage) {
          coverEl.innerHTML =
            '<img src="' + post.coverImage + '" alt="' + post.title + '" ' +
            'class="w-full rounded-2xl shadow-lg">';
        }

        if (headerEl) headerEl.classList.remove('hidden');

        // Render markdown
        var html = '';
        if (typeof marked !== 'undefined') {
          html = marked.parse(body);
        } else {
          html = '<pre>' + body + '</pre>';
        }

        // Sanitize
        if (typeof DOMPurify !== 'undefined') {
          html = DOMPurify.sanitize(html);
        }

        // Insert into container
        var contentEl = document.getElementById('post-content');
        if (contentEl) {
          contentEl.innerHTML = html;
          contentEl.classList.remove('hidden');
          applyProseStyles(contentEl);
          generateTOC(contentEl);
        }

        // Hide loading
        var loadingEl = document.getElementById('post-loading');
        if (loadingEl) loadingEl.classList.add('hidden');
      })
      .catch(function () {
        showError();
      });
  }

  document.addEventListener('DOMContentLoaded', renderPost);
})();
