/* 연세온치과 메인 스크롤 몰입 연출 (GSAP ScrollTrigger) — '미소를 켜다' 테마
   - 글자는 모두 HTML에 그대로 두고 움직임만 더한다(크롤러·AEO 영향 없음)
   - 동작 줄이기 사용자는 아무것도 하지 않는다
   - 휠 관성 스크롤(Lenis)은 쓰지 않는다: 이 사이트는 휠 반응 지연 문제로 Lenis 를 일부러 껐다(minimal.js)
   - 기존 히어로 글자 등장·ON 워터마크·카운트업·FAQ 는 그대로 두고, data-reveal/.reveal/.img-reveal 은 넘겨받는다 */
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.gsap || !window.ScrollTrigger || !document.querySelector('.hero-word')) return;
  gsap.registerPlugin(ScrollTrigger);
  function boot() { start(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  function start() {
  document.documentElement.classList.add('mx');
  var mobile = matchMedia('(max-width: 767px)').matches;
  var EASE = 'expo.out';          // 사이트 --ease cubic-bezier(.19,1,.22,1) 와 같은 결
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return gsap.utils.toArray((c || document).querySelectorAll(s)); };

  // 화면에 들어오면 한 번 재생 — 빠르게 지나쳐도 onEnter 가 불려 끝 상태를 보장한다
  var TIMING = ['duration', 'ease', 'stagger', 'delay'];
  function enter(targets, vars, trigger, start) {
    var list = gsap.utils.toArray(targets);
    if (!list.length) return;
    var from = {}, to = { opacity: 1, x: 0, y: 0, yPercent: 0, rotate: 0, scale: 1, filter: 'blur(0px)', paused: true,
      onStart: function () { gsap.set(list, { transition: 'none' }); },
      onComplete: function () { gsap.set(list, { clearProps: 'opacity,transform,transition,filter' }); } };
    Object.keys(vars).forEach(function (k) { (TIMING.indexOf(k) > -1 ? to : from)[k] = vars[k]; });
    if (!('filter' in from)) delete to.filter;
    var tw = gsap.fromTo(list, from, to);
    ScrollTrigger.create({ trigger: trigger || list[0], start: start || 'top 88%', once: true, onEnter: function () {
      tw.play();
      setTimeout(function () { if (tw.progress() < 1) tw.progress(1); }, (tw.totalDuration() + 0.6) * 1000);
    } });
  }
  // 기존 등장 속성 떼기(같은 틱에 GSAP 시작 상태를 넣으므로 깜빡임 없음)
  function release(el) { el.removeAttribute('data-reveal'); el.removeAttribute('data-reveal-delay'); el.classList.remove('reveal', 'reveal-d1', 'reveal-d2', 'reveal-d3'); }
  function shown(el) { return el.classList.contains('in'); }

  // 낱말 감싸기(하위 태그·br 보존)
  function splitWords(el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      var parts = node.textContent.split(/(\s+)/);
      if (parts.join('').trim() === '') return;
      var frag = document.createDocumentFragment();
      parts.forEach(function (p) {
        if (!p) return;
        if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
        var w = document.createElement('span'); w.className = 'mx-w';
        var i = document.createElement('span'); i.className = 'mx-wi'; i.textContent = p;
        w.appendChild(i); frag.appendChild(w);
      });
      node.parentNode.replaceChild(frag, node);
    });
    return $$('.mx-wi', el);
  }

  // ── 히어로: 내려가면 태그라인은 먼저 떠오르고, 금빛 궤도는 천천히 커지며 물러난다(깊이)
  var hero = $('.hero-word');
  var heroContent = $('.hw-content', hero);
  if (heroContent) gsap.fromTo(heroContent, { y: 0, opacity: 1 }, { y: mobile ? -36 : -90, opacity: 0.25, ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  var orbit = $('.hw-orbit svg', hero);
  if (orbit) gsap.fromTo(orbit, { scale: 1, rotate: 0 }, { scale: 1.12, rotate: 14, ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });

  // ── 띠: 스크롤이 빠를수록 문구가 더 빨리 흐른다(브라우저 애니메이션 재생 속도만 바꿈)
  var mq = $('.marquee-track');
  if (mq && mq.getAnimations) {
    var anims = mq.getAnimations();
    if (anims.length) {
      var speed = { r: 1 };
      var rateTo = gsap.quickTo(speed, 'r', { duration: 0.8, ease: 'power3', onUpdate: function () { anims.forEach(function (a) { a.playbackRate = speed.r; }); } });
      ScrollTrigger.create({ trigger: mq, start: 'top bottom', end: 'bottom top',
        onUpdate: function (self) { rateTo(1 + Math.min(5, Math.abs(self.getVelocity()) / 400)); },
        onLeave: function () { rateTo(1); }, onLeaveBack: function () { rateTo(1); } });
      // 멈추면 원래 속도로
      var idle; window.addEventListener('scroll', function () { clearTimeout(idle); idle = setTimeout(function () { rateTo(1); }, 140); }, { passive: true });
    }
  }

  // ── 신뢰 지표: 네 숫자가 차례로 '켜진다' — 위에서 금빛 선이 그어지고 숫자가 올라온다
  var stats = $$('.trust-stat');
  if (stats.length) {
    var statsShown = stats.some(shown);
    stats.forEach(release);
    if (!statsShown) enter(stats, { y: 40, opacity: 0, filter: 'blur(6px)', duration: 1.4, ease: EASE, stagger: 0.12 }, $('.trust-grid'), 'top 90%');
    stats.forEach(function (s) { var l = document.createElement('i'); l.className = 'mx-line'; l.setAttribute('aria-hidden', 'true'); s.appendChild(l); });
    if (!statsShown) enter($$('.trust-stat .mx-line'), { scaleX: 0, duration: 1.4, ease: EASE, stagger: 0.12, delay: 0.15 }, $('.trust-grid'), 'top 90%');
  }

  // ── 철학 문장: 스크롤에 맞춰 낱말 하나씩 불이 켜지듯 밝아진다
  var quote = $('#home-quote .quote');
  if (quote) {
    release(quote);
    var big = $('.quote-big', quote);
    if (big) {
      big.classList.add('mx-read');
      gsap.fromTo(splitWords(big), { opacity: 0.12 }, { opacity: 1, stagger: 0.15, ease: 'none',
        scrollTrigger: { trigger: big, start: 'top 80%', end: 'bottom 45%', scrub: true } });
    }
    enter($$('.quote-eyebrow, .quote-sub, .quote-cite', quote), { y: 22, opacity: 0, duration: 1.2, ease: EASE, stagger: 0.12 }, quote, 'top 85%');
  }

  // ── 섹션 제목: 낱말이 마스크 아래에서 살짝 기울어진 채 올라온다(히어로 글자 등장과 같은 결)
  $$('main .sec-head').forEach(function (head) {
    release(head);
    var title = $('.sec-title', head);
    if (title) enter(splitWords(title), { yPercent: 115, rotate: 4, duration: 1.15, ease: EASE, stagger: 0.05 }, head, 'top 88%');
    var rest = Array.prototype.filter.call(head.children, function (c) { return !c.classList.contains('sec-title'); });
    if (rest.length) enter(rest, { y: 20, opacity: 0, duration: 1.1, ease: EASE, stagger: 0.1 }, head, 'top 88%');
  });
  var spaceHead = $('.space-head');
  if (spaceHead) {
    release(spaceHead);
    var st = $('.sec-title', spaceHead);
    if (st) enter(splitWords(st), { yPercent: 115, rotate: 4, duration: 1.15, ease: EASE, stagger: 0.05 }, spaceHead, 'top 88%');
    enter($$('.eyebrow, .link-arrow', spaceHead), { y: 20, opacity: 0, duration: 1.1, ease: EASE, stagger: 0.1 }, spaceHead, 'top 88%');
  }

  // ── 세 가지 중심 진료: 카드가 차례로 오르고, 카드 속 사진은 스크롤 동안 천천히 물러난다
  var cores = $$('.core-feature');
  if (cores.length) {
    cores.forEach(release);
    enter(cores, { y: mobile ? 40 : 80, opacity: 0, duration: 1.4, ease: EASE, stagger: 0.14 }, $('.core-grid'), 'top 86%');
    cores.forEach(function (card) {
      var media = $('.cf-media', card), pic = $('.cf-media > picture', card);
      if (!media || !pic) return;
      gsap.fromTo(pic, { yPercent: -5, scale: 1.14 }, { yPercent: 5, scale: 1.14, ease: 'none',
        scrollTrigger: { trigger: media, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  // ── 진료과목별 안내: 두 줄 카드가 왼쪽·오른쪽에서 맞물리듯 들어온다
  var tx = $$('.txall-card');
  if (tx.length) {
    tx.forEach(release);
    var cols = mobile ? 1 : 2;
    for (var r = 0; r < tx.length; r += cols) {
      var row = tx.slice(r, r + cols);
      row.forEach(function (card, i) {
        enter(card, { x: cols === 1 ? 0 : (i === 0 ? -50 : 50), y: cols === 1 ? 36 : 0, opacity: 0, duration: 1.2, ease: EASE, delay: i * 0.08 }, row[0], 'top 90%');
      });
    }
  }

  // ── 공간 화보: 방마다 불이 켜지듯 사진 막이 대각선 순서로 걷힌다(기존 img-reveal 모양 그대로, 순서만)
  var mag = $('.mag-grid');
  if (mag) {
    var cells = $$('.mag-cell', mag);
    cells.forEach(function (c) { c.removeAttribute('data-reveal'); c.removeAttribute('data-reveal-delay'); });
    ScrollTrigger.create({ trigger: mag, start: 'top 85%', once: true, onEnter: function () {
      cells.forEach(function (c, i) { setTimeout(function () { c.classList.add('in'); }, i * 130); });
    } });
  }
  // 그 밖의 사진 막(img-reveal): 들어오면 걷힘 — 빠르게 지나쳐도 걷힌다
  $$('main .img-reveal').forEach(function (fig) {
    if (fig.closest('.mag-grid')) return;
    release(fig);
    ScrollTrigger.create({ trigger: fig, start: 'top 85%', once: true, onEnter: function () { fig.classList.add('in'); } });
  });
  // 사진 위 꼬리표는 사진보다 빠르게 떠서 깊이가 생긴다
  $$('main .figure-float').forEach(function (f) {
    gsap.fromTo(f, { y: 40 }, { y: -40, ease: 'none', scrollTrigger: { trigger: f.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // ── 진료 여정: 단계가 차례로 놓이고, 내려가는 동안 지금 단계에 금빛 불이 들어온다
  var steps = $$('.journey-step');
  if (steps.length) {
    steps.forEach(release);
    enter(steps, { y: 50, opacity: 0, duration: 1.2, ease: EASE, stagger: 0.1 }, $('.journey-track'), 'top 86%');
    steps.forEach(function (s) { s.classList.add('in'); });   // 기존 아이콘 맥박 효과 유지
    ScrollTrigger.create({ trigger: '.journey-track', start: 'top 70%', end: 'bottom 40%',
      onUpdate: function (self) {
        var idx = Math.min(steps.length - 1, Math.floor(self.progress * steps.length));
        steps.forEach(function (s, i) { s.classList.toggle('mx-on', i === idx); });
      },
      onLeave: function () { steps.forEach(function (s) { s.classList.remove('mx-on'); }); },
      onLeaveBack: function () { steps.forEach(function (s) { s.classList.remove('mx-on'); }); } });
  }

  // ── 철학·원장 글: 문단이 한 줄씩
  $$('main .split-text').forEach(function (t) {
    release(t);
    enter(Array.prototype.slice.call(t.children), { y: 26, opacity: 0, duration: 1.1, ease: EASE, stagger: 0.07 }, t, 'top 85%');
  });

  // ── 오시는 길 정보: 네 칸이 차례로
  var metrics = $$('main .metric');
  if (metrics.length) { metrics.forEach(release); enter(metrics, { y: 30, opacity: 0, duration: 1.1, ease: EASE, stagger: 0.1 }, metrics[0], 'top 90%'); }

  // ── 온천장 진료 카드: 차례로, 지역 칩은 하나씩 톡톡 놓인다
  var onc = $$('#oncheonjang-care .onc-cards > li');
  if (onc.length) enter(onc, { y: 50, opacity: 0, duration: 1.2, ease: EASE, stagger: 0.08 }, onc[0], 'top 88%');
  var chipsBox = $('.region-chips');
  if (chipsBox) {
    release(chipsBox);
    enter($$('.region-chip', chipsBox), { y: 14, scale: 0.9, opacity: 0, duration: 0.8, ease: 'back.out(1.4)', stagger: 0.025 }, chipsBox, 'top 92%');
  }

  // ── 상담 띠: 둥근 카드에서 화면 가득 펼쳐지고, 문장이 낱말씩 올라온다
  var cta = $('.cta-band');
  if (cta) {
    gsap.fromTo(cta, { clipPath: mobile ? 'inset(2% 3% round 18px)' : 'inset(4% 4% round 32px)' }, { clipPath: 'inset(0% 0% round 0px)', ease: 'none',
      scrollTrigger: { trigger: cta, start: 'top 95%', end: 'top 25%', scrub: true } });
    var ch2 = $('h2', cta);
    if (ch2) { release(ch2); enter(splitWords(ch2), { yPercent: 115, rotate: 4, duration: 1.2, ease: EASE, stagger: 0.06 }, cta, 'top 70%'); }
    var rest2 = $$('p, .btn', cta);
    rest2.forEach(release);
    enter(rest2, { y: 24, opacity: 0, duration: 1.1, ease: EASE, stagger: 0.1, delay: 0.3 }, cta, 'top 70%');
  }

  // ── 나머지 data-reveal/.reveal 블록: 같은 모양(위로 32px + 흐림)으로 넘겨받는다
  $$('main [data-reveal], main .reveal').forEach(function (el) {
    if (el.closest('.hero-word')) return;
    var already = shown(el);
    release(el);
    if (!already) enter(el, { y: 32, opacity: 0, filter: 'blur(6px)', duration: 1.25, ease: EASE }, el, 'top 90%');
  });

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
})();
