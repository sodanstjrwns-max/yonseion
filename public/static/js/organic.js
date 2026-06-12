// ============================================================================
// ORGANIC BIO ENGINE — 생체모방 비주얼 시스템
//  · Canvas 뉴런/세포 네트워크 (마우스 반응, 골드 빛)
//  · 커스텀 마그네틱 커서
//  · Lenis 부드러운 스크롤 + GSAP ScrollTrigger (kinetic / reveal / mask)
// ============================================================================
(function () {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;

  /* ====================== 1. NEURON NETWORK CANVAS ====================== */
  function initNeuralCanvas(canvas) {
    const ctx = canvas.getContext('2d', { alpha: true });
    let W, H, DPR, nodes = [], raf;
    const mouse = { x: -9999, y: -9999, active: false };
    const GOLD = [197, 165, 114];

    function resize() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      canvas.width = W * DPR; canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      seed();
    }
    function seed() {
      const density = Math.min(Math.max((W * H) / 16000, 40), 130);
      nodes = [];
      for (let i = 0; i < density; i++) {
        nodes.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.28,
          r: Math.random() * 1.8 + 0.7,
          pulse: Math.random() * Math.PI * 2,
        });
      }
    }
    const LINK = 132;
    function frame() {
      ctx.clearRect(0, 0, W, H);
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy; n.pulse += 0.02;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
        // mouse attraction (organic)
        if (mouse.active) {
          const dx = mouse.x - n.x, dy = mouse.y - n.y;
          const d = Math.hypot(dx, dy);
          if (d < 200) { const f = (200 - d) / 200 * 0.04; n.vx += dx / d * f; n.vy += dy / d * f; }
        }
        n.vx *= 0.992; n.vy *= 0.992;
      }
      // links
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < LINK) {
            const alpha = (1 - d / LINK) * 0.5;
            ctx.strokeStyle = `rgba(${GOLD[0]},${GOLD[1]},${GOLD[2]},${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      // mouse links (synapse fire)
      if (mouse.active) {
        for (const n of nodes) {
          const d = Math.hypot(mouse.x - n.x, mouse.y - n.y);
          if (d < 200) {
            const alpha = (1 - d / 200) * 0.7;
            ctx.strokeStyle = `rgba(${GOLD[0]},${GOLD[1]},${GOLD[2]},${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath(); ctx.moveTo(mouse.x, mouse.y); ctx.lineTo(n.x, n.y); ctx.stroke();
          }
        }
      }
      // nodes
      for (const n of nodes) {
        const glow = 0.55 + Math.sin(n.pulse) * 0.25;
        ctx.fillStyle = `rgba(${GOLD[0]},${GOLD[1]},${GOLD[2]},${glow})`;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });
    const host = canvas.closest('section') || canvas.parentElement;
    host.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left; mouse.y = e.clientY - rect.top; mouse.active = true;
    });
    host.addEventListener('mouseleave', () => { mouse.active = false; mouse.x = -9999; mouse.y = -9999; });
    if (!reduceMotion) frame(); else { /* draw single static frame */ frame(); cancelAnimationFrame(raf); }
  }
  document.querySelectorAll('canvas.neural').forEach(initNeuralCanvas);

  /* ====================== 2. CUSTOM MAGNETIC CURSOR ====================== */
  if (!isTouch && !reduceMotion) {
    const cur = document.createElement('div'); cur.className = 'cursor-dot';
    const ring = document.createElement('div'); ring.className = 'cursor-ring';
    document.body.append(cur, ring);
    let mx = 0, my = 0, rx = 0, ry = 0;
    window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; cur.style.transform = `translate(${mx}px,${my}px)`; });
    (function loop() { rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18; ring.style.transform = `translate(${rx}px,${ry}px)`; requestAnimationFrame(loop); })();
    const hoverables = 'a, button, .magnetic, [data-cursor]';
    document.addEventListener('mouseover', (e) => { if (e.target.closest(hoverables)) document.body.classList.add('cursor-hover'); });
    document.addEventListener('mouseout', (e) => { if (e.target.closest(hoverables)) document.body.classList.remove('cursor-hover'); });
    // magnetic buttons
    document.querySelectorAll('.magnetic').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ====================== 3. LENIS + GSAP ====================== */
  function startMotion() {
    const hasGSAP = window.gsap && window.ScrollTrigger;
    let lenis;
    if (window.Lenis && !reduceMotion) {
      lenis = new window.Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
      function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
      requestAnimationFrame(raf);
      if (hasGSAP) { lenis.on('scroll', window.ScrollTrigger.update); }
      // anchor links
      document.querySelectorAll('a[href^="#"]').forEach((a) => {
        a.addEventListener('click', (e) => { const t = document.querySelector(a.getAttribute('href')); if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -80 }); } });
      });
    }

    if (hasGSAP && !reduceMotion) {
      const { gsap, ScrollTrigger } = window;
      gsap.registerPlugin(ScrollTrigger);

      // fade-up reveal (stagger)
      gsap.utils.toArray('[data-anim="up"]').forEach((el) => {
        gsap.fromTo(el, { y: 60, opacity: 0 }, {
          y: 0, opacity: 1, duration: 1.1, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%' },
        });
      });
      // stagger groups
      gsap.utils.toArray('[data-anim="stagger"]').forEach((grp) => {
        gsap.fromTo(grp.children, { y: 50, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.1,
          scrollTrigger: { trigger: grp, start: 'top 85%' },
        });
      });
      // kinetic words (split-ish: spans pre-wrapped in HTML)
      gsap.utils.toArray('.kinetic').forEach((el) => {
        const words = el.querySelectorAll('.kw');
        gsap.fromTo(words, { yPercent: 110, opacity: 0 }, {
          yPercent: 0, opacity: 1, duration: 1, ease: 'power4.out', stagger: 0.06,
          scrollTrigger: { trigger: el, start: 'top 85%' },
        });
      });
      // mask image reveal
      gsap.utils.toArray('[data-anim="mask"]').forEach((el) => {
        gsap.fromTo(el, { clipPath: 'inset(100% 0 0 0)' }, {
          clipPath: 'inset(0% 0 0 0)', duration: 1.3, ease: 'power3.inOut',
          scrollTrigger: { trigger: el, start: 'top 82%' },
        });
      });
      // parallax
      gsap.utils.toArray('[data-speed]').forEach((el) => {
        const speed = parseFloat(el.dataset.speed);
        gsap.to(el, { yPercent: speed * 100, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
      // hero scale on scroll
      const heroVisual = document.querySelector('[data-hero-visual]');
      if (heroVisual) {
        gsap.to(heroVisual, { scale: 1.15, opacity: 0.4, ease: 'none', scrollTrigger: { trigger: heroVisual, start: 'top top', end: 'bottom top', scrub: true } });
      }
      // count up via ScrollTrigger
      gsap.utils.toArray('[data-count]').forEach((el) => {
        const target = parseFloat(el.dataset.count), dec = el.dataset.dec | 0, suffix = el.dataset.suffix || '';
        const o = { v: 0 };
        ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => {
          gsap.to(o, { v: target, duration: 1.8, ease: 'power2.out', onUpdate: () => { el.textContent = o.v.toFixed(dec) + suffix; }, onComplete: () => { el.textContent = target.toFixed(dec) + suffix; } });
        }});
      });
    } else {
      // fallback: show everything
      document.querySelectorAll('[data-anim], .kinetic .kw').forEach((el) => { el.style.opacity = 1; el.style.transform = 'none'; el.style.clipPath = 'none'; });
      document.querySelectorAll('[data-count]').forEach((el) => { el.textContent = parseFloat(el.dataset.count).toFixed(el.dataset.dec | 0) + (el.dataset.suffix || ''); });
    }
  }
  startMotion();

  /* ====================== 4. HEADER / NAV / FAQ / SLIDER (shared) ====================== */
  const header = document.querySelector('.site-header');
  const hero = document.querySelector('.hero, .page-hero');
  function onScroll() {
    if (!header) return; const y = window.scrollY;
    header.classList.toggle('solid', y > 40);
    if (hero && hero.classList.contains('hero')) header.classList.toggle('on-hero', y < hero.offsetHeight - 90);
  }
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  const toggle = document.querySelector('.nav-toggle');
  const mnav = document.querySelector('.mobile-nav');
  const mclose = document.querySelector('.mobile-close');
  if (toggle && mnav) {
    toggle.addEventListener('click', () => { mnav.classList.add('open'); document.body.style.overflow = 'hidden'; });
    if (mclose) mclose.addEventListener('click', () => { mnav.classList.remove('open'); document.body.style.overflow = ''; });
    mnav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => { mnav.classList.remove('open'); document.body.style.overflow = ''; }));
  }

  document.querySelectorAll('.faq-q').forEach((q) => q.addEventListener('click', () => q.closest('.faq-item').classList.toggle('open')));

  document.querySelectorAll('.ba-slider').forEach((slider) => {
    const handle = slider.querySelector('.ba-handle'), after = slider.querySelector('.ba-after');
    if (!handle || !after) return; let drag = false;
    function set(x) { const r = slider.getBoundingClientRect(); let p = Math.max(0, Math.min(100, ((x - r.left) / r.width) * 100)); after.style.clipPath = `inset(0 0 0 ${p}%)`; handle.style.left = p + '%'; }
    handle.addEventListener('mousedown', () => drag = true); handle.addEventListener('touchstart', () => drag = true, { passive: true });
    window.addEventListener('mouseup', () => drag = false); window.addEventListener('touchend', () => drag = false);
    window.addEventListener('mousemove', (e) => drag && set(e.clientX));
    window.addEventListener('touchmove', (e) => drag && set(e.touches[0].clientX), { passive: true });
    slider.addEventListener('click', (e) => set(e.clientX));
  });
})();
