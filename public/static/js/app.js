// ============================================================================
// 연세온치과 — 인터랙션 엔진 (경량 Vanilla JS, GPU 가속 위주)
// ============================================================================
(function () {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Header scroll state ----------
  const header = document.querySelector('.site-header');
  const hero = document.querySelector('.hero, .page-hero');
  function onScroll() {
    if (!header) return;
    const y = window.scrollY;
    header.classList.toggle('solid', y > 40);
    if (hero && hero.classList.contains('hero')) {
      const heroBottom = hero.offsetHeight - 90;
      header.classList.toggle('on-hero', y < heroBottom);
    }
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---------- Reveal on scroll ----------
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length && !reduceMotion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  // ---------- Count-up ----------
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const dec = (el.dataset.dec | 0);
        if (reduceMotion) { el.textContent = target.toFixed(dec) + suffix; cio.unobserve(el); return; }
        const dur = 1600; const start = performance.now();
        function tick(now) {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (target * eased).toFixed(dec) + suffix;
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = target.toFixed(dec) + suffix;
        }
        requestAnimationFrame(tick);
        cio.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach((el) => cio.observe(el));
  }

  // ---------- Parallax (subtle) ----------
  const parallax = document.querySelectorAll('[data-parallax]');
  if (parallax.length && !reduceMotion) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      parallax.forEach((el) => {
        const speed = parseFloat(el.dataset.parallax) || 0.15;
        el.style.transform = `translate3d(0, ${y * speed}px, 0)`;
      });
    }, { passive: true });
  }

  // ---------- Mobile nav ----------
  const toggle = document.querySelector('.nav-toggle');
  const mnav = document.querySelector('.mobile-nav');
  const mclose = document.querySelector('.mobile-close');
  if (toggle && mnav) {
    toggle.addEventListener('click', () => { mnav.classList.add('open'); document.body.style.overflow = 'hidden'; });
    if (mclose) mclose.addEventListener('click', () => { mnav.classList.remove('open'); document.body.style.overflow = ''; });
    mnav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => { mnav.classList.remove('open'); document.body.style.overflow = ''; }));
  }

  // ---------- Before/After slider ----------
  document.querySelectorAll('.ba-slider').forEach((slider) => {
    const handle = slider.querySelector('.ba-handle');
    const after = slider.querySelector('.ba-after');
    if (!handle || !after) return;
    let dragging = false;
    function setPos(x) {
      const rect = slider.getBoundingClientRect();
      let pct = ((x - rect.left) / rect.width) * 100;
      pct = Math.max(0, Math.min(100, pct));
      after.style.clipPath = `inset(0 0 0 ${pct}%)`;
      handle.style.left = pct + '%';
    }
    const start = () => dragging = true;
    const end = () => dragging = false;
    const move = (e) => { if (!dragging) return; const x = e.touches ? e.touches[0].clientX : e.clientX; setPos(x); };
    handle.addEventListener('mousedown', start);
    handle.addEventListener('touchstart', start, { passive: true });
    window.addEventListener('mouseup', end);
    window.addEventListener('touchend', end);
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move, { passive: true });
    slider.addEventListener('click', (e) => setPos(e.clientX));
  });

  // ---------- FAQ accordion ----------
  document.querySelectorAll('.faq-q').forEach((q) => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const open = item.classList.contains('open');
      item.classList.toggle('open', !open);
    });
  });
})();
