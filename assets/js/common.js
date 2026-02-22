/**
 * JWW Common JavaScript
 * Mobile menu, cookie consent, analytics loader
 */

(function () {
  'use strict';

  // --- Mobile Menu Toggle ---
  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('mobile-menu-btn');
    var menu = document.getElementById('mobile-menu');
    if (!btn || !menu) return;

    btn.addEventListener('click', function () {
      menu.classList.toggle('hidden');
    });

    var links = menu.querySelectorAll('a');
    links.forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.add('hidden');
      });
    });
  });

  // --- Cookie Consent ---
  var CONSENT_KEY = 'jww_cookie_consent';

  function getConsent() {
    try {
      var stored = localStorage.getItem(CONSENT_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  }

  function setConsent(analytics, marketing) {
    var consent = { analytics: analytics, marketing: marketing, timestamp: Date.now() };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    if (analytics) loadGoogleAnalytics();
    if (marketing) loadFacebookPixel();
    hideBanner();
  }

  function hasAnalyticsConsent() {
    var consent = getConsent();
    return consent && consent.analytics === true;
  }

  function hasMarketingConsent() {
    var consent = getConsent();
    return consent && consent.marketing === true;
  }

  function hideBanner() {
    var banner = document.getElementById('cookie-consent-banner');
    if (banner) banner.remove();
  }

  function showConsentBanner() {
    if (getConsent()) return; // Already consented

    var banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.className = 'fixed bottom-0 left-0 right-0 z-[100] bg-tar-blue text-pure-white p-4 shadow-2xl border-t border-air-force-blue/30';
    banner.innerHTML =
      '<div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">' +
        '<div class="text-sm text-powder-blue">' +
          'We use cookies for analytics and marketing. By clicking "Accept All", you consent to our use of cookies. ' +
          '<a href="/policies/#privacy-policy" class="underline text-light-gold hover:text-honey-bronze">Learn more</a>' +
        '</div>' +
        '<div class="flex gap-3 flex-shrink-0">' +
          '<button id="consent-reject" class="px-4 py-2 text-sm border border-powder-blue/50 rounded-full hover:bg-charcoal-blue transition-colors">Essential Only</button>' +
          '<button id="consent-accept" class="px-4 py-2 text-sm bg-dark-goldenrod text-pure-white rounded-full hover:bg-honey-bronze transition-colors font-medium">Accept All</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(banner);

    document.getElementById('consent-accept').addEventListener('click', function () {
      setConsent(true, true);
    });
    document.getElementById('consent-reject').addEventListener('click', function () {
      setConsent(false, false);
    });
  }

  // --- Analytics Loaders ---
  // Replace these placeholder IDs with real ones before launch
  var GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';
  var FB_PIXEL_ID = 'XXXXXXXXXX';

  function loadGoogleAnalytics() {
    if (GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') return;
    if (document.getElementById('ga-script')) return;
    var script = document.createElement('script');
    script.id = 'ga-script';
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });
  }

  function loadFacebookPixel() {
    if (FB_PIXEL_ID === 'XXXXXXXXXX') return;
    if (window.fbq) return;
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
      n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', FB_PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  // --- Init ---
  document.addEventListener('DOMContentLoaded', function () {
    // Load analytics if already consented
    if (hasAnalyticsConsent()) loadGoogleAnalytics();
    if (hasMarketingConsent()) loadFacebookPixel();

    // Show banner if no consent recorded
    showConsentBanner();
  });
})();
