import { html, raw } from 'hono/html'
import { clinic } from '../data/clinic'
import { coreTreatments, treatmentGroups, treatmentsByGroup } from '../data/treatments'

export interface SeoMeta {
  title: string
  description: string
  path: string            // canonical path, e.g. /treatments/all-on-x
  ogImage?: string
  jsonLd?: object | object[]
  breadcrumb?: { name: string; url: string }[]
}

// 미니멀 로고 마크 — 단색 잉크 라인. 'ㅇ'(연세온의 ON) 모티프를 절제된 원으로
export function logoMark() {
  return `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="20" cy="20" r="15.5" stroke="currentColor" stroke-width="1.6"/>
    <path d="M20 9.5v21" stroke="currentColor" stroke-width="1.6"/>
    <circle cx="20" cy="20" r="3" fill="currentColor"/>
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
      <a href="/" class="logo" aria-label="${clinic.nameKo} 홈" style="color:var(--ink)">
        <span class="logo-mark">${raw(logoMark())}</span>
        <span class="logo-text">${clinic.nameKo}<small>YEONSEON ON DENTAL</small></span>
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
                  <h4>${g}</h4>
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
              <div class="mega-col"><h4>케이스</h4>
                <a class="mega-item" href="/cases/gallery">비포 / 애프터</a>
              </div>
              <div class="mega-col"><h4>지식</h4>
                <a class="mega-item" href="/column">원장 칼럼</a>
                <a class="mega-item" href="/encyclopedia">치과 백과사전</a>
              </div>
              <div class="mega-col"><h4>영상</h4>
                <a class="mega-item" href="/video">병원 영상</a>
              </div>
              <div class="mega-col"><h4>안내</h4>
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
    <a href="/faq">자주 묻는 질문</a>
    <a href="/directions">오시는 길</a>
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
  if (clinic.sns.naverPlace) sns.push(`<a href="${clinic.sns.naverPlace}" target="_blank" rel="noopener"><i class="fas fa-map-location-dot"></i> 네이버플레이스</a>`)
  if (clinic.sns.kakaoChannel) sns.push(`<a href="${clinic.sns.kakaoChannel}" target="_blank" rel="noopener"><i class="fas fa-comment"></i> 카카오톡 채널</a>`)
  return html`
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <div class="logo" style="margin-bottom:1.4rem;color:var(--ink)">
            <span class="logo-mark">${raw(logoMark())}</span>
            <span class="logo-text">${clinic.nameKo}<small>${clinic.tagline}</small></span>
          </div>
          <p style="max-width:320px;line-height:1.8;color:var(--mist)">
            ${clinic.mission}
          </p>
        </div>
        <div>
          <h5>바로가기</h5>
          <a href="/mission">병원미션</a>
          <a href="/biomimetic">생체모방치의학</a>
          <a href="/doctors">의료진</a>
          <a href="/treatments">진료안내</a>
          <a href="/cases/gallery">비포/애프터</a>
        </div>
        <div>
          <h5>안내</h5>
          <a href="/directions">오시는 길</a>
          <a href="/pricing">비용 안내</a>
          <a href="/faq">자주 묻는 질문</a>
          <a href="/notice">공지사항</a>
          <a href="/reservation">예약 상담</a>
        </div>
        <div>
          <h5>연락처</h5>
          <a href="tel:${clinic.phoneRaw}"><i class="fas fa-phone" style="font-size:.8rem"></i> ${clinic.phone}</a>
          <a href="mailto:${clinic.email}"><i class="fas fa-envelope" style="font-size:.8rem"></i> ${clinic.email}</a>
          <p style="margin-top:.8rem;color:var(--mist)">${clinic.address}</p>
          <p style="color:var(--mist)">${clinic.subway}</p>
          ${sns.length ? raw('<div style="margin-top:1rem;display:flex;flex-direction:column;gap:.2rem">' + sns.join('') + '</div>') : ''}
        </div>
      </div>

      <p class="footer-legal">
        ${clinic.business.company} · 대표자 ${clinic.business.owner} · 사업자등록번호 ${clinic.business.bizNo} · ${clinic.address} · 개업 ${clinic.business.openDate} · TEL ${clinic.phone}<br>
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

  return html`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${meta.title}</title>
  <meta name="description" content="${meta.description}">
  <link rel="canonical" href="${canonical}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="theme-color" content="${clinic.brand.paper}">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${clinic.nameKo}">
  <meta property="og:title" content="${meta.title}">
  <meta property="og:description" content="${meta.description}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:locale" content="ko_KR">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${meta.title}">
  <meta name="twitter:description" content="${meta.description}">
  <meta name="twitter:image" content="${ogImage}">

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://cdn.jsdelivr.net">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,400&display=swap">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.1/css/all.min.css">
  <link rel="stylesheet" href="/static/css/app.css">

  <link rel="icon" type="image/svg+xml" href="/static/img/favicon.svg">
  <link rel="apple-touch-icon" href="/static/img/apple-touch-icon.png">

  ${raw(jsonLdArr.map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n'))}
</head>
<body>
  ${Header()}
  <main>${body}</main>
  ${Footer()}
  <nav class="sticky-cta" aria-label="빠른 상담">
    <a href="tel:${clinic.phoneRaw}" class="call"><i class="fas fa-phone"></i> 전화 상담</a>
    <a href="/reservation" class="book"><i class="fas fa-calendar-check"></i> 예약 신청</a>
  </nav>
  <script src="https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.min.js"></script>
  <script src="/static/js/regions.js" defer></script>
  <script src="/static/js/minimal.js" defer></script>
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
