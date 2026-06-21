/* ============================================================================
   연세온치과 v3 — 미니멀 인터랙션 레이어
   부드러운 스크롤(Lenis) · 헤더 상태 · 모바일 nav · reveal · FAQ · count-up
   (뉴런 캔버스 / 커스텀 커서 없음 — 절제된 모션만)
   ============================================================================ */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- 1. Lenis 부드러운 스크롤 (있으면 사용) ---- */
  // 모바일/터치 기기는 OS 네이티브 관성 스크롤이 가장 자연스러우므로 Lenis 비활성
  var isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches
             || ('ontouchstart' in window && window.innerWidth <= 1024);

  function initLenis() {
    if (reduce || isTouch || typeof Lenis === 'undefined') {
      // 데스크톱 비활성 시에도 앵커 링크는 부드럽게 동작하도록 폴백
      bindAnchors(null);
      return;
    }
    try {
      var lenis = new Lenis({
        lerp: 0.12,            // 0~1, 클수록 즉각적 (기존 duration:1.1 → 둔함)
        wheelMultiplier: 1.15, // 휠 1회당 이동량 살짝 증가 → 가볍게
        touchMultiplier: 2,
        smoothWheel: true
      });
      function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
      requestAnimationFrame(raf);
      window.__lenis = lenis;
      bindAnchors(lenis);
    } catch (err) { bindAnchors(null); }
  }

  // 앵커 링크 부드러운 이동 (Lenis 있으면 사용, 없으면 네이티브 smooth)
  function bindAnchors(lenis) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      if (lenis) { lenis.scrollTo(el, { offset: -80 }); }
      else {
        var top = el.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
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
    var els = document.querySelectorAll('[data-reveal], .img-reveal, .reveal');
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

  /* ---- 5c. 스크롤 프로그레스 골드바 ---- */
  function initProgress() {
    var bar = document.querySelector('.scroll-progress i');
    if (!bar) return;
    var ticking = false;
    function update() {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(window.scrollY / h, 1) : 0) + ')';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ---- 5d. SVG 스트로크 드로잉 (data-draw) — 뷰포트 진입 시 1회 ---- */
  function initDraw() {
    var els = document.querySelectorAll('[data-draw]');
    if (!els.length) return;
    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('drawn'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('drawn'); io.unobserve(en.target); }
      });
    }, { threshold: 0.35 });
    els.forEach(function (el) { io.observe(el); });
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

  /* ---- 이미지 로드 페이드인 (.cf-media img / .core-card img) ---- */
  function initImgFade() {
    var imgs = document.querySelectorAll('.cf-media img, .core-card img');
    imgs.forEach(function (img) {
      if (img.complete && img.naturalWidth > 0) { img.classList.add('loaded'); return; }
      img.addEventListener('load', function () { img.classList.add('loaded'); });
      img.addEventListener('error', function () { img.classList.add('loaded'); }); // 실패해도 컨테이너 노출
    });
    // 안전장치 — 1.5초 후 무조건 노출 (JS/이벤트 누락 대비)
    setTimeout(function () { imgs.forEach(function (img) { img.classList.add('loaded'); }); }, 1500);
  }

  /* ---- 우하단 플로팅 빠른 연결(FAB) : 토글 펼침/접힘 ---- */
  function initFab() {
    var fab = document.getElementById('quick-fab');
    if (!fab) return;
    var toggle = document.getElementById('fab-toggle');
    var menu = document.getElementById('fab-menu');
    function open() {
      fab.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', '빠른 상담 메뉴 닫기');
      if (menu) menu.setAttribute('aria-hidden', 'false');
    }
    function close() {
      fab.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', '빠른 상담 메뉴 열기');
      if (menu) menu.setAttribute('aria-hidden', 'true');
    }
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      fab.classList.contains('open') ? close() : open();
    });
    // 메뉴 항목 클릭(전화/외부링크) 후엔 접기
    fab.querySelectorAll('.fab-item').forEach(function (a) {
      a.addEventListener('click', function () { setTimeout(close, 80); });
    });
    // 바깥 클릭/ESC 로 닫기
    document.addEventListener('click', function (e) {
      if (fab.classList.contains('open') && !fab.contains(e.target)) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && fab.classList.contains('open')) close();
    });
  }

  /* ---- 모바일 플로팅 상담 바 : 스크롤 다운 시 숨김, 업/멈춤 시 노출 ---- */
  function initStickyCta() {
    var bar = document.querySelector('.sticky-cta');
    if (!bar) return;
    var last = window.pageYOffset || 0, ticking = false, idle = null;
    function update() {
      var y = window.pageYOffset || 0;
      var goingDown = y > last && y > 240;
      if (goingDown) bar.classList.add('cta-hidden');
      else bar.classList.remove('cta-hidden');
      last = y;
      ticking = false;
      // 스크롤 멈추면 다시 노출
      clearTimeout(idle);
      idle = setTimeout(function () { bar.classList.remove('cta-hidden'); }, 700);
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
  }

  /* ---- init ---- */
  function init() {
    initLenis(); initHeader(); initMobileNav(); initReveal();
    initWordmark(); initHeroWords(); initProgress(); initDraw();
    initFaq(); initCount(); initParallax(); initCompare(); initImgFade();
    initStickyCta(); initFab();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
