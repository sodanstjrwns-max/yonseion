import { html, raw } from 'hono/html'
import { clinic } from '../data/clinic'
import { coreTreatments, treatmentGroups, treatmentsByGroup } from '../data/treatments'

// 정적 CSS 캐시 버스팅용 버전 — app.css 변경 시 이 값을 올리면 엣지/브라우저 캐시가 갱신됨
const ASSET_VER = '20260621u'

export interface SeoMeta {
  title: string
  description: string
  path: string            // canonical path, e.g. /treatments/all-on-x
  keywords?: string       // 페이지별 키워드(선택). 없으면 기본 지역 키워드 사용
  ogImage?: string
  jsonLd?: object | object[]
  breadcrumb?: { name: string; url: string }[]
}

// 기본 키워드(주로 네이버 대응) — 페이지에서 meta.keywords로 덮어쓸 수 있음
const DEFAULT_KEYWORDS = '부산치과, 동래구치과, 온천동치과, 온천장역치과, 연세온치과, 임플란트, 심미보철, 생체모방치의학, 부산임플란트, 동래임플란트'

// 미니멀 로고 마크 — 단색 잉크 라인. 'ㅇ'(연세온의 ON) 모티프를 절제된 원으로
export function logoMark() {
  // 네이비 링 + 골드 코어 — "켜다(On)" 스위치 모티프. 로드 시 스트로크 드로잉.
  return `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="lm">
    <circle class="lm-ring" cx="20" cy="20" r="15.5" stroke="currentColor" stroke-width="1.6" pathLength="100"/>
    <path class="lm-stem" d="M20 9.5v21" stroke="currentColor" stroke-width="1.6" pathLength="100"/>
    <circle class="lm-core" cx="20" cy="20" r="3.4" fill="#C59F66"/>
  </svg>`
}

// 키네틱 타이포 — 단어 마스크 + 글자 단위 stagger reveal
// 단어를 .kw(overflow:hidden)로 감싸고, 각 글자를 .kc로 분할해 순차 등장
export function kinetic(text: string): string {
  return text.split(' ').map((w) => {
    const chars = Array.from(w).map((ch) => `<span class="kc">${ch}</span>`).join('')
    return `<span class="kw"><span class="kw-i">${chars}</span></span>`
  }).join(' ')
}

// --------- HEADER (with mega menu) ---------
function Header() {
  const groups = treatmentGroups
  return html`
  <header class="site-header">
    <div class="nav-inner">
      <a href="/" class="logo logo-img" aria-label="${clinic.nameKo} 홈">
        <img src="/static/img/logo-horizontal-color-t.png" alt="${clinic.nameKo}" width="320" height="110" decoding="async" />
      </a>
      <nav class="gnb" aria-label="주 메뉴">
        <a href="/mission" class="nav-link">병원미션</a>
        <a href="/biomimetic" class="nav-link">생체모방치의학</a>
        <a href="/doctors" class="nav-link">의료진</a>
        <div class="has-mega">
          <a href="/treatments" class="nav-link">진료 <i class="fas fa-chevron-down" style="font-size:.6rem;margin-left:2px"></i></a>
          <div class="mega" role="menu">
            <div class="mega-inner">
              ${raw(groups.map((g) => `
                <div class="mega-col">
                  <p class="mega-title">${g}</p>
                  ${treatmentsByGroup(g).map((t) => `
                    <a class="mega-item" href="/treatments/${t.slug}">${t.name}${t.category === 'core' ? '<span class="badge">핵심</span>' : ''}</a>
                  `).join('')}
                </div>
              `).join(''))}
            </div>
          </div>
        </div>
        <div class="has-mega">
          <a href="/cases/gallery" class="nav-link">콘텐츠 <i class="fas fa-chevron-down" style="font-size:.6rem;margin-left:2px"></i></a>
          <div class="mega" role="menu">
            <div class="mega-inner">
              <div class="mega-col"><p class="mega-title">케이스</p>
                <a class="mega-item" href="/cases/gallery">비포 / 애프터</a>
              </div>
              <div class="mega-col"><p class="mega-title">지식</p>
                <a class="mega-item" href="/column">원장 칼럼</a>
                <a class="mega-item" href="/encyclopedia">치과 백과사전</a>
              </div>
              <div class="mega-col"><p class="mega-title">영상</p>
                <a class="mega-item" href="/video">병원 영상</a>
              </div>
              <div class="mega-col"><p class="mega-title">안내</p>
                <a class="mega-item" href="/pricing">진료비용 안내</a>
                <a class="mega-item" href="/faq">자주 묻는 질문</a>
                <a class="mega-item" href="/notice">공지사항</a>
              </div>
            </div>
          </div>
        </div>
        <a href="/directions" class="nav-link">오시는 길</a>
      </nav>
      <a href="/reservation" class="header-cta">예약 상담 <i class="fas fa-arrow-right" style="font-size:.75rem"></i></a>
      <button class="nav-toggle" aria-label="메뉴 열기"><span></span><span></span><span></span></button>
    </div>
  </header>

  <div class="mobile-nav">
    <button class="mobile-close" aria-label="닫기">&times;</button>
    <a href="/mission">병원미션</a>
    <a href="/biomimetic">생체모방치의학</a>
    <a href="/doctors">의료진</a>
    <a href="/treatments">진료</a>
    ${raw(coreTreatments.map((t) => `<a class="sub" href="/treatments/${t.slug}">— ${t.name}</a>`).join(''))}
    <a href="/cases/gallery">비포 / 애프터</a>
    <a href="/column">원장 칼럼</a>
    <a href="/encyclopedia">백과사전</a>
    <a href="/pricing">진료비용 안내</a>
    <a href="/faq">자주 묻는 질문</a>
    <a href="/directions">오시는 길</a>
    <a href="/login" style="font-size:.88rem;opacity:.8">로그인 / 회원가입</a>
    <a href="/reservation" class="link-arrow">예약 상담 →</a>
  </div>
  `
}

// --------- FOOTER ---------
function Footer() {
  const sns = []
  if (clinic.sns.instagram) sns.push(`<a href="${clinic.sns.instagram}" target="_blank" rel="noopener"><i class="fab fa-instagram"></i> 인스타그램</a>`)
  if (clinic.sns.youtube) sns.push(`<a href="${clinic.sns.youtube}" target="_blank" rel="noopener"><i class="fab fa-youtube"></i> 유튜브</a>`)
  if (clinic.sns.blog) sns.push(`<a href="${clinic.sns.blog}" target="_blank" rel="noopener"><i class="fas fa-blog"></i> 블로그</a>`)
  if (clinic.sns.naverBooking) sns.push(`<a href="${clinic.sns.naverBooking}" target="_blank" rel="noopener"><i class="fas fa-calendar-check"></i> 네이버 예약</a>`)
  if (clinic.sns.naverPlace) sns.push(`<a href="${clinic.sns.naverPlace}" target="_blank" rel="noopener"><i class="fas fa-map-location-dot"></i> 네이버플레이스</a>`)
  if (clinic.sns.kakaoChannel) sns.push(`<a href="${clinic.sns.kakaoChannel}" target="_blank" rel="noopener"><i class="fas fa-comment"></i> 카카오톡 채널</a>`)
  return html`
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <div class="logo logo-img" style="margin-bottom:1.4rem">
            <img src="/static/img/logo-horizontal-color-t.png" alt="${clinic.nameKo}" width="360" height="124" decoding="async" />
          </div>
          <p style="max-width:320px;line-height:1.8;color:var(--mist)">
            ${clinic.mission}
          </p>
        </div>
        <div>
          <p class="foot-title">바로가기</p>
          <a href="/mission">병원미션</a>
          <a href="/biomimetic">생체모방치의학</a>
          <a href="/doctors">의료진</a>
          <a href="/treatments">진료안내</a>
          <a href="/cases/gallery">비포/애프터</a>
        </div>
        <div>
          <p class="foot-title">안내</p>
          <a href="/directions">오시는 길</a>
          <a href="/pricing">비용 안내</a>
          <a href="/faq">자주 묻는 질문</a>
          <a href="/notice">공지사항</a>
          <a href="/reservation">예약 상담</a>
          <a href="/signup">회원가입</a>
          <a href="/login">로그인</a>
        </div>
        <div>
          <p class="foot-title">연락처</p>
          <a href="tel:${clinic.phoneRaw}"><i class="fas fa-phone" style="font-size:.8rem"></i> ${clinic.phone}</a>
          <a href="mailto:${clinic.email}"><i class="fas fa-envelope" style="font-size:.8rem"></i> ${clinic.email}</a>
          <p style="margin-top:.8rem;color:var(--mist)">${clinic.address}</p>
          <p style="color:var(--mist)">${clinic.subway}</p>
          ${sns.length ? raw('<div style="margin-top:1rem;display:flex;flex-direction:column;gap:.2rem">' + sns.join('') + '</div>') : ''}
        </div>
      </div>

      <p class="footer-legal">
        ${clinic.business.company} · 대표자 ${clinic.business.owner} · 사업자등록번호 ${clinic.business.bizNo} (부가가치세 면세사업자) · ${clinic.address} · 개업 ${clinic.business.openDate} · TEL ${clinic.phone}<br>
        본 사이트의 진료 정보는 일반적인 의학 정보이며, 개인의 상태에 따라 진단·치료 방법과 결과가 다를 수 있습니다. 정확한 내용은 내원하여 전문의와 상담하시기 바랍니다. 의료광고는 관련 법령을 준수합니다.
      </p>
      <div class="footer-bottom">
        <span>&copy; ${new Date().getFullYear()} ${clinic.nameKo}. All rights reserved.</span>
        <span style="display:flex;gap:1.2rem">
          <a href="/privacy">개인정보처리방침</a>
          <a href="/terms">이용약관</a>
          <a href="/sitemap.xml">사이트맵</a>
        </span>
      </div>
    </div>
  </footer>`
}

// --------- FULL PAGE SHELL ---------
export function Layout(meta: SeoMeta, body: ReturnType<typeof html>) {
  const canonical = clinic.domain + meta.path
  const ogImage = meta.ogImage || clinic.domain + '/static/img/og-default.jpg'
  const jsonLdArr = meta.jsonLd ? (Array.isArray(meta.jsonLd) ? meta.jsonLd : [meta.jsonLd]) : []

  const fabItems = [
    clinic.sns.naverBooking ? `<a href="${clinic.sns.naverBooking}" target="_blank" rel="noopener" class="fab-item fab-naver" data-label="네이버 예약"><i class="fas fa-calendar-check"></i></a>` : '',
    clinic.sns.kakaoChannel ? `<a href="${clinic.sns.kakaoChannel}" target="_blank" rel="noopener" class="fab-item fab-kakao" data-label="카카오톡 상담"><i class="fas fa-comment"></i></a>` : '',
    clinic.sns.naverPlace ? `<a href="${clinic.sns.naverPlace}" target="_blank" rel="noopener" class="fab-item fab-place" data-label="네이버 플레이스"><i class="fas fa-location-dot"></i></a>` : '',
    `<a href="tel:${clinic.phoneRaw}" class="fab-item fab-tel" data-label="전화 ${clinic.phone}"><i class="fas fa-phone"></i></a>`,
  ].join('')
  const fabHtml =
    `<div class="fab" id="quick-fab">` +
      `<div class="fab-menu" id="fab-menu" aria-hidden="true">${fabItems}</div>` +
      `<button type="button" class="fab-toggle" id="fab-toggle" aria-expanded="false" aria-controls="fab-menu" aria-label="빠른 상담 메뉴 열기">` +
        `<i class="fas fa-headset fab-ic-open"></i><i class="fas fa-xmark fab-ic-close"></i>` +
      `</button>` +
    `</div>`

  return html`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${meta.title}</title>
  <meta name="description" content="${meta.description}">
  <meta name="keywords" content="${meta.keywords || DEFAULT_KEYWORDS}">
  <link rel="canonical" href="${canonical}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="theme-color" content="${clinic.brand.paper}">

  <!-- 검색엔진 소유권 인증 (Search Engine Verification) -->
  <!-- 구글 서치콘솔: 발급 코드로 content 값 교체 -->
  <meta name="google-site-verification" content="">
  <!-- 네이버 서치어드바이저: 발급 코드로 content 값 교체 -->
  <meta name="naver-site-verification" content="5f2e390bb9247da01f5983bfa2664e4003b21289">
  <!-- 빙 웹마스터: 발급 코드로 content 값 교체 -->
  <meta name="msvalidate.01" content="">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${clinic.nameKo}">
  <meta property="og:title" content="${meta.title}">
  <meta property="og:description" content="${meta.description}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${clinic.nameKo} — ${clinic.tagline}">
  <meta property="og:locale" content="ko_KR">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${meta.title}">
  <meta name="twitter:description" content="${meta.description}">
  <meta name="twitter:image" content="${ogImage}">

  <!-- 지역(Local) 시그널 — 네이버/구글 로컬 SEO 보조 -->
  <meta name="geo.region" content="KR-26">
  <meta name="geo.placename" content="${clinic.addressLocality}">
  <meta name="geo.position" content="${clinic.geo.lat};${clinic.geo.lng}">
  <meta name="ICBM" content="${clinic.geo.lat}, ${clinic.geo.lng}">
  <meta name="author" content="${clinic.nameKo}">
  <meta name="format-detection" content="telephone=yes">

  <!-- Fonts — preconnect(crossorigin) + 본문 우선 폰트 preload 로 LCP 단축 -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
  <link rel="preload" as="style" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,400&display=swap">
  <link rel="preload" as="style" href="/static/css/app.css?v=${ASSET_VER}">
  <link rel="stylesheet" href="/static/css/app.css?v=${ASSET_VER}">
  <!-- FontAwesome 는 아이콘 전용 — 본문 렌더링 차단 방지 위해 비동기 로드 -->
  <link rel="preload" as="style" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.1/css/all.min.css" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.1/css/all.min.css"></noscript>

  <link rel="icon" type="image/svg+xml" href="/static/img/favicon.svg">
  <link rel="apple-touch-icon" href="/static/img/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="${clinic.nameKo}">

  ${raw(jsonLdArr.map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n'))}
</head>
<body>
  <div class="scroll-progress" aria-hidden="true"><i></i></div>
  ${Header()}
  <main>${body}</main>
  ${Footer()}
  <nav class="sticky-cta" aria-label="빠른 상담">
    <a href="tel:${clinic.phoneRaw}" class="call"><i class="fas fa-phone"></i><span>전화</span></a>
    <a href="${clinic.sns.kakaoChannel}" target="_blank" rel="noopener" class="kakao"><i class="fas fa-comment"></i><span>카카오</span></a>
    <a href="/reservation" class="book"><i class="fas fa-calendar-check"></i><span>예약 신청</span></a>
  </nav>

  <!-- 우하단 플로팅 빠른 연결 (데스크톱·태블릿) -->
  ${raw(fabHtml)}
  <script src="https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.min.js" defer></script>
  <script src="/static/js/regions.js?v=${ASSET_VER}" defer></script>
  <script src="/static/js/minimal.js?v=${ASSET_VER}" defer></script>
</body>
</html>`
}

// --------- Breadcrumb component ---------
export function Breadcrumb(items: { name: string; url: string }[]) {
  return html`<div class="container"><nav class="breadcrumb" aria-label="이동 경로">
    ${raw(items.map((it, i) => i < items.length - 1
      ? `<a href="${it.url}">${it.name}</a><i class="fas fa-chevron-right"></i>`
      : `<span>${it.name}</span>`).join(''))}
  </nav></div>`
}
