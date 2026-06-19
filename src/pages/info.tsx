import { html, raw } from 'hono/html'
import { Layout, Breadcrumb } from '../components/layout'
import { FaqAccordion } from '../components/faq'
import { clinic } from '../data/clinic'
import { faqGroups, allFaqs } from '../data/faqs'
import { priceGroups, pricingNotes } from '../data/pricing'
import { breadcrumbSchema, faqSchema } from '../lib/schema'

// ============================================================================
// 정보·신뢰 페이지: FAQ 전체 / 비용 안내 / 오시는 길 / 개인정보 / 이용약관
// ============================================================================

// ---------- FAQ 전체 ----------
export function FaqPage() {
  const crumb = [{ name: '홈', url: '/' }, { name: '자주 묻는 질문', url: '/faq' }]
  const groups = Object.entries(faqGroups)
  const fullBody = html`
  <section class="page-hero">
    <div class="container">
      <p class="eyebrow">FAQ</p>
      <h1>자주 묻는 질문</h1>
      <p class="lead">환자분들이 가장 많이 궁금해하시는 내용을 모았습니다.</p>
    </div>
  </section>
  ${Breadcrumb(crumb)}

  <section class="section--tight">
    <div class="container">
      <nav class="faq-tabs" data-reveal aria-label="FAQ 분류">
        ${raw(groups.map(([key, g]) => `<a href="#faq-${key}" class="faq-tab">${g.label}</a>`).join(''))}
      </nav>
      ${raw(groups.map(([key, g]) => `
        <section class="faq-group" id="faq-${key}" style="margin-bottom:3rem">
          <h2 style="font-family:var(--serif-kr);font-size:var(--t-h3);margin:3rem 0 .5rem">${g.label}</h2>
          <div class="faq-list">
            ${g.faqs.map((f) => `
              <div class="faq-item">
                <button class="faq-q"><span>${f.q}</span><i class="fas fa-plus"></i></button>
                <div class="faq-a"><div class="faq-a-inner"><p>${f.a}</p></div></div>
              </div>`).join('')}
          </div>
        </section>`).join(''))}

      <div class="cta-inline" data-reveal>
        <p>찾으시는 답변이 없으신가요? 편하게 문의해 주세요.</p>
        <div style="display:flex;gap:1rem;flex-wrap:wrap">
          <a href="/reservation" class="btn btn-primary">예약 상담 <i class="fas fa-arrow-right"></i></a>
          <a href="tel:${clinic.phoneRaw}" class="btn btn-ghost"><i class="fas fa-phone"></i> ${clinic.phone}</a>
        </div>
      </div>
    </div>
  </section>
  `
  return Layout({
    title: `자주 묻는 질문 | ${clinic.nameKo}`,
    description: `${clinic.nameKo} FAQ — 심미보철, 임플란트(All-on-X), 접착수복, 턱관절 치료에 대해 자주 묻는 질문과 답변.`,
    path: '/faq',
    jsonLd: [breadcrumbSchema(crumb), faqSchema(allFaqs())],
  }, fullBody)
}

// ---------- 비용 안내 ----------
export function PricingPage() {
  const crumb = [{ name: '홈', url: '/' }, { name: '비용 안내', url: '/pricing' }]
  const body = html`
  <section class="page-hero">
    <div class="container">
      <p class="eyebrow">Pricing</p>
      <h1>비급여 진료비용 안내</h1>
      <p class="lead">의료법에 따라 비급여 진료비용을 고지합니다.<br>정확한 비용은 정밀 진단 후 치료계획과 함께 안내드립니다.</p>
    </div>
  </section>
  ${Breadcrumb(crumb)}

  <section class="section--tight">
    <div class="container">
      <nav class="price-nav" data-reveal aria-label="진료 분류 바로가기">
        ${raw(priceGroups.map((g, i) => `<a href="#price-${i}">${g.label}</a>`).join(''))}
      </nav>

      ${raw(priceGroups.map((g, i) => `
        <div id="price-${i}" data-reveal style="margin-bottom:3.5rem;scroll-margin-top:90px">
          <h2 style="font-family:var(--serif-kr);font-size:var(--t-h3);margin-bottom:.4rem">${g.label}</h2>
          ${g.desc ? `<p class="muted" style="font-size:.92rem;margin-bottom:1.2rem">${g.desc}</p>` : '<div style="margin-bottom:1.2rem"></div>'}
          <div class="table-scroll">
            <table class="price-table">
              <thead><tr><th>항목</th><th>비용</th><th>비고</th></tr></thead>
              <tbody>
                ${g.items.map((it) => `
                  <tr>
                    <td>${it.name}</td>
                    <td class="price">${it.price}</td>
                    <td class="muted">${it.note || ''}</td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>`).join(''))}

      <div class="notice-box" data-reveal>
        ${raw(pricingNotes.map((n) => `<p>· ${n}</p>`).join(''))}
      </div>

      <div class="cta-inline" data-reveal>
        <p>내 상태에 맞는 정확한 비용이 궁금하시다면</p>
        <a href="/reservation" class="btn btn-primary">상담 신청하기 <i class="fas fa-arrow-right"></i></a>
      </div>
    </div>
  </section>
  `
  return Layout({
    title: `비용 안내 | ${clinic.nameKo}`,
    description: `${clinic.nameKo} 비급여 진료비용 고지 — 임플란트, 보철, 심미치료 비용 안내. 정밀 진단 후 정확한 치료계획과 비용을 안내드립니다.`,
    path: '/pricing',
    jsonLd: [breadcrumbSchema(crumb)],
  }, body)
}

// ---------- 오시는 길 ----------
export function DirectionsPage() {
  const crumb = [{ name: '홈', url: '/' }, { name: '오시는 길', url: '/directions' }]
  const mapQuery = encodeURIComponent(clinic.address)
  const body = html`
  <section class="page-hero">
    <div class="container">
      <p class="eyebrow">Directions</p>
      <h1>오시는 길</h1>
      <p class="lead">${clinic.address}</p>
    </div>
  </section>
  ${Breadcrumb(crumb)}

  <section class="section--tight">
    <div class="container">
      <div class="map-embed" data-reveal>
        <iframe
          src="https://maps.google.com/maps?q=${mapQuery}&z=17&output=embed"
          width="100%" height="440" style="border:0;display:block;filter:grayscale(.15)"
          loading="lazy" referrerpolicy="no-referrer-when-downgrade"
          title="${clinic.nameKo} 위치 지도"></iframe>
      </div>
      <div style="display:flex;gap:.8rem;flex-wrap:wrap;margin-top:1.2rem" data-reveal>
        <a class="btn btn-ghost" target="_blank" rel="noopener" href="https://map.naver.com/v5/search/${mapQuery}"><i class="fas fa-map-location-dot"></i> 네이버지도</a>
        <a class="btn btn-ghost" target="_blank" rel="noopener" href="https://map.kakao.com/?q=${mapQuery}"><i class="fas fa-map"></i> 카카오맵</a>
        <a class="btn btn-ghost" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${mapQuery}"><i class="fab fa-google"></i> 구글지도</a>
      </div>

      <div class="metrics" style="margin-top:4rem;border-top:1px solid var(--line)">
        <div class="metric" data-reveal>
          <div class="l" style="margin-top:0;margin-bottom:.6rem"><i class="fas fa-train-subway"></i> 지하철</div>
          <p class="text-ink" style="line-height:1.7">${clinic.subway}</p>
          <p class="muted" style="font-size:.88rem;margin-top:.4rem">${clinic.directions}</p>
        </div>
        <div class="metric" data-reveal data-reveal-delay="1">
          <div class="l" style="margin-top:0;margin-bottom:.6rem"><i class="fas fa-square-parking"></i> 주차</div>
          <p class="text-ink" style="line-height:1.7">허브메디타워 건물 주차장 이용</p>
          <p class="muted" style="font-size:.88rem;margin-top:.4rem">자세한 주차 안내는 내원 전 전화 문의 부탁드립니다.</p>
        </div>
        <div class="metric" data-reveal data-reveal-delay="2">
          <div class="l" style="margin-top:0;margin-bottom:.6rem"><i class="fas fa-clock"></i> 진료시간</div>
          ${raw(clinic.hours.map((h) => `<p style="font-size:.92rem;display:flex;justify-content:space-between;max-width:280px;border-bottom:1px solid var(--line-soft);padding:.3rem 0"><span class="muted">${h.day}</span><span class="text-ink">${h.time}</span></p>`).join(''))}
          <p class="muted" style="font-size:.82rem;margin-top:.5rem">점심 13:00–14:00 (토요일 제외)</p>
        </div>
        <div class="metric" data-reveal data-reveal-delay="3">
          <div class="l" style="margin-top:0;margin-bottom:.6rem"><i class="fas fa-phone"></i> 연락처</div>
          <p class="text-ink" style="font-size:1.3rem;font-family:var(--serif)"><a href="tel:${clinic.phoneRaw}">${clinic.phone}</a></p>
          <p class="muted" style="font-size:.88rem;margin-top:.4rem">${clinic.email}</p>
        </div>
      </div>
    </div>
  </section>

  <section class="section cta-band">
    <div class="container">
      <h2 data-reveal>방문 전, 미리 예약하시면<br>기다림 없이 진료받으실 수 있습니다.</h2>
      <a href="/reservation" class="btn btn-primary" data-reveal data-reveal-delay="1" style="margin-top:2rem">예약 상담 신청 <i class="fas fa-arrow-right"></i></a>
    </div>
  </section>
  `
  return Layout({
    title: `오시는 길 | ${clinic.nameKo} — 온천장역 도보 3분`,
    description: `${clinic.nameKo} 오시는 길 — ${clinic.address}. ${clinic.directions}. ${clinic.hoursSummary}.`,
    path: '/directions',
    jsonLd: [breadcrumbSchema(crumb)],
  }, body)
}

// ---------- 개인정보처리방침 ----------
export function PrivacyPage() {
  const crumb = [{ name: '홈', url: '/' }, { name: '개인정보처리방침', url: '/privacy' }]
  const body = html`
  <section class="page-hero">
    <div class="container"><p class="eyebrow">Privacy</p><h1>개인정보처리방침</h1></div>
  </section>
  ${Breadcrumb(crumb)}
  <section class="section--tight"><div class="container"><div class="prose">
    <p>${clinic.nameKo}(이하 "병원")은 개인정보 보호법 등 관련 법령을 준수하며, 이용자의 개인정보를 보호하기 위해 다음과 같은 처리방침을 두고 있습니다.</p>
    <h2>1. 수집하는 개인정보 항목 및 수집 방법</h2>
    <p>병원은 예약 상담 신청 시 다음 정보를 수집합니다: 성함, 연락처(휴대전화), 관심 진료, 희망 일정, 상담 내용. 수집 방법: 홈페이지 예약 상담 폼, 전화.</p>
    <h2>2. 개인정보의 수집 및 이용 목적</h2>
    <p>예약 상담 연락, 진료 일정 안내, 상담 이력 관리 목적으로만 이용합니다.</p>
    <h2>3. 보유 및 이용 기간</h2>
    <p>상담 완료 후 1년간 보관 후 지체 없이 파기합니다. 단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다. 진료기록은 의료법에 따라 별도 보존됩니다.</p>
    <h2>4. 개인정보의 제3자 제공</h2>
    <p>병원은 이용자의 동의 없이 개인정보를 외부에 제공하지 않습니다. 단, 법령에 의한 요청이 있는 경우는 예외로 합니다.</p>
    <h2>5. 정보주체의 권리</h2>
    <p>이용자는 언제든지 개인정보 열람·정정·삭제·처리정지를 요구할 수 있습니다. 문의: ${clinic.phone} / ${clinic.email}</p>
    <h2>6. 개인정보 보호책임자</h2>
    <p>성명: ${clinic.business.owner} (대표원장) · 연락처: ${clinic.phone}</p>
    <p class="muted" style="font-size:.85rem">시행일: 2026년 1월 1일</p>
  </div></div></section>
  `
  return Layout({
    title: `개인정보처리방침 | ${clinic.nameKo}`,
    description: `${clinic.nameKo} 개인정보처리방침`,
    path: '/privacy',
    jsonLd: [breadcrumbSchema(crumb)],
  }, body)
}

// ---------- 이용약관 ----------
export function TermsPage() {
  const crumb = [{ name: '홈', url: '/' }, { name: '이용약관', url: '/terms' }]
  const body = html`
  <section class="page-hero">
    <div class="container"><p class="eyebrow">Terms</p><h1>이용약관</h1></div>
  </section>
  ${Breadcrumb(crumb)}
  <section class="section--tight"><div class="container"><div class="prose">
    <h2>제1조 (목적)</h2>
    <p>본 약관은 ${clinic.nameKo} 홈페이지(이하 "사이트")가 제공하는 서비스의 이용 조건 및 절차에 관한 사항을 규정함을 목적으로 합니다.</p>
    <h2>제2조 (의료정보의 한계)</h2>
    <p>사이트에 게시된 진료 정보는 일반적인 의학 정보이며, 개인의 상태에 따라 진단·치료 방법과 결과가 다를 수 있습니다. 정확한 진단과 치료는 반드시 내원하여 전문의와 상담하시기 바랍니다.</p>
    <h2>제3조 (예약 상담)</h2>
    <p>온라인 예약 상담 신청은 접수 후 병원의 연락으로 확정되며, 신청만으로 예약이 확정되지 않습니다.</p>
    <h2>제4조 (저작권)</h2>
    <p>사이트의 콘텐츠(글·이미지·디자인)에 대한 저작권은 병원에 있으며, 무단 복제·배포를 금합니다.</p>
    <h2>제5조 (면책)</h2>
    <p>사이트는 천재지변, 시스템 장애 등 불가항력으로 인한 서비스 중단에 대해 책임지지 않습니다.</p>
    <p class="muted" style="font-size:.85rem">시행일: 2026년 1월 1일</p>
  </div></div></section>
  `
  return Layout({
    title: `이용약관 | ${clinic.nameKo}`,
    description: `${clinic.nameKo} 이용약관`,
    path: '/terms',
    jsonLd: [breadcrumbSchema(crumb)],
  }, body)
}
