/* cookie-consent.js - prosty menadżer zgody na cookies */
(function () {
  var key = 'bzdf_cookie_consent';
  var consent = null;

  function setConsent(value) {
    try { localStorage.setItem(key, value); } catch (e) {}
    consent = value;
    applyConsent(value);
    hideBanner();
  }

  function applyConsent(value) {
    if (value === 'accepted') {
      if (window.GA_MEASUREMENT_ID) {
        var s = document.createElement('script');
        s.src = 'https://www.googletagmanager.com/gtag/js?id=' + window.GA_MEASUREMENT_ID;
        s.async = true; document.head.appendChild(s);
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () { dataLayer.push(arguments); };
        gtag('js', new Date());
        gtag('config', window.GA_MEASUREMENT_ID);
      }
      if (window.BZDF && typeof window.BZDF.loadNonEssential === 'function') {
        try { window.BZDF.loadNonEssential(); } catch (e) {}
      }
    }
  }

  function hideBanner() {
    var el = document.getElementById('bzdf-cookie-banner');
    if (el) el.style.display = 'none';
  }

  function showBanner() {
    var el = document.getElementById('bzdf-cookie-banner');
    if (el) el.style.display = 'block';
  }

  function createBanner() {
    if (document.getElementById('bzdf-cookie-banner')) return;
    var banner = document.createElement('div');
    banner.id = 'bzdf-cookie-banner';
    banner.className = 'bzdf-cookie-banner';
    banner.innerHTML = '\n      <div class="bzdf-cookie-inner">\n        <p>Używamy plików cookies, aby poprawić działanie serwisu oraz analizować ruch. <a href="polityka-cookies.html">Dowiedz się więcej</a>.</p>\n        <div class="bzdf-cookie-actions">\n          <button id="bzdf-accept" class="btn btn-primary">Akceptuję</button>\n          <button id="bzdf-decline" class="btn">Odrzuć</button>\n        </div>\n      </div>';
    document.body.appendChild(banner);
    var a = document.getElementById('bzdf-accept');
    var d = document.getElementById('bzdf-decline');
    if (a) a.addEventListener('click', function () { setConsent('accepted'); });
    if (d) d.addEventListener('click', function () { setConsent('rejected'); });
  }

  try { consent = localStorage.getItem(key); } catch (e) { consent = null; }

  if (!consent) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createBanner);
    } else { createBanner(); }
  } else {
    applyConsent(consent);
  }

  window.BZDF = window.BZDF || {};
  window.BZDF.getConsent = function () { try { return localStorage.getItem(key); } catch (e) { return null; } };
  window.BZDF.setConsent = setConsent;
  window.BZDF.showConsentPanel = function () { showBanner(); };
})();
