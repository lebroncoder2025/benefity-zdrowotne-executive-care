/* cookie-consent.js - rozbudowany menadżer zgody na cookies (accessibility + settings modal)
   - zapisuje zgodę jako JSON: {v:1, necessary:true, analytics:bool, marketing:bool, ts:number}
   - zachowuje kompatybilność z wcześniejszym stringowym zapisem
*/
(function () {
  var key = 'bzdf_cookie_consent';
  var consent = null;
  var bannerId = 'bzdf-cookie-banner';
  var modalBackdropId = 'bzdf-cookie-modal-backdrop';

  function safeParse(v) {
    if (!v) return null;
    try { return JSON.parse(v); } catch (e) { return (v === 'accepted' || v === 'true') ? {v:1, necessary:true, analytics:true, marketing:true, ts:Date.now()} : (v === 'rejected' ? {v:1, necessary:true, analytics:false, marketing:false, ts:Date.now()} : null); }
  }

  function readConsent() {
    try { var raw = localStorage.getItem(key); consent = safeParse(raw); return consent; } catch (e) { consent = null; return null; }
  }

  function writeConsent(obj) {
    try { localStorage.setItem(key, JSON.stringify(obj)); consent = obj; } catch (e) { /* ignore */ }
  }

  function getCookiePolicyHref() {
    var path = String(window.location.pathname || '').toLowerCase();
    return path.indexOf('/pages/') !== -1 ? 'polityka-cookies.html' : 'pages/polityka-cookies.html';
  }

  function applyConsentObj(obj) {
    if (!obj) return;
    // Analytics (e.g., Google) loaded only when analytics:true
    if (obj.analytics && window.GA_MEASUREMENT_ID) {
      if (!window._bzdf_ga_loaded) {
        var s = document.createElement('script');
        s.src = 'https://www.googletagmanager.com/gtag/js?id=' + window.GA_MEASUREMENT_ID;
        s.async = true; document.head.appendChild(s);
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () { dataLayer.push(arguments); };
        gtag('js', new Date());
        gtag('config', window.GA_MEASUREMENT_ID);
        window._bzdf_ga_loaded = true;
      }
    }
    // Load other non-essential scripts when analytics or marketing is enabled
    if ((obj.analytics || obj.marketing) && window.BZDF && typeof window.BZDF.loadNonEssential === 'function') {
      try { window.BZDF.loadNonEssential(obj); } catch (e) { /* ignore */ }
    }
  }

  function openSettingsPanel() {
    var backdrop = document.getElementById(modalBackdropId);
    if (!backdrop) createModal();
    backdrop = document.getElementById(modalBackdropId);
    if (!backdrop) return;
    backdrop.classList.add('is-open');
    // Prevent scroll jump to top
    if (window.scrollY > 0) {
      backdrop.scrollIntoView({block:'center', inline:'nearest'});
      window.scrollTo({top:window.scrollY});
    }
    // set focus
    var first = backdrop.querySelector('input, button, [tabindex]');
    if (first) first.focus();
    // trap focus
    trapFocus(backdrop);
  }

  function closeSettingsPanel() {
    var backdrop = document.getElementById(modalBackdropId);
    if (!backdrop) return;
    backdrop.classList.remove('is-open');
    releaseFocusTrap();
  }

  function hideBanner() {
    var el = document.getElementById(bannerId);
    if (el) el.style.display = 'none';
  }

  function showBanner() {
    var el = document.getElementById(bannerId);
    if (el) el.style.display = 'block';
  }

  function acceptAll() {
    var obj = {v:1, necessary:true, analytics:true, marketing:true, ts:Date.now()};
    writeConsent(obj); applyConsentObj(obj); hideBanner();
  }

  function rejectAll() {
    var obj = {v:1, necessary:true, analytics:false, marketing:false, ts:Date.now()};
    writeConsent(obj); hideBanner();
  }

  function clearConsent() {
    try { localStorage.removeItem(key); consent = null; } catch (e) { consent = null; }
    // reset modal checkboxes if open
    var backdrop = document.getElementById(modalBackdropId);
    if (backdrop) {
      var a = backdrop.querySelector('#bzdf-consent-analytics');
      var m = backdrop.querySelector('#bzdf-consent-marketing');
      if (a) a.checked = false;
      if (m) m.checked = false;
    }
    // Show a quick confirmation and reload to ensure banner is visible and scripts reset
    var revokeLink = document.getElementById('bzdf-revoke-consent');
    if (revokeLink) {
      revokeLink.textContent = 'Zgoda cofnięta!';
      setTimeout(function(){
        // If modal was open, restore scroll position after reload
        if (document.getElementById(modalBackdropId) && document.getElementById(modalBackdropId).classList.contains('is-open')) {
          sessionStorage.setItem('bzdf_restore_modal', '1');
          sessionStorage.setItem('bzdf_scroll', window.scrollY);
        }
        window.location.reload();
      }, 700);
    } else {
      window.location.reload();
    }
    // Restore modal and scroll after reload if needed
    if (sessionStorage.getItem('bzdf_restore_modal') === '1') {
      sessionStorage.removeItem('bzdf_restore_modal');
      var scroll = parseInt(sessionStorage.getItem('bzdf_scroll'), 10);
      if (!isNaN(scroll)) setTimeout(function(){ window.scrollTo({top:scroll}); }, 50);
      setTimeout(function(){ openSettingsPanel(); }, 100);
      sessionStorage.removeItem('bzdf_scroll');
    }
  }

  function saveFromModal() {
    var backdrop = document.getElementById(modalBackdropId);
    if (!backdrop) return;
    var analytics = !!backdrop.querySelector('#bzdf-consent-analytics').checked;
    var marketing = !!backdrop.querySelector('#bzdf-consent-marketing').checked;
    var obj = {v:1, necessary:true, analytics:analytics, marketing:marketing, ts:Date.now()};
    writeConsent(obj); applyConsentObj(obj); closeSettingsPanel(); hideBanner();
  }

  function createBanner() {
    if (document.getElementById(bannerId)) return;
    var banner = document.createElement('div');
    banner.id = bannerId;
    banner.className = 'bzdf-cookie-banner';
    banner.setAttribute('role','region');
    banner.setAttribute('aria-label','Informacja o cookies');
    banner.innerHTML = '\n      <div class="bzdf-cookie-inner">\n        <p>Używamy plików cookies, aby poprawić działanie serwisu oraz analizować ruch. <a href="' + getCookiePolicyHref() + '">Dowiedz się więcej</a>.</p>\n        <div class="bzdf-cookie-actions">\n          <button id="bzdf-accept" class="btn btn-primary">Akceptuję</button>\n          <button id="bzdf-settings" class="btn">Ustawienia</button>\n          <button id="bzdf-decline" class="btn">Odrzuć</button>\n        </div>\n      </div>';
    document.body.appendChild(banner);
    // event listeners
    document.getElementById('bzdf-accept').addEventListener('click', acceptAll);
    document.getElementById('bzdf-decline').addEventListener('click', rejectAll);
    document.getElementById('bzdf-settings').addEventListener('click', openSettingsPanel);
    // wire footer links via shared helper (idempotent)
    try { wireFooterLinks(); } catch (e) { /* ignore */ }
  }

  function createModal() {
    if (document.getElementById(modalBackdropId)) return;
    var backdrop = document.createElement('div');
    backdrop.id = modalBackdropId;
    backdrop.className = 'bzdf-cookie-modal-backdrop';
    backdrop.innerHTML = '\n      <div class="bzdf-cookie-modal" role="dialog" aria-modal="true" aria-labelledby="bzdf-cookie-title">\n        <h3 id="bzdf-cookie-title">Ustawienia cookies</h3>\n        <p class="muted">Wybierz, które kategorie plików cookies chcesz włączyć. Niezbędne cookies są wymagane do działania serwisu.</p>\n        <div class="bzdf-cookie-cats">\n          <label class="bzdf-cookie-cat"><input type="checkbox" id="bzdf-consent-necessary" disabled checked> <div><strong>Niezbędne</strong><p>Funkcje serwisu, bezpieczeństwo i podstawowa funkcjonalność.</p></div></label>\n          <label class="bzdf-cookie-cat"><input type="checkbox" id="bzdf-consent-analytics"> <div><strong>Analityczne</strong><p>Pomagają nam zrozumieć, jak korzystasz ze strony (np. Google Analytics).</p></div></label>\n          <label class="bzdf-cookie-cat"><input type="checkbox" id="bzdf-consent-marketing"> <div><strong>Marketingowe</strong><p>Używane do spersonalizowanych treści i reklam przez partnerów zewnętrznych.</p></div></label>\n        </div>\n        <div class="bzdf-cookie-actions">\n          <button id="bzdf-save" class="btn btn-primary">Zapisz ustawienia</button>\n          <button id="bzdf-cancel" class="btn">Anuluj</button>\n        </div>\n      </div>';
    document.body.appendChild(backdrop);
    // populate checkboxes with current consent
    var c = readConsent();
    if (c) {
      var a = backdrop.querySelector('#bzdf-consent-analytics');
      var m = backdrop.querySelector('#bzdf-consent-marketing');
      if (a) a.checked = !!c.analytics;
      if (m) m.checked = !!c.marketing;
    }
    // listeners
    backdrop.querySelector('#bzdf-save').addEventListener('click', saveFromModal);
    backdrop.querySelector('#bzdf-cancel').addEventListener('click', function (e) { e.preventDefault(); closeSettingsPanel(); });
    backdrop.addEventListener('click', function (e) { if (e.target === backdrop) closeSettingsPanel(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { var bb = document.getElementById(modalBackdropId); if (bb && bb.classList.contains('is-open')) closeSettingsPanel(); } });
  }

  // Focus trap helpers
  var _trap = null;
  function trapFocus(container) {
    var focusable = container.querySelectorAll('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])');
    focusable = Array.prototype.slice.call(focusable).filter(function (el) { return !el.hasAttribute('disabled'); });
    if (!focusable.length) return;
    var first = focusable[0], last = focusable[focusable.length - 1];
    _trap = function (e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
      else { if (document.activeElement === last) { e.preventDefault(); first.focus(); } }
    };
    document.addEventListener('keydown', _trap);
  }
  function releaseFocusTrap() { if (_trap) { document.removeEventListener('keydown', _trap); _trap = null; } }
  // Wire footer links idempotently so modal can be opened even when banner is not present
  function wireFooterLinks() {
    try {
      var footerLink = document.getElementById('bzdf-change-settings');
      if (footerLink && !footerLink._bzdfBound) {
        footerLink.addEventListener('click', function (e) { e.preventDefault(); openSettingsPanel(); });
        footerLink._bzdfBound = true;
      }
      var revokeLink = document.getElementById('bzdf-revoke-consent');
      if (revokeLink && !revokeLink._bzdfBound) {
        revokeLink.addEventListener('click', function (e) { e.preventDefault(); clearConsent(); });
        revokeLink._bzdfBound = true;
      }
    } catch (e) { /* ignore wiring errors */ }
  }

  // initialize
  var existing = readConsent();
  if (!existing) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', createBanner);
    else createBanner();
    // also create modal element so it's ready
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', createModal);
    else createModal();
  } else {
    applyConsentObj(existing);
  }

  // Ensure footer links are wired whether or not banner exists
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wireFooterLinks);
  else wireFooterLinks();

  // Public API
  window.BZDF = window.BZDF || {};
  window.BZDF.getConsent = function () { return readConsent(); };
  window.BZDF.setConsent = function (obj) { writeConsent(obj); applyConsentObj(obj); hideBanner(); };
  window.BZDF.showConsentPanel = openSettingsPanel;
  window.BZDF.acceptAll = acceptAll;
  window.BZDF.rejectAll = rejectAll;
  // PATCHED_AT: 2026-04-27T12:00:00Z - wireFooterLinks & modal restore improvements
  // PUSH_MARKER: 2026-04-27T12:45:00Z - ensure remote presence
})();
