/* ============================================================================
   연세온치과 v3 — 미니멀 인터랙션 레이어
   부드러운 스크롤(Lenis) · 헤더 상태 · 모바일 nav · reveal · FAQ · count-up
   (뉴런 캔버스 / 커스텀 커서 없음 — 절제된 모션만)
   ============================================================================ */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- 1. Lenis 부드러운 스크롤 (있으면 사용) ---- */
  function initLenis() {
    if (reduce || typeof Lenis === 'undefined') return;
    try {
      var lenis = new Lenis({ duration: 1.1, easing: function (t) { return 1 - Math.pow(1 - t, 3); }, smoothWheel: true });
      function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
      requestAnimationFrame(raf);
      window.__lenis = lenis;
      // 앵커 링크
      document.addEventListener('click', function (e) {
        var a = e.target.closest('a[href^="#"]');
        if (!a) return;
        var id = a.getAttribute('href');
        if (id.length < 2) return;
        var el = document.querySelector(id);
        if (el) { e.preventDefault(); lenis.scrollTo(el, { offset: -80 }); }
      });
    } catch (err) { /* noop */ }
  }

  /* ---- 2. 헤더 스크롤 상태 ---- */
  function initHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    function onScroll() {
      if (window.scrollY > 40) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- 3. 모바일 내비게이션 ---- */
  function initMobileNav() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.mobile-nav');
    var close = document.querySelector('.mobile-close');
    if (!toggle || !nav) return;
    function open() { nav.classList.add('open'); document.body.style.overflow = 'hidden'; }
    function shut() { nav.classList.remove('open'); document.body.style.overflow = ''; }
    toggle.addEventListener('click', open);
    if (close) close.addEventListener('click', shut);
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', shut); });
  }

  /* ---- 4. Reveal on scroll (IntersectionObserver) ---- */
  function initReveal() {
    var els = document.querySelectorAll('[data-reveal], .img-reveal');
    if (!els.length) return;
    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---- 5a. 거대 ON 워터마크 (.hw-mark) — 은은한 페이드 + 스크롤 패럴랙스 ---- */
  function initWordmark() {
    var mark = document.querySelector('.hw-mark');
    if (!mark) return;
    if (!reduce) {
      mark.style.opacity = '0';
      mark.style.transform = 'translateY(-50%) translateX(4%)';
      mark.style.transition = 'opacity 2s ease .3s, transform 2.2s cubic-bezier(.19,1,.22,1) .3s';
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          mark.style.opacity = '';   // CSS 기본 opacity(.055)로 복귀
          mark.style.transform = 'translateY(-50%) translateX(0)';
        });
      });
    }
    // 스크롤 시 ON이 천천히 흐르며 살짝 위로 (깊이감)
    var base = -50;
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (y > window.innerHeight) return;
      mark.style.transform = 'translateY(calc(' + base + '% - ' + (y * 0.12) + 'px)) translateX(' + (y * 0.03) + 'px)';
    }, { passive: true });
  }

  /* ---- 5b. 글자 단위 hero reveal (.hw-tagline / .hero h1 / .page-hero h1) ---- */
  function initHeroWords() {
    var hero = document.querySelector('.hw-tagline, .hero h1, .page-hero h1');
    if (!hero) return;
    var chars = hero.querySelectorAll('.kc');
    if (!chars.length) return;
    if (reduce) { chars.forEach(function (c) { c.style.transform = 'none'; }); return; }
    chars.forEach(function (c, i) {
      c.style.transform = 'translateY(108%) rotate(3deg)';
      c.style.opacity = '0';
      c.style.transition = 'transform 1s cubic-bezier(.19,1,.22,1) ' + (0.15 + i * 0.028) + 's, opacity .7s ease ' + (0.15 + i * 0.028) + 's';
    });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        chars.forEach(function (c) { c.style.transform = 'translateY(0) rotate(0)'; c.style.opacity = '1'; });
      });
    });
  }

  /* ---- 6. FAQ 아코디언 ---- */
  function initFaq() {
    document.querySelectorAll('.faq-q').forEach(function (q) {
      q.addEventListener('click', function () {
        var item = q.closest('.faq-item');
        if (!item) return;
        item.classList.toggle('open');
      });
    });
  }

  /* ---- 7. Count-up (data-count) ---- */
  function initCount() {
    var els = document.querySelectorAll('[data-count]');
    if (!els.length || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.textContent = el.getAttribute('data-count'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var target = parseFloat(el.getAttribute('data-count'));
        var suffix = el.getAttribute('data-suffix') || '';
        var dur = 1400, start = null;
        function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          var val = target * eased;
          el.textContent = (Number.isInteger(target) ? Math.round(val) : val.toFixed(1)) + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        io.unobserve(el);
      });
    }, { threshold: 0.5 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---- 7.5 미세 패럴랙스 (스크롤 기반, 절제) ---- */
  function initParallax() {
    var els = document.querySelectorAll('[data-parallax]');
    if (!els.length || reduce) return;
    var ticking = false;
    function update() {
      var vh = window.innerHeight;
      els.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.08;
        var center = rect.top + rect.height / 2 - vh / 2;
        el.style.transform = 'translate3d(0,' + (-center * speed) + 'px,0)';
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ---- 8. Before/After comparison slider ---- */
  function initCompare() {
    document.querySelectorAll('[data-compare]').forEach(function (root) {
      var top = root.querySelector('.compare-top');
      var handle = root.querySelector('.compare-handle');
      if (!top) return;
      function set(x) {
        var rect = root.getBoundingClientRect();
        var pct = Math.max(0, Math.min(100, ((x - rect.left) / rect.width) * 100));
        top.style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';
        if (handle) handle.style.left = pct + '%';
      }
      var dragging = false;
      root.addEventListener('pointerdown', function (e) { dragging = true; set(e.clientX); });
      window.addEventListener('pointermove', function (e) { if (dragging) set(e.clientX); });
      window.addEventListener('pointerup', function () { dragging = false; });
    });
  }

  /* ---- init ---- */
  function init() {
    initLenis(); initHeader(); initMobileNav(); initReveal();
    initWordmark(); initHeroWords(); initFaq(); initCount(); initParallax(); initCompare();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
