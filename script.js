/* Executive Care — Interactions */
(function () {
  'use strict';

  /* ── Nav toggle ─────────────────────────── */
  const toggle = document.querySelector('.nav-toggle');
  const nav    = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = toggle.classList.toggle('is-open');
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open);
    });
  }

  /* ── Scroll reveal ──────────────────────── */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-visible'));
  }

  /* ── Counter animation ──────────────────── */
  const counters = document.querySelectorAll('.metric-value[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const end = parseInt(el.dataset.count, 10);
        const dur = 1200;
        const start = performance.now();
        const tick = (now) => {
          const t = Math.min((now - start) / dur, 1);
          const ease = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.round(ease * end);
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        cio.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(el => cio.observe(el));
  }

  /* ── Header shrink on scroll ────────────── */
  const header = document.querySelector('.site-header');
  if (header) {
    let last = 0;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 60);
      if (y > last && y > 300) header.classList.add('is-hidden');
      else header.classList.remove('is-hidden');
      last = y;
    }, { passive: true });
  }

  /* ── Smooth anchor scroll ───────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (nav && nav.classList.contains('is-open')) {
          nav.classList.remove('is-open');
          toggle.classList.remove('is-open');
        }
      }
    });
  });

  const leadForm = document.getElementById('lead-form');
  if (leadForm) {
    const feedback = leadForm.querySelector('.lead-form-feedback');
    leadForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(leadForm);
      const email = String(data.get('email') || '').trim();
      const fullName = String(data.get('fullName') || '').trim();
      const company = String(data.get('company') || '').trim();
      const companySize = String(data.get('companySize') || '').trim();
      const phone = String(data.get('phone') || '').trim();
      const consent = data.get('consent') ? 'Tak' : 'Nie';
      const subject = `Zapytanie o pakiet medyczny${company ? ` — ${company}` : ''}`;
      const body = [
        `E-mail: ${email}`,
        `Imię i nazwisko osoby do kontaktu: ${fullName}`,
        `Firma: ${company}`,
        companySize ? `Wielkość firmy: ${companySize}` : '',
        phone ? `Numer telefonu: ${phone}` : '',
        `Zgoda na przetwarzanie danych: ${consent}`,
        '',
        'Po wysłaniu zgłoszenia przekażemy bezpłatny PDF z wyróżnikami oraz omówimy najlepszy wariant pakietu.'
      ].filter(Boolean).join('\n');

      if (feedback) {
        feedback.textContent = 'Otwieramy wiadomość e-mail z Twoim zgłoszeniem...';
      }

      window.location.href = `mailto:benefityzdrowotne@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }
})();
 
