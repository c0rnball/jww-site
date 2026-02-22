/**
 * JWW Blog List
 * Fetches posts.json and renders a card grid on the blog listing page.
 */
(function () {
  'use strict';

  /**
   * Format a date string (YYYY-MM-DD) into a readable form.
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

  /**
   * Build the HTML for a single blog card.
   */
  function buildCard(post) {
    var coverHTML = '';
    if (post.coverImage) {
      coverHTML =
        '<img src="' + post.coverImage + '" alt="' + post.title + '" ' +
        'class="w-full h-48 object-cover rounded-t-2xl">';
    } else {
      coverHTML =
        '<div class="w-full h-48 bg-gradient-to-br from-tar-blue to-charcoal-blue rounded-t-2xl flex items-center justify-center">' +
          '<svg class="w-16 h-16 text-powder-blue/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
            '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" ' +
            'd="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>' +
          '</svg>' +
        '</div>';
    }

    var tagsHTML = '';
    if (post.tags && post.tags.length > 0) {
      tagsHTML = '<div class="flex flex-wrap gap-2 mt-4">';
      for (var i = 0; i < post.tags.length; i++) {
        tagsHTML +=
          '<span class="px-2.5 py-1 text-xs font-medium bg-light-gold/20 text-dark-goldenrod rounded-full border border-light-gold/50">' +
          post.tags[i] +
          '</span>';
      }
      tagsHTML += '</div>';
    }

    return (
      '<a href="/blog/posts/' + post.slug + '/" class="group block">' +
        '<div class="bg-pure-white rounded-2xl border border-powder-blue/30 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">' +
          coverHTML +
          '<div class="p-6">' +
            '<h2 class="text-xl font-bold text-pitch-black group-hover:text-dark-goldenrod transition-colors duration-200 mb-2">' +
              post.title +
            '</h2>' +
            '<div class="flex flex-wrap items-center gap-3 text-sm text-charcoal-blue mb-3">' +
              '<span>' + formatDate(post.date) + '</span>' +
              '<span class="w-1 h-1 rounded-full bg-powder-blue"></span>' +
              '<span>' + post.author + '</span>' +
              '<span class="w-1 h-1 rounded-full bg-powder-blue"></span>' +
              '<span>' + post.readingTime + ' min read</span>' +
            '</div>' +
            '<p class="text-charcoal-blue leading-relaxed text-sm">' + post.excerpt + '</p>' +
            tagsHTML +
          '</div>' +
        '</div>' +
      '</a>'
    );
  }

  /**
   * Render all posts into the container.
   */
  function renderPosts(posts) {
    var loading = document.getElementById('blog-loading');
    var container = document.getElementById('blog-posts');
    if (!container) return;

    if (loading) loading.classList.add('hidden');
    container.classList.remove('hidden');

    if (!posts || posts.length === 0) {
      container.innerHTML =
        '<div class="col-span-full text-center py-20">' +
          '<svg class="w-16 h-16 text-powder-blue mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
            '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" ' +
            'd="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>' +
          '</svg>' +
          '<h2 class="text-2xl font-serif font-bold text-pitch-black mb-2">No posts yet</h2>' +
          '<p class="text-charcoal-blue">Check back soon for insights on financial planning and wealth management.</p>' +
        '</div>';
      return;
    }

    var html = '';
    for (var i = 0; i < posts.length; i++) {
      html += buildCard(posts[i]);
    }
    container.innerHTML = html;
  }

  /**
   * Fetch posts.json and render.
   */
  function init() {
    fetch('/blog/posts.json')
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load posts');
        return res.json();
      })
      .then(function (posts) {
        renderPosts(posts);
      })
      .catch(function () {
        renderPosts([]);
      });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
