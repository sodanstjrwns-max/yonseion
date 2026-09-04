import { html, raw } from 'hono/html'
import { Layout, kinetic, picture } from '../components/layout'
import { clinic } from '../data/clinic'
import { coreTreatments, treatments } from '../data/treatments'
import { faqGroups } from '../data/faqs'
import { seoRegions, seoTreatments } from '../data/facilities'
import { encyclopedia } from '../data/encyclopedia'
import { doctors } from '../data/doctors'
import { organizationSchema, websiteSchema, faqSchema, breadcrumbSchema, personSchema, reserveActionSchema } from '../lib/schema'

// 실사진 제공 전 — 외부 placeholder 대신 깨끗한 CSS 톤 블록(.ph) 사용
// 사진 URL을 받으면 .ph 안의 <img>로 교체만 하면 됨
function phBlock(label: string, ratio = '4/5'): string {
  return `<div class="ph" style="aspect-ratio:${ratio}"><span class="ph-label">${label}</span></div>`
}
// 워드마크용 글자 분할
function splitChars(text: string): string {
  return Array.from(text).map((ch) => `<span class="kc">${ch}</span>`).join('')
}
// FAQ 아코디언 아이템 (홈 FAQ + 진료별 FAQ 발췌 공용)
function faqItemHtml(f: { q: string; a: string }): string {
  return '<div class="faq-item"><button class="faq-q" type="button"><span>' + f.q + '</span><i class="fas fa-plus"></i></button><div class="faq-a"><div class="faq-a-inner"><p>' + f.a + '</p></div></div></div>'
}
// 콘텐츠 허브에서 노출할 백과사전 대표 용어 (실존 슬러그만)
const encHubSlugs = [
  'biomimetic-dentistry', 'laminate', 'zirconia-crown', 'veneer', 'dental-implant', 'all-on-x',
  'navigation-implant', 'composite-resin', 'root-canal', 'scaling', 'periodontitis', 'wisdom-tooth',
  'tmj-disorder', 'bruxism', 'teeth-whitening', 'tooth-sensitivity', 'halitosis', 'dental-checkup',
]

export function HomePage() {
  const homeFaqs = [
    { q: '연세온치과는 어디에 있나요?', a: `${clinic.address}에 있습니다. ${clinic.subway} 거리로, 부산 동래·금정·연제·부산진·해운대는 물론 양산·김해·울산에서도 내원하십니다.` },
    { q: '진료시간과 휴진일은 어떻게 되나요?', a: `${clinic.hoursSummary}입니다. ${clinic.closedDays}.` },
    { q: '생체모방치의학이 무엇인가요?', a: '자연치아의 형태와 기능을 최대한 보존·복원하는 치료 철학입니다. 손상 부위만 정밀하게 수복하고 건강한 치아 조직은 최대한 남기는 보존적 접근을 우선합니다.' },
    { q: '연세온치과의 대표원장은 누구인가요?', a: '김경희 대표원장으로, 치과보철과 전문의이자 통합치의학과 전문의(더블보더)입니다.' },
    { q: '주차가 가능한가요?', a: '건물 주차가 가능합니다. 자세한 주차 안내는 오시는 길 페이지에서 확인하실 수 있습니다.' },
    { q: '예약은 어떻게 하나요?', a: `홈페이지의 예약 신청 또는 전화(${clinic.phone})로 상담 예약이 가능합니다.` },
  ]

  // 진료별 FAQ 발췌 — 기존 faqGroups 데이터를 홈에 노출 (FAQPage 스키마와 일치)
  const homeFaqPicks = Object.entries(faqGroups).map(([key, g]) => ({
    key, label: g.label, faqs: g.faqs.slice(0, 3),
  }))
  const allHomeFaqs = [...homeFaqs, ...homeFaqPicks.flatMap((g) => g.faqs)]

  const meta = {
    title: `${clinic.nameKo} | 부산 동래구 온천동 치과 (온천장역)`,
    description: `부산 동래구 온천동 ${clinic.nameKo}(온천장역 도보 3분). 자연치아를 닮은 생체모방치의학으로 중장년 심미보철·전체임플란트·접착수복을 정직하게 진료합니다.`,
    path: '/',
    jsonLd: [
      organizationSchema(),
      websiteSchema(),
      faqSchema(allHomeFaqs),
      // B1 리치 스키마 확장: 원장(Person) + 예약 액션(ReserveAction) + 홈 브레드크럼
      personSchema(doctors[0]),
      reserveActionSchema(),
      breadcrumbSchema([{ name: '홈', url: '/' }]),
    ],
  }

  const lead = doctors[0]

  const body = html`
  <!-- ===== HERO : 거대 사진 + 절제 타이포 ===== -->
  <section class="hero-word" id="hero">
    <!-- 거대 ON — 배경 워터마크 오브제 -->
    <div class="hw-mark" aria-hidden="true">${raw(splitChars('ON'))}</div>

    <!-- 골드 오빗 — 공전하는 벡터 링 (켜다 On 모티프) -->
    <div class="hw-orbit" aria-hidden="true">
      <svg viewBox="0 0 600 600" fill="none">
        <circle cx="300" cy="300" r="248" stroke="url(#og1)" stroke-width="1" opacity=".5"/>
        <circle cx="300" cy="300" r="292" stroke="var(--gold)" stroke-width=".6" stroke-dasharray="2 10" opacity=".4" class="orbit-dash"/>
        <g class="orbit-rot">
          <circle cx="300" cy="52" r="4" fill="var(--gold)"/>
          <circle cx="300" cy="52" r="9" stroke="var(--gold)" stroke-width=".8" opacity=".45"/>
        </g>
        <g class="orbit-rot-rev">
          <circle cx="300" cy="595" r="2.2" fill="var(--gold-light)" opacity=".9"/>
        </g>
        <defs>
          <linearGradient id="og1" x1="0" y1="0" x2="600" y2="600">
            <stop offset="0" stop-color="#C8A86B" stop-opacity=".7"/>
            <stop offset=".5" stop-color="#AE8A4C" stop-opacity=".15"/>
            <stop offset="1" stop-color="#D9C18C" stop-opacity=".6"/>
          </linearGradient>
        </defs>
      </svg>
    </div>

    <!-- 상단 코너 메타 -->
    <div class="hw-corner" data-reveal>
      <div class="m-label">${clinic.nameEn} · 부산 동래 · since ${clinic.openedYear}</div>
      <div class="m-label right">Biomimetic Dentistry</div>
    </div>

    <!-- 콘텐츠 : 태그라인이 주인공 -->
    <div class="hw-content">
      <span class="hw-eyebrow" data-reveal>부산 동래구 온천동 · ${clinic.nameKo}</span>
      <h1 class="hw-tagline" aria-label="미소의 젊음을 켜드립니다">${raw(kinetic('미소의 젊음을'))}<br class="hw-br"><span class="tg-gold">${raw(kinetic('켜드립니다'))}</span></h1>
      <p class="hw-mission" data-reveal data-reveal-delay="2">${clinic.mission}</p>
      <div class="hw-cta" data-reveal data-reveal-delay="3">
        <a href="/reservation" class="btn btn-primary">예약 상담 <i class="fas fa-arrow-right"></i></a>
        <a href="/biomimetic" class="link-arrow">생체모방치의학이란 <i class="fas fa-arrow-right"></i></a>
      </div>
    </div>

    <div class="scroll-hint" aria-hidden="true"><span>Scroll</span><i></i></div>
  </section>

  <!-- ===== 마퀴 밴드 : 프리미엄 브랜드 스트립 ===== -->
  <div class="marquee" aria-hidden="true">
    <div class="marquee-track">
      ${raw(Array(2).fill(
        ['Biomimetic Dentistry', '치과보철과 전문의', '중장년 심미보철', '자연치아 보존', 'All-on-X · 안모 라인 회복', '미소의 젊음을 켜다']
          .map((w) => `<span class="mq-item">${w}</span><span class="mq-dot">◆</span>`).join('')
      ).join(''))}
    </div>
  </div>

  <!-- ===== 신뢰 지표 띠 : 핵심 숫자 (의료광고법 준수 — 사실 기반) ===== -->
  <section class="trust-band" aria-label="병원 한눈에 보기">
    <div class="container">
      <ul class="trust-grid">
        <li class="trust-stat" data-reveal>
          <span class="ts-num" data-count="6">6</span><span class="ts-suffix">개 과목</span>
          <span class="ts-label">정밀 진료 운영</span>
        </li>
        <li class="trust-stat" data-reveal data-reveal-delay="1">
          <span class="ts-num">더블</span><span class="ts-suffix">보더</span>
          <span class="ts-label">보철과·통합치의학과 전문의</span>
        </li>
        <li class="trust-stat" data-reveal data-reveal-delay="2">
          <span class="ts-num" data-count="3">3</span><span class="ts-suffix">분</span>
          <span class="ts-label">1호선 온천장역 도보</span>
        </li>
        <li class="trust-stat" data-reveal data-reveal-delay="3">
          <span class="ts-num" data-count="12">12</span><span class="ts-suffix">개 지역</span>
          <span class="ts-label">부산·경남·울산 내원</span>
        </li>
      </ul>
    </div>
  </section>

  <!-- ===== 미션 한 줄 + 원장 사진 : 에디토리얼 2단 ===== -->
  <section class="section quote-section" id="home-quote">
    <div class="container">
      <div class="quote-split">
        <div class="quote" data-reveal>
          <span class="quote-eyebrow">Our Philosophy</span>
          <blockquote class="quote-big"><span>닳고 무너진 치아에,</span><span>다시 자연의 형태를.</span></blockquote>
          <p class="quote-sub">치아 하나하나의 색조와 형태, 씹는 힘까지 자연이 만든 본래의 모습에 가장 가깝게 되살립니다.</p>
          <cite class="quote-cite"><span class="cite-line"></span><span class="cite-txt">${clinic.nameKo} · 생체모방치의학</span></cite>
        </div>
        <figure class="quote-smile img-reveal" data-reveal data-reveal-delay="2">
          ${raw(picture(`/static/img/hero-smile.jpg`, `alt="자연스러운 형태로 되살린 건강한 미소 — ${clinic.nameKo} 생체모방치의학" loading="lazy"`))}
        </figure>
      </div>
    </div>
  </section>
  <style>
    .quote-section{padding-top:clamp(4rem,7vw,6.5rem);padding-bottom:clamp(4rem,7vw,6.5rem)}
    .quote-split{display:grid;grid-template-columns:1.05fr 1fr;gap:clamp(2.4rem,5vw,5rem);align-items:center}
    #home-quote .quote-eyebrow{display:inline-block;font-size:.8rem;letter-spacing:.22em;text-transform:uppercase;
      color:var(--gold);font-weight:600;margin-bottom:1.4rem}
    #home-quote .quote-big{position:relative;line-height:1.18;font-family:var(--serif-kr);font-weight:600;
      font-size:clamp(2.2rem,4vw,3.4rem);color:var(--ink);letter-spacing:-.01em;margin:0}
    #home-quote .quote-big::before{content:'\\201C';position:absolute;top:-.55em;left:-.06em;
      font-family:var(--serif);font-size:clamp(4rem,8vw,7rem);color:var(--gold);opacity:.22;line-height:1;pointer-events:none}
    #home-quote .quote-big span{display:block;white-space:nowrap}
    #home-quote .quote-sub{margin-top:1.7rem;font-size:clamp(1rem,1.3vw,1.12rem);line-height:1.85;
      color:var(--ink-2);max-width:26em;word-break:keep-all}
    #home-quote .quote-cite{display:flex;align-items:center;gap:1rem;margin-top:2.2rem;
      font-style:normal;font-size:.95rem;letter-spacing:.02em;color:var(--mist)}
    #home-quote .quote-cite .cite-line{display:inline-block;width:2.6rem;height:1px;background:var(--gold);flex:none}
    #home-quote .quote-cite .cite-txt{white-space:nowrap}
    .quote-portrait{margin:0;position:relative;border-radius:16px;overflow:hidden;
      box-shadow:0 36px 80px -34px rgba(46,58,75,.5)}
    .quote-portrait::after{content:'';position:absolute;inset:0;border:1px solid rgba(255,255,255,.14);border-radius:16px;pointer-events:none}
    .quote-portrait img{display:block;width:100%;aspect-ratio:5/6;object-fit:cover;object-position:center 18%}
    /* 미소 사진(분위기 컷): 카드/테두리/그림자 없이 가장자리를 페이드아웃해 배경에 자연스럽게 녹임 */
    .quote-smile{margin:0;position:relative}
    .quote-smile img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;object-position:center 42%;
      -webkit-mask-image:radial-gradient(72% 66% at 50% 48%, #000 30%, rgba(0,0,0,.45) 66%, transparent 92%);
              mask-image:radial-gradient(72% 66% at 50% 48%, #000 30%, rgba(0,0,0,.45) 66%, transparent 92%)}
    .quote-portrait figcaption{position:absolute;left:0;right:0;bottom:0;padding:2.6rem 1.7rem 1.4rem;
      color:#fff;letter-spacing:.01em;line-height:1.45;
      background:linear-gradient(to top,rgba(24,31,42,.88) 0%,rgba(24,31,42,.5) 50%,transparent 100%)}
    .quote-portrait figcaption strong{font-size:1.35rem;font-weight:700;font-family:var(--serif-kr)}
    .quote-portrait figcaption .role-tag{display:inline-block;margin-left:.7rem;padding:.18rem .6rem;
      font-size:.72rem;letter-spacing:.04em;border:1px solid rgba(224,201,155,.55);border-radius:999px;
      color:var(--gold-light);vertical-align:middle}
    .quote-portrait figcaption .cap-title{display:block;margin-top:.55rem;font-size:.9rem;opacity:.82}
    /* 모바일: 다른 섹션(OUR SPACE·PATIENT JOURNEY)과 동일하게 좌측 정렬 + 동일 글씨 크기/자간으로 통일 */
    @media (max-width:860px){
      .quote-split{grid-template-columns:1fr;gap:2.8rem}
      .quote-portrait{max-width:440px;width:100%}
      .quote{text-align:left;display:block;width:100%}
      #home-quote .quote-eyebrow{text-align:left}
      #home-quote .quote-big{font-size:2rem;line-height:1.1;letter-spacing:-.025em;text-align:left}
      #home-quote .quote-big::before{left:-.06em;transform:none;top:-.55em}
      #home-quote .quote-sub{font-size:1.0625rem;line-height:1.7;text-align:left;margin-left:0;margin-right:0;max-width:none}
      #home-quote .quote-cite{justify-content:flex-start}
    }
    /* 좁은 화면에서도 두 문장이 각각 한 줄을 유지하도록 폰트만 미세 조정(정렬·자간은 다른 섹션과 동일하게 유지) */
    @media (max-width:430px){
      #home-quote .quote-big{font-size:8vw}
    }
    @media (max-width:340px){
      #home-quote .quote-big{font-size:1.7rem}
      #home-quote .quote-big span{white-space:normal}
    }
  </style>

  <hr class="divider container" style="border:0;height:1px;background:var(--line)">

  <!-- ===== 핵심 진료 : 미니멀 인덱스 행 ===== -->
  <section class="section">
    <div class="container">
      <div class="sec-head" data-reveal>
        <div class="sec-index-row">
          <span class="sec-index">01</span>
          <span class="eyebrow">Core Treatments</span>
        </div>
        <h2 class="sec-title">세 가지 중심 진료</h2>
        <p class="sec-lead">“그 치과, 그 치료 잘하지.”<br>친절한 말보다 정직한 결과로 기억되고 싶습니다.<br>연세온치과는 결과물의 완성도, 유지력, 그리고 <strong>치아를 얼마나 보존하면서 얻어낸 결과인지</strong>를 가장 중요하게 봅니다.</p>
      </div>
      <div class="core-grid">
        ${raw(coreTreatments.map((t, i) =>
          '<a class="core-feature reveal reveal-d' + ((i % 3) + 1) + '" href="/treatments/' + t.slug + '">' +
            '<span class="cf-media">' +
              picture('/static/img/tx-' + t.slug + '.jpg?v=20260621b', 'alt="' + t.name + '" loading="lazy" decoding="async" width="1200" height="900"') +
              '<span class="cf-num">0' + (i + 1) + '</span>' +
            '</span>' +
            '<span class="cf-body">' +
              '<span class="cf-group">' + t.group + '</span>' +
              '<h3 class="cf-title">' + t.name + '</h3>' +
              '<span class="cf-desc">' + t.short + '</span>' +
              '<span class="cf-go">자세히 보기 <i class="fas fa-arrow-right"></i></span>' +
            '</span>' +
          '</a>'
        ).join(''))}
      </div>
      <div class="mt-3" data-reveal style="text-align:center">
        <a href="/treatments" class="link-arrow">전체 진료 안내 <i class="fas fa-arrow-right"></i></a>
      </div>
    </div>
  </section>

  <!-- ===== 진료과목별 안내 : 전 진료 상세 (기존 진료 데이터 재활용) ===== -->
  <section class="section txall-section bg-paper-2" aria-label="진료과목별 안내">
    <div class="container">
      <div class="sec-head" data-reveal>
        <div class="sec-index-row">
          <span class="sec-index">·</span>
          <span class="eyebrow">All Treatments</span>
        </div>
        <h2 class="sec-title">진료과목별 안내</h2>
        <p class="sec-lead">연세온치과가 진료하는 과목을 한눈에 정리했습니다.<br>각 진료의 접근 방식과 과정, 자주 묻는 질문은 상세 페이지에서 확인하실 수 있습니다.</p>
      </div>
      <div class="txall-grid">
        ${raw(treatments.map((t, i) => {
          const encTags = (t.encyclopediaRefs || []).slice(0, 3).map((slug) => {
            const e = encyclopedia.find((x) => x.slug === slug)
            return e ? '<a href="/encyclopedia/' + e.slug + '">' + e.term + '</a>' : ''
          }).join('')
          const symptoms = (t.symptoms || []).slice(0, 3).map((sym) => '<li>' + sym + '</li>').join('')
          return '<article class="txall-card reveal reveal-d' + ((i % 2) + 1) + '">' +
            '<div class="txall-top"><span class="txall-group">' + t.group + '</span>' +
            (t.category === 'core' ? '<span class="txall-badge">중점 진료</span>' : '') + '</div>' +
            '<h3 class="txall-title"><a href="/treatments/' + t.slug + '">' + t.name + '</a></h3>' +
            '<p class="txall-short">' + t.short + '</p>' +
            '<p class="txall-desc">' + t.hero + '</p>' +
            (symptoms ? '<ul class="txall-symptoms">' + symptoms + '</ul>' : '') +
            (encTags ? '<div class="txall-tags"><span class="txall-tags-label">관련 용어</span>' + encTags + '</div>' : '') +
            '<div class="txall-links">' +
              '<a class="link-arrow" href="/treatments/' + t.slug + '">자세히 보기 <i class="fas fa-arrow-right"></i></a>' +
              '<a class="txall-faq" href="/faq#faq-' + t.faqRef + '">' + t.name + ' FAQ</a>' +
            '</div>' +
          '</article>'
        }).join(''))}
      </div>
    </div>
  </section>
  <style>
    .txall-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:clamp(1rem,2vw,1.6rem)}
    .txall-card{border:1px solid var(--line);border-radius:8px;padding:clamp(1.4rem,2.4vw,2rem);background:var(--paper);display:flex;flex-direction:column;gap:.7rem}
    .txall-top{display:flex;align-items:center;gap:.6rem}
    .txall-group{font-size:.74rem;letter-spacing:.1em;color:var(--mist);text-transform:uppercase}
    .txall-badge{font-size:.7rem;letter-spacing:.06em;color:var(--gold-2);border:1px solid var(--gold);border-radius:99px;padding:.12rem .55rem}
    .txall-title{font-size:clamp(1.15rem,1.6vw,1.35rem);letter-spacing:-.01em}
    .txall-title a{color:var(--ink);text-decoration:none}
    .txall-title a:hover{color:var(--gold-2)}
    .txall-short{font-size:.92rem;color:var(--gold-2);font-weight:600}
    .txall-desc{font-size:.92rem;line-height:1.8;color:var(--ink-2)}
    .txall-symptoms{margin:.2rem 0 0;padding-left:1.1rem;display:flex;flex-direction:column;gap:.25rem}
    .txall-symptoms li{font-size:.86rem;line-height:1.6;color:var(--mist)}
    .txall-tags{display:flex;flex-wrap:wrap;align-items:center;gap:.4rem;margin-top:.2rem}
    .txall-tags-label{font-size:.74rem;color:var(--mist-2);margin-right:.2rem}
    .txall-tags a{font-size:.78rem;color:var(--mist);border:1px solid var(--line);border-radius:99px;padding:.18rem .6rem;text-decoration:none}
    .txall-tags a:hover{color:var(--gold-2);border-color:var(--gold)}
    .txall-links{display:flex;align-items:center;gap:1.2rem;margin-top:auto;padding-top:.6rem}
    .txall-faq{font-size:.84rem;color:var(--mist);text-decoration:underline;text-underline-offset:3px}
    .txall-faq:hover{color:var(--gold-2)}
    @media (max-width:760px){.txall-grid{grid-template-columns:1fr}}
  </style>

  <!-- ===== 진료 공간 : 매거진 화보 그리드 ===== -->
  <section class="section space-section" id="space-gallery">
    <div class="container">
      <div class="space-head" data-reveal>
        <span class="eyebrow">Our Space</span>
        <h2 class="sec-title">머무는 동안 편안하도록,<br>공간까지 진료의 일부로.</h2>
        <p class="sec-lead">빛과 동선을 섬세하게 설계했습니다.<br>진료과목별 공간 구성과 첨단 디지털 장비,<br>그리고 따뜻한 채광 속에서 진료를 받으실 수 있습니다.</p>
      </div>

      <div class="mag-grid">
        <figure class="mag-cell mag-hero img-reveal" data-reveal>
          ${raw(picture(`/static/img/photos/clinic_15.jpg`, `alt="${clinic.nameKo} 리셉션 — 로고 사인이 새겨진 메인 데스크" loading="lazy" decoding="async"`))}
          <figcaption><span class="cap-no">01</span> 리셉션 · 첫인상을 결정하는 공간</figcaption>
        </figure>

        <figure class="mag-cell mag-tall img-reveal" data-reveal data-reveal-delay="1">
          ${raw(picture(`/static/img/photos/clinic_22.jpg`, `alt="${clinic.nameKo} 진료실 — 로고가 새겨진 진료 의자와 밝은 채광" loading="lazy" decoding="async"`))}
          <figcaption><span class="cap-no">02</span> 진료실 · 채광이 드는 1인 공간</figcaption>
        </figure>

        <figure class="mag-cell img-reveal" data-reveal data-reveal-delay="2">
          ${raw(picture(`/static/img/photos/clinic_16.jpg`, `alt="${clinic.nameKo} 대기 라운지 — 소파와 자연광" loading="lazy" decoding="async"`))}
          <figcaption><span class="cap-no">03</span> 대기 라운지</figcaption>
        </figure>

        <figure class="mag-cell img-reveal" data-reveal data-reveal-delay="3">
          ${raw(picture(`/static/img/photos/clinic_03.jpg`, `alt="${clinic.nameKo} 개별 진료실 — 그린톤 인테리어와 디지털 장비" loading="lazy" decoding="async"`))}
          <figcaption><span class="cap-no">04</span> 개별 진료실</figcaption>
        </figure>

        <figure class="mag-cell mag-wide img-reveal" data-reveal data-reveal-delay="1">
          ${raw(picture(`/static/img/photos/clinic_19.jpg`, `alt="${clinic.nameKo} 브랜드 월 — 치아를 소중히 여기는 마음, 언제나 켜져 있습니다" loading="lazy" decoding="async"`))}
          <figcaption><span class="cap-no">05</span> “치아를 소중히 여기는 마음, 언제나 켜져 있습니다”</figcaption>
        </figure>

        <figure class="mag-cell img-reveal" data-reveal data-reveal-delay="2">
          ${raw(picture(`/static/img/photos/clinic_21.jpg`, `alt="${clinic.nameKo} 오픈 진료 공간 — 다수의 진료 유닛" loading="lazy" decoding="async"`))}
          <figcaption><span class="cap-no">06</span> 오픈 진료 공간</figcaption>
        </figure>

        <figure class="mag-cell img-reveal" data-reveal data-reveal-delay="3">
          ${raw(picture(`/static/img/photos/clinic_27.jpg`, `alt="${clinic.nameKo} 디지털 영상 진단실 — 3D CT 장비" loading="lazy" decoding="async"`))}
          <figcaption><span class="cap-no">07</span> 디지털 영상 진단실 (3D CT)</figcaption>
        </figure>
      </div>

      <div class="mt-3" data-reveal>
        <a href="/directions" class="link-arrow">오시는 길 · 둘러보기 <i class="fas fa-arrow-right"></i></a>
      </div>
    </div>
  </section>
  <style>
    .space-section{padding-top:clamp(4rem,7vw,6.5rem)}
    .space-head{max-width:46rem;margin-bottom:clamp(2.6rem,4vw,3.8rem)}
    .space-head .sec-title{margin:1rem 0 1.2rem}
    .mag-grid{display:grid;grid-template-columns:repeat(6,1fr);grid-auto-flow:dense;
      grid-auto-rows:clamp(125px,12vw,170px);gap:clamp(.6rem,1vw,1rem)}
    .mag-cell{position:relative;margin:0;overflow:hidden;border-radius:6px;
      grid-column:span 2;grid-row:span 2;background:var(--line)}
    .mag-cell img{width:100%;height:100%;object-fit:cover;display:block;
      transition:transform 1.1s cubic-bezier(.2,.7,.2,1)}
    .mag-cell:hover img{transform:scale(1.05)}
    .mag-cell figcaption{position:absolute;left:0;right:0;bottom:0;z-index:2;
      padding:1.7rem 1.1rem .9rem;color:#fff;font-size:.82rem;letter-spacing:.01em;line-height:1.4;
      background:linear-gradient(to top,rgba(22,29,40,.8) 0%,rgba(22,29,40,.3) 58%,transparent 100%)}
    .mag-cell .cap-no{display:inline-block;margin-right:.5rem;color:var(--gold-light);
      font-family:var(--serif);font-size:.78rem;letter-spacing:.06em}
    /* 비대칭 배치 — 6컬럼이 행마다 빈틈없이 차도록 span 합=6 */
    .mag-hero{grid-column:span 4;grid-row:span 4}   /* 큰 메인 (좌측 상단) */
    .mag-tall{grid-column:span 2;grid-row:span 4}   /* 우측 세로 (진료실) */
    .mag-wide{grid-column:span 4;grid-row:span 2}   /* 가로 와이드 (브랜드월) */
    @media (max-width:860px){
      .mag-grid{grid-template-columns:repeat(2,1fr);grid-auto-rows:clamp(120px,30vw,170px)}
      .mag-cell{grid-column:span 1;grid-row:span 2}
      .mag-hero{grid-column:span 2;grid-row:span 3}
      .mag-tall{grid-column:span 1;grid-row:span 3}
      .mag-wide{grid-column:span 2;grid-row:span 2}
      .mag-cell figcaption{font-size:.76rem;padding:1.4rem .85rem .75rem}
    }
    @media (max-width:480px){
      .mag-grid{gap:.5rem;grid-auto-rows:30vw}
    }
  </style>

  <!-- ===== 진료 여정 : 페이션트 퍼널 (인지→상담→진단→치료→사후관리) ===== -->
  <section class="section journey-section" aria-label="진료 여정">
    <div class="container">
      <div class="sec-head" data-reveal>
        <div class="sec-index-row">
          <span class="sec-index">·</span>
          <span class="eyebrow">Patient Journey</span>
        </div>
        <h2 class="sec-title">처음 오신 순간부터,<br>끝까지 함께하는 여정.</h2>
        <p class="muted" style="max-width:42rem;margin-top:1rem;line-height:1.85">한 번의 치료로 끝나지 않습니다. 정확한 진단과 충분한 설명, 그리고 치료 후 관리까지 — 단계마다 환자분이 무엇을 받게 되는지 미리 안내드립니다.</p>
      </div>
      <ol class="journey-track">
        ${raw([
          { n: '01', ic: 'fa-comments', t: '상담 접수', d: '전화·온라인으로 편하게. 불편한 점과 궁금한 점을 먼저 듣습니다.' },
          { n: '02', ic: 'fa-tooth', t: '정밀 진단', d: '구강스캔·사진·CT 등으로 현재 상태를 정확히 파악합니다.' },
          { n: '03', ic: 'fa-clipboard-list', t: '치료 계획 설명', d: '진단 결과·치료 방법·기간·비용을 함께 설명드리고 동의를 구합니다.' },
          { n: '04', ic: 'fa-hand-holding-medical', t: '치료 진행', d: '처음 설명드린 계획대로, 큰 변함없이 일관되게 진행합니다.' },
          { n: '05', ic: 'fa-heart', t: '사후 관리', d: '정기 점검과 위생 관리로 치료 결과를 오래 유지하도록 돕습니다.' },
        ].map((s, i) =>
          '<li class="journey-step reveal reveal-d' + ((i % 3) + 1) + '">' +
            '<span class="js-step">STEP ' + s.n + '</span>' +
            '<span class="js-icon"><i class="fas ' + s.ic + '"></i></span>' +
            '<span class="js-body"><span class="js-title">' + s.t + '</span>' +
            '<span class="js-desc">' + s.d + '</span></span>' +
          '</li>'
        ).join(''))}
      </ol>
    </div>
  </section>

  <!-- ===== 에디토리얼 스플릿 : 철학 ===== -->
  <section class="section">
    <div class="container">
      <div class="split">
        <figure class="figure img-reveal tooth-photo" data-reveal>
          <span class="figure-float">Biomimetic Approach</span>
          ${raw(picture(`/static/img/biomimetic-tooth-v2.jpg`, `alt="연세온치과 실제 진료 케이스 — 자연 색조와 절단연 투명감을 살린 앞니 심미 보철 결과" loading="lazy" decoding="async"`))}
          <figcaption>실제 진료 케이스 — 옆 치아와 자연스럽게 어우러지는 색조·형태 재현</figcaption>
        </figure>
        <div class="split-text" data-reveal data-reveal-delay="2">
          <div class="sec-index-row">
            <span class="sec-index">02</span>
            <span class="eyebrow">Our Philosophy</span>
          </div>
          <h2>자연이 만든 형태를<br>가장 가까이 닮게.</h2>
          <p>생체모방치의학은 자연치아의 구조와 물성을 모방하는 접근입니다. 무조건 깎아내기보다, 남은 치아를 살리고 본래의 기능과 형태를 회복하는 것을 우선합니다.</p>
          <p>특히 닳고 무너진 중장년의 앞니 — 그리고 치아·교합이 무너지며 짧아진 안모(얼굴 라인)까지, 전체 치열을 적절히 회복하면 인상의 개선에 도움을 줄 수 있습니다.</p>
          <p>화려한 수치 대신, 오래 쓰는 정직한 치료. 그것이 미소의 젊음을 오래 지키는 길이라 믿습니다.</p>
          <a href="/biomimetic" class="link-arrow mt-1">더 알아보기 <i class="fas fa-arrow-right"></i></a>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== 의료진 ===== -->
  <section class="section bg-paper-2">
    <div class="container">
      <div class="split split--reverse">
        <div class="figure figure--tall img-reveal" data-reveal style="overflow:hidden">
          <img src="${lead.photo}" alt="${lead.name} ${lead.role} — ${lead.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;object-position:center 30%">
          <span class="figure-float">${lead.name} · ${lead.role}</span>
        </div>
        <div class="split-text" data-reveal data-reveal-delay="2">
          <div class="sec-index-row">
            <span class="sec-index">03</span>
            <span class="eyebrow">Director</span>
          </div>
          <p style="font-family:var(--serif-kr);font-size:clamp(1.15rem,1.7vw,1.45rem);color:var(--gold-2);font-weight:600;margin-bottom:.9rem">안녕하세요, 대표원장 ${lead.name}입니다.</p>
          <h2>${lead.name} <span style="font-size:.4em;color:var(--mist);font-family:var(--sans);font-weight:500">${lead.role}</span></h2>
          <p class="muted" style="font-size:.95rem;margin-bottom:1.4rem">${lead.title}</p>
          <p>제가 생각하는 좋은 치과는, 환자분께서 지금보다 더 나은 삶을 영위하실 수 있도록 돕는 곳입니다.</p>
          <p class="muted" style="font-size:.92rem;line-height:1.8;margin-top:.9rem;padding-left:1rem;border-left:3px solid var(--gold)">저 역시 13세 외상으로 앞니를 다쳐 오래 보철과 함께 살아왔습니다. 앞니 하나가 인상과 자신감에 주는 무게를, 환자의 입장에서 잘 알고 있습니다.</p>
          <a href="/doctors/${lead.slug}" class="link-arrow mt-1">의료진 소개 <i class="fas fa-arrow-right"></i></a>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== 방문 안내 (미니멀 정보) ===== -->
  <section class="section">
    <div class="container">
      <div class="sec-head" data-reveal>
        <div class="sec-index-row">
          <span class="sec-index">04</span>
          <span class="eyebrow">Visit</span>
        </div>
        <h2 class="sec-title">오시는 길</h2>
      </div>
      <div class="metrics" style="border-top:1px solid var(--line)">
        <div class="metric" data-reveal>
          <div class="l" style="margin-top:0;margin-bottom:.6rem">위치</div>
          <p class="text-ink" style="font-size:1.05rem;line-height:1.6">${clinic.address}</p>
        </div>
        <div class="metric" data-reveal data-reveal-delay="1">
          <div class="l" style="margin-top:0;margin-bottom:.6rem">교통</div>
          <p class="text-ink" style="font-size:1.05rem;line-height:1.6">${clinic.subway}</p>
        </div>
        <div class="metric" data-reveal data-reveal-delay="2">
          <div class="l" style="margin-top:0;margin-bottom:.6rem">진료시간</div>
          <p class="text-ink" style="font-size:1.05rem;line-height:1.6">${clinic.hoursSummary}<br><span class="muted" style="font-size:.9rem">${clinic.closedDays}</span></p>
        </div>
        <div class="metric" data-reveal data-reveal-delay="3">
          <div class="l" style="margin-top:0;margin-bottom:.6rem">전화</div>
          <p class="text-ink" style="font-size:1.05rem;line-height:1.6"><a href="tel:${clinic.phoneRaw}" class="link-arrow">${clinic.phone}</a></p>
        </div>
      </div>
      <div class="mt-3" data-reveal>
        <a href="/directions" class="link-arrow">상세 약도 보기 <i class="fas fa-arrow-right"></i></a>
      </div>
    </div>
  </section>

  <!-- ===== 지역 안내 : 부산 전역·인근 도시 내원 안내 (로컬 SEO) ===== -->
  <section class="section region-section bg-paper-2" aria-label="지역별 내원 안내">
    <div class="container">
      <div class="sec-head" data-reveal>
        <div class="sec-index-row">
          <span class="sec-index">·</span>
          <span class="eyebrow">Local Guide</span>
        </div>
        <h2 class="sec-title">동래 온천장에서,<br>부산 전역과 인근 도시까지.</h2>
      </div>
      <div class="region-text" data-reveal>
        <p>${clinic.nameKo}은 ${clinic.address}에 있습니다. ${clinic.directions}이며, 도시철도 1호선 노선 위에 있어 부산 도심 어디서든 환승 부담이 적은 위치입니다. 건물 주차가 가능해 차량 내원도 편리합니다.</p>
        <p>병원이 자리한 동래구 온천동을 비롯해 명륜동·사직동·복산동·안락동·명장동 등 동래구 전역, 부산대학교가 있는 금정구(장전동·구서동), 연제구 연산동, 서면이 있는 부산진구에서는 지하철이나 버스로 대략 5~15분 안팎이면 도착합니다. 해운대구·수영구·남구·북구·동구 등에서도 1호선 환승 또는 차량으로 내원하고 계십니다.</p>
        <p>온천장은 경남·울산 방면 접근성도 좋은 편입니다. 양산(차량 약 25~30분), 김해(약 30~40분), 울산(약 40~50분)에서도 상담과 정기 진료를 위해 방문하십니다. 지역별 교통편과 진료 안내는 아래에서 자세히 확인하실 수 있습니다.</p>
      </div>
      <div class="region-chips" data-reveal>
        ${raw(seoRegions.map((r, i) => {
          const t = seoTreatments[i % seoTreatments.length]
          return '<a class="region-chip" href="/area/' + r.slug + '-' + t.slug + '">' + r.name + ' ' + t.name + '</a>'
        }).join(''))}
      </div>
      <div class="mt-3" data-reveal>
        <a href="/area" class="link-arrow">지역별 안내 전체 보기 <i class="fas fa-arrow-right"></i></a>
        <a href="/directions" class="link-arrow" style="margin-left:1.4rem">오시는 길 <i class="fas fa-arrow-right"></i></a>
      </div>
    </div>
  </section>
  <style>
    .region-text{max-width:52rem}
    .region-text p{font-size:.95rem;line-height:1.9;color:var(--ink-2);margin-bottom:1rem}
    .region-chips{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:1.4rem}
    .region-chip{font-size:.82rem;color:var(--mist);border:1px solid var(--line);border-radius:99px;padding:.32rem .85rem;text-decoration:none;background:var(--paper)}
    .region-chip:hover{color:var(--gold-2);border-color:var(--gold)}
  </style>

  <!-- ===== 자주 묻는 질문 (AEO — FAQPage 스키마와 일치) ===== -->
  <section class="section" id="home-faq" aria-label="자주 묻는 질문">
    <div class="container">
      <div class="sec-head" data-reveal>
        <p class="eyebrow">FAQ</p>
        <h2 class="sec-title">자주 묻는 질문</h2>
      </div>
      <div class="faq-list" style="max-width:780px;margin:2rem auto 0">
        ${raw(homeFaqs.map(faqItemHtml).join(''))}
      </div>
      <div class="hfg-wrap" style="max-width:780px;margin:2.4rem auto 0">
        ${raw(homeFaqPicks.map((g) =>
          '<div class="hfg" data-reveal>' +
            '<p class="hfg-label"><span class="eyebrow">' + g.label + '</span></p>' +
            '<div class="faq-list">' + g.faqs.map(faqItemHtml).join('') + '</div>' +
            '<p class="hfg-more"><a class="link-arrow" href="/faq#faq-' + g.key + '">' + g.label + ' FAQ 전체 보기 <i class="fas fa-arrow-right"></i></a></p>' +
          '</div>'
        ).join(''))}
      </div>
      <style>
        .hfg{margin-top:2.4rem}
        .hfg-label{margin-bottom:.3rem}
        .hfg-more{margin-top:.9rem;font-size:.9rem}
      </style>
      <p style="text-align:center;margin-top:2.2rem" data-reveal>
        <a href="/faq" class="link-arrow">진료별 전체 FAQ 보기 <i class="fas fa-arrow-right"></i></a>
      </p>
    </div>
  </section>

  <!-- ===== 콘텐츠 허브 : 사이트 콘텐츠 링크 그리드 ===== -->
  <section class="section hub-section" aria-label="콘텐츠 둘러보기">
    <div class="container">
      <div class="sec-head" data-reveal>
        <div class="sec-index-row">
          <span class="sec-index">·</span>
          <span class="eyebrow">Explore</span>
        </div>
        <h2 class="sec-title">더 깊이 알아보기</h2>
        <p class="sec-lead">진료 정보부터 치과 상식까지 — 연세온치과가 직접 정리한 콘텐츠입니다.</p>
      </div>
      <div class="hub-grid">
        ${raw([
          { href: '/encyclopedia', ic: 'fa-book-open', t: '치과 백과사전', d: '생체모방치의학부터 임플란트·심미보철·잇몸 질환까지, 치과 용어와 치료 개념을 질문-답변형으로 정리한 ' + encyclopedia.length + '개 항목의 일반 치의학 정보입니다.' },
          { href: '/column', ic: 'fa-pen-nib', t: '원장 칼럼', d: '대표원장이 직접 쓰는 진료 이야기와 구강 건강 정보를 연재합니다.' },
          { href: '/cases/gallery', ic: 'fa-images', t: '치료 사례', d: '진료과목·지역별로 정리한 치료 사례 기록입니다.' },
          { href: '/video', ic: 'fa-video', t: '진료 영상', d: '병원과 진료를 소개하는 공식 유튜브 영상 모음입니다.' },
          { href: '/faq', ic: 'fa-circle-question', t: '자주 묻는 질문', d: '심미보철·임플란트·접착수복·턱관절 등 진료별 질문 ' + Object.values(faqGroups).reduce((n, g) => n + g.faqs.length, 0) + '개를 모았습니다.' },
          { href: '/pricing', ic: 'fa-won-sign', t: '비급여 진료비 안내', d: '의료법에 따라 고지하는 비급여 항목별 진료 비용 안내입니다.' },
          { href: '/doctors', ic: 'fa-user-doctor', t: '의료진 소개', d: '치과보철과·통합치의학과 전문의 대표원장의 진료 철학을 소개합니다.' },
          { href: '/mission', ic: 'fa-heart', t: '병원 이야기', d: '연세온이라는 이름에 담긴 세 가지 "온"의 의미를 전합니다.' },
          { href: '/biomimetic', ic: 'fa-tooth', t: '생체모방치의학', d: '자연치아를 닮게, 최대한 보존하며 치료하는 접근을 설명합니다.' },
          { href: '/notice', ic: 'fa-bullhorn', t: '공지사항', d: '진료 일정과 병원 소식을 안내합니다.' },
          { href: '/directions', ic: 'fa-map-location-dot', t: '오시는 길', d: '온천장역 도보 3분 — 주차·교통편 상세 안내입니다.' },
          { href: '/reservation', ic: 'fa-calendar-check', t: '예약 상담', d: '온라인으로 편하게 상담을 신청하실 수 있습니다.' },
        ].map((h, i) =>
          '<a class="hub-card reveal reveal-d' + ((i % 3) + 1) + '" href="' + h.href + '">' +
            '<span class="hub-ic"><i class="fas ' + h.ic + '"></i></span>' +
            '<span class="hub-t">' + h.t + '</span>' +
            '<span class="hub-d">' + h.d + '</span>' +
          '</a>'
        ).join(''))}
      </div>
      <div class="hub-terms" data-reveal>
        <p class="hub-terms-label">자주 찾는 백과사전 용어</p>
        <div class="hub-terms-chips">
          ${raw(encHubSlugs.map((slug) => {
            const e = encyclopedia.find((x) => x.slug === slug)
            return e ? '<a href="/encyclopedia/' + e.slug + '">' + e.term + '</a>' : ''
          }).join(''))}
        </div>
      </div>
    </div>
  </section>
  <style>
    .hub-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(.8rem,1.6vw,1.2rem)}
    .hub-card{display:flex;flex-direction:column;gap:.45rem;border:1px solid var(--line);border-radius:8px;
      padding:clamp(1.2rem,2vw,1.6rem);background:var(--paper);text-decoration:none;
      transition:border-color .25s ease,transform .25s ease}
    .hub-card:hover{border-color:var(--gold);transform:translateY(-2px)}
    .hub-ic{color:var(--gold-2);font-size:1.05rem}
    .hub-t{font-weight:700;color:var(--ink);letter-spacing:-.01em}
    .hub-d{font-size:.85rem;line-height:1.65;color:var(--mist)}
    .hub-terms{margin-top:clamp(2rem,3vw,2.8rem)}
    .hub-terms-label{font-size:.78rem;letter-spacing:.1em;color:var(--mist-2);text-transform:uppercase;margin-bottom:.7rem}
    .hub-terms-chips{display:flex;flex-wrap:wrap;gap:.45rem}
    .hub-terms-chips a{font-size:.82rem;color:var(--mist);border:1px solid var(--line);border-radius:99px;
      padding:.3rem .8rem;text-decoration:none;background:var(--paper)}
    .hub-terms-chips a:hover{color:var(--gold-2);border-color:var(--gold)}
    @media (max-width:860px){.hub-grid{grid-template-columns:repeat(2,1fr)}}
    @media (max-width:520px){.hub-grid{grid-template-columns:1fr}}
  </style>

  <!-- ===== CTA 밴드 ===== -->
  <section class="section cta-band">
    <div class="cta-orbit" aria-hidden="true">
      <svg viewBox="0 0 600 600" fill="none">
        <circle cx="300" cy="300" r="250" stroke="var(--gold-light)" stroke-width=".8" opacity=".4"/>
        <circle cx="300" cy="300" r="290" stroke="var(--gold-light)" stroke-width=".5" stroke-dasharray="2 12" opacity=".35" class="orbit-dash"/>
        <g class="orbit-rot"><circle cx="300" cy="50" r="3.5" fill="var(--gold-light)"/></g>
      </svg>
    </div>
    <div class="container">
      <h2 data-reveal>당신의 미소,<br>지금 다시 켜질 수 있습니다.</h2>
      <p data-reveal data-reveal-delay="1">진단부터 차근차근. 부담 없이 상담부터 시작하세요.</p>
      <a href="/reservation" class="btn btn-primary" data-reveal data-reveal-delay="2">예약 상담 신청 <i class="fas fa-arrow-right"></i></a>
    </div>
  </section>

  <!-- ===== 공지 팝업 (관리자에서 ON 한 공지를 동적으로 표시) ===== -->
  <div id="noticePopupRoot" aria-live="polite"></div>
  <style>
    #noticePopupRoot .np-overlay{position:fixed;inset:0;z-index:9999;background:rgba(14,22,38,.55);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:1.2rem;opacity:0;transition:opacity .3s ease}
    #noticePopupRoot .np-overlay.show{opacity:1}
    #noticePopupRoot .np-card{background:#fff;border-radius:18px;max-width:420px;width:100%;overflow:hidden;box-shadow:0 30px 80px rgba(10,18,34,.45);transform:translateY(18px) scale(.98);transition:transform .35s cubic-bezier(.16,1,.3,1);max-height:88vh;display:flex;flex-direction:column}
    #noticePopupRoot .np-overlay.show .np-card{transform:none}
    #noticePopupRoot .np-img{width:100%;aspect-ratio:4/3;object-fit:cover;background:#f1ece0;display:block}
    #noticePopupRoot .np-body{padding:1.6rem 1.7rem;overflow-y:auto}
    #noticePopupRoot .np-eyebrow{font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:var(--gold,#C59F66);font-weight:600;margin-bottom:.5rem}
    #noticePopupRoot .np-title{font-size:1.25rem;font-weight:700;line-height:1.35;color:var(--ink,#14243E);margin-bottom:.8rem;letter-spacing:-.02em}
    #noticePopupRoot .np-content{font-size:.93rem;line-height:1.7;color:#4a5364}
    #noticePopupRoot .np-content p{margin:0 0 .6rem}
    #noticePopupRoot .np-content img{max-width:100%;border-radius:8px;margin:.5rem 0}
    #noticePopupRoot .np-cta{display:inline-flex;align-items:center;gap:.4rem;margin-top:1.1rem;background:var(--ink,#14243E);color:#fff;padding:.7rem 1.3rem;border-radius:9px;font-size:.9rem;font-weight:600;text-decoration:none}
    #noticePopupRoot .np-foot{display:flex;justify-content:space-between;align-items:center;padding:.8rem 1.5rem;border-top:1px solid #eee5d4;background:#faf8f2}
    #noticePopupRoot .np-foot button{background:none;border:0;font:inherit;color:#8A93A6;font-size:.85rem;cursor:pointer;padding:.3rem .2rem}
    #noticePopupRoot .np-foot button:hover{color:#14243E}
    #noticePopupRoot .np-dots{display:flex;gap:.4rem;justify-content:center;padding:.6rem 0 0}
    #noticePopupRoot .np-dots span{width:7px;height:7px;border-radius:50%;background:#d8cfba;cursor:pointer;transition:background .2s}
    #noticePopupRoot .np-dots span.on{background:var(--gold,#C59F66)}
  </style>
  ${raw(`<script>
  (function(){
    function dismissedToday(id){
      try{ return localStorage.getItem('np_hide_'+id) === new Date().toISOString().slice(0,10); }catch(e){ return false; }
    }
    function hideToday(id){
      try{ localStorage.setItem('np_hide_'+id, new Date().toISOString().slice(0,10)); }catch(e){}
    }
    fetch('/api/popups').then(function(r){ return r.json(); }).then(function(d){
      if(!d || !d.ok || !d.popups || !d.popups.length) return;
      var items = d.popups.filter(function(p){ return !dismissedToday(p.id); });
      if(!items.length) return;
      var root = document.getElementById('noticePopupRoot');
      var i = 0;
      var ov = document.createElement('div');
      ov.className = 'np-overlay';
      root.appendChild(ov);
      function render(){
        var p = items[i];
        var cta = '<a class="np-cta" href="'+ (p.link || ('/notice/'+p.id)) +'">자세히 보기 <i class="fas fa-arrow-right"></i></a>';
        var img = p.image ? '<img class="np-img" src="'+p.image+'" alt="'+ (p.title ? p.title.replace(/"/g,'&quot;') : '연세온치과의원 공지') +'">' : '';
        var dots = items.length>1 ? '<div class="np-dots">'+items.map(function(_,k){return '<span class="'+(k===i?'on':'')+'" data-k="'+k+'"></span>';}).join('')+'</div>' : '';
        ov.innerHTML = '<div class="np-card" role="dialog" aria-modal="true" aria-label="공지 팝업">'+
          img +
          '<div class="np-body"><div class="np-eyebrow">연세온치과 공지</div>'+
          '<div class="np-title">'+p.title+'</div>'+
          '<div class="np-content">'+p.contentHtml+'</div>'+ cta +'</div>'+
          dots +
          '<div class="np-foot"><button data-act="today">오늘 하루 보지 않기</button><button data-act="close">닫기 ✕</button></div>'+
        '</div>';
        ov.querySelectorAll('.np-dots span').forEach(function(s){
          s.addEventListener('click', function(){ i = +this.getAttribute('data-k'); render(); });
        });
        ov.querySelector('[data-act="today"]').addEventListener('click', function(){ hideToday(p.id); next(); });
        ov.querySelector('[data-act="close"]').addEventListener('click', next);
      }
      function next(){
        if(i < items.length-1){ i++; render(); }
        else { close(); }
      }
      function close(){
        ov.classList.remove('show');
        setTimeout(function(){ ov.remove(); }, 320);
      }
      ov.addEventListener('click', function(e){ if(e.target===ov) close(); });
      document.addEventListener('keydown', function onEsc(e){ if(e.key==='Escape'){ close(); document.removeEventListener('keydown', onEsc); } });
      render();
      requestAnimationFrame(function(){ requestAnimationFrame(function(){ ov.classList.add('show'); }); });
    }).catch(function(){});
  })();
  </script>`)}
  `

  return Layout(meta, body)
}
