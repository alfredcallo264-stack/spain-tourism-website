/* Spain Tourism Board interactivity */

(function () {
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Loader: hide once page is ready
  const loader = document.getElementById('loader');
  if (loader) {
    window.addEventListener('load', () => {
      if (prefersReduced) {
        loader.style.display = 'none';
        return;
      }
      loader.style.transition = 'opacity .45s ease, transform .45s ease';
      loader.style.opacity = '0';
      loader.style.transform = 'translateY(-10px)';
      setTimeout(() => (loader.style.display = 'none'), 480);
    });
  }

  // Reveal on scroll
  const revealEls = Array.from(document.querySelectorAll('.reveal'));
  const reveal = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add('is-visible');
      });
    },
    { threshold: 0.14 }
  );
  revealEls.forEach((el) => reveal.observe(el));

  // Animated split text effect (simple per-line char wrap)
  // For this build we use data-split for styling hook; JS gives stagger.
  const splitEls = document.querySelectorAll('[data-split]');
  splitEls.forEach((el) => {
    if (prefersReduced) return;
    const text = el.textContent;
    el.textContent = '';
    const spanWrap = document.createElement('span');
    spanWrap.className = 'reveal-ch';
    spanWrap.textContent = text;
    el.appendChild(spanWrap);
    // Stagger is handled via CSS keyless; we trigger via RAF.
    spanWrap.style.transition = 'opacity .7s ease, transform .7s ease';
    spanWrap.style.opacity = '0';
    spanWrap.style.transform = 'translateY(14px)';
    requestAnimationFrame(() => {
      spanWrap.style.opacity = '1';
      spanWrap.style.transform = 'translateY(0)';
    });
  });

  // Smooth scrolling for in-page links
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;

    if (a.matches('a[data-scroll]')) {
      const href = a.getAttribute('href') || '';
      if (href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (!target) return;
        target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
      }
    }
  });

  // Mobile nav toggle
  const navToggle = document.getElementById('navToggle');
  const siteNav = document.getElementById('siteNav');
  if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
      const open = siteNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });

    // Close nav on link click
    siteNav.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;
      siteNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  }

  // Page transitions between HTML pages
  const fadeOverlay = document.getElementById('pageFade');
  function doPageFade() {
    if (!fadeOverlay || prefersReduced) return;
    fadeOverlay.classList.add('is-active');
  }
  function endPageFade() {
    if (!fadeOverlay) return;
    setTimeout(() => fadeOverlay.classList.remove('is-active'), 250);
  }

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-page]');
    if (!link) return;

    const href = link.getAttribute('href') || '';
    // Only apply to full page navigation (not hashes)
    if (!href || href.startsWith('#')) return;
    doPageFade();
    // Let the navigation happen; overlay will persist until new page loads.
    endPageFade();
  });

  // Theme toggle (dark mode)
  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    const saved = localStorage.getItem('stb-theme');
    const root = document.documentElement;
    if (saved === 'light') root.setAttribute('data-theme', 'light');

    themeBtn.addEventListener('click', () => {
      const isLight = root.getAttribute('data-theme') === 'light';
      if (isLight) {
        root.removeAttribute('data-theme');
        localStorage.setItem('stb-theme', 'dark');
        themeBtn.textContent = '🌙';
      } else {
        root.setAttribute('data-theme', 'light');
        localStorage.setItem('stb-theme', 'light');
        themeBtn.textContent = '☀️';
      }
    });
  }

  // Parallax scrolling on hero background (homepage)
  const parallaxBg = document.querySelector('[data-parallax]');
  if (parallaxBg) {
    const amt = parseFloat(parallaxBg.getAttribute('data-parallax') || '0.25');
    const bg = parallaxBg;

    const onScroll = () => {
      if (prefersReduced) return;
      const y = window.scrollY || 0;
      bg.style.transform = `translate3d(0, ${y * amt}px, 0)`;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Planner: route-length suggestion
  const plannerButtons = Array.from(document.querySelectorAll('[data-plan]'));
  const result = document.querySelector('.planner__result');
  if (plannerButtons.length && result) {
    plannerButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const days = btn.getAttribute('data-plan');
        const map = {
          '3': '3-day sprint: Barcelona for vibes → Madrid for museums → Seville for flamenco.',
          '5': '5-day sweet spot: Barcelona → Granada for Alhambra magic → Madrid nights.',
          '7': '7-day cinematic loop: Barcelona → Ibiza coast → Valencia paella → Seville shows.'
        };
        result.innerHTML = `Suggested route: <strong>${days} days</strong> ${map[days] ? '🌟' : ''}`;
        if (map[days]) {
          const details = result.querySelector('.details');
          if (details) details.remove();
        }
        if (map[days]) {
          const p = document.createElement('div');
          p.className = 'details';
          p.style.marginTop = '8px';
          p.style.color = 'var(--muted)';
          p.style.fontWeight = '700';
          p.textContent = map[days];
          result.appendChild(p);
        }
      });
    });
  }

  // Close any accidental focus/overlay on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (siteNav && siteNav.classList.contains('is-open')) {
      siteNav.classList.remove('is-open');
      if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    }
  });
})();

