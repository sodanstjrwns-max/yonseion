import { html, raw } from 'hono/html'
import { Layout, Breadcrumb } from '../components/layout'
import { clinic } from '../data/clinic'
import { seoRegions, seoTreatments, areaCombos } from '../data/facilities'
import { getTreatment } from '../data/treatments'
import { doctorsBySpecialty } from '../data/doctors'
import { faqGroups } from '../data/faqs'
import { breadcrumbSchema, faqSchema, placeSchema } from '../lib/schema'

// ============================================================================
// 지역 SEO 페이지 — /area/[region]-[treatment] (8지역 × 4진료 = 32페이지)
// 각 페이지: 지역 키워드 H1 + 진료 핵심 답변 + 교통 + FAQ + CTA
// ============================================================================

const faqKeyByTreatment: Record<string, string> = {
  'all-on-x': 'implant',
  'esthetic-prosthetics': 'esthetic',
  'adhesive-restoration': 'adhesive',
  'implant-guide': 'implant',
}

export function AreaIndexPage() {
  const crumb = [{ name: '홈', url: '/' }, { name: '지역별 진료 안내', url: '/area' }]
  const body = html`
  <section class="page-hero">
    <div class="container">
      <p class="eyebrow">Area Guide</p>
      <h1>지역별 진료 안내</h1>
      <p class="lead">부산 동래구 온천장에 위치한 연세온치과는<br>동래·금정·연제·부산진구에서 가까운 거리에 있습니다.</p>
    </div>
  </section>
  ${Breadcrumb(crumb)}
  <section class="section--tight">
    <div class="container">
      ${raw(seoRegions.map((r) => `
        <div data-reveal style="margin-bottom:2.8rem">
          <h2 style="font-family:var(--serif-kr);font-size:1.4rem;margin-bottom:1rem">${r.full}</h2>
          <div style="display:flex;gap:.7rem;flex-wrap:wrap">
            ${seoTreatments.map((t) => `<a href="/area/${r.slug}-${t.slug}" class="faq-tab">${r.name} ${t.name}</a>`).join('')}
          </div>
        </div>`).join(''))}
    </div>
  </section>
  `
  return Layout({
    title: `지역별 진료 안내 | ${clinic.nameKo}`,
    description: `부산 동래·금정·연제·부산진구 — 지역별 임플란트·심미보철·충치치료 안내. ${clinic.nameKo}.`,
    path: '/area',
    jsonLd: [breadcrumbSchema(crumb)],
  }, body)
}

export function AreaPage(comboSlug: string) {
  const combo = areaCombos().find((c) => c.slug === comboSlug)
  if (!combo) return null
  const { region, treatment } = combo
  const tx = getTreatment(treatment.slug)
  if (!tx) return null

  const docs = doctorsBySpecialty(treatment.slug)
  const doc = docs[0]
  const faqKey = faqKeyByTreatment[treatment.slug] || 'general'
  const faqs = (faqGroups[faqKey]?.faqs || []).slice(0, 4)
  const title = `${region.name} ${treatment.keyword}`
  const crumb = [{ name: '홈', url: '/' }, { name: '지역별 안내', url: '/area' }, { name: title, url: `/area/${comboSlug}` }]

  const body = html`
  <section class="page-hero">
    <div class="container">
      <p class="eyebrow">${region.full}</p>
      <h1 style="font-size:var(--t-h2)">${title},<br>연세온치과에서</h1>
      <p class="lead">${region.full}에서 ${treatment.keyword}를 알아보고 계신가요?
      ${clinic.nameKo}는 ${clinic.subway} 거리에 있어 ${region.name}에서 가깝게 내원하실 수 있습니다.</p>
    </div>
  </section>
  ${Breadcrumb(crumb)}

  <section class="section--tight">
    <div class="container">
      <div class="detail-grid">
        <div>
          <article class="prose" data-reveal>
            <h2>${region.name}에서 ${treatment.keyword}, 어디서 받아야 할까요?</h2>
            <p>${tx.hero}</p>
            <h2>연세온치과의 ${tx.name}</h2>
            ${raw(tx.sections.slice(0, 2).map((s) => `<h3>${s.q}</h3><p>${s.a}</p>`).join(''))}
            <p><a href="/treatments/${tx.slug}" class="link-arrow">${tx.name} 자세히 보기 <i class="fas fa-arrow-right"></i></a></p>

            <h2>${region.name}에서 오시는 길</h2>
            <p>${clinic.nameKo}는 ${clinic.address}에 있습니다. ${clinic.directions}
            ${region.name === '온천장' || region.name === '온천동' ? '도보로도 편하게 방문하실 수 있는 거리입니다.' : `${region.full}에서 지하철 1호선 또는 차량으로 가깝게 이동하실 수 있습니다.`}</p>
          </article>

          <div style="margin-top:3.5rem" data-reveal>
            <h2 style="font-family:var(--serif-kr);font-size:var(--t-h3);margin-bottom:1rem">자주 묻는 질문</h2>
            <div class="faq-list">
              ${raw(faqs.map((f) => `
                <div class="faq-item">
                  <button class="faq-q"><span>${f.q}</span><i class="fas fa-plus"></i></button>
                  <div class="faq-a"><div class="faq-a-inner"><p>${f.a}</p></div></div>
                </div>`).join(''))}
            </div>
          </div>
        </div>
        <aside class="sidebar">
          ${raw(doc ? `
          <div class="sidebar-box">
            <h4>담당 의료진</h4>
            <p style="font-weight:600;color:var(--ink)">${doc.name} ${doc.role}</p>
            <p class="muted" style="font-size:.85rem;margin:.4rem 0 .8rem">${doc.title}</p>
            <a href="/doctors/${doc.slug}" class="link-arrow" style="font-size:.88rem">소개 보기 <i class="fas fa-arrow-right"></i></a>
          </div>` : '')}
          <div class="sidebar-box">
            <h4>진료시간</h4>
            <p style="font-size:.88rem;line-height:1.8">${clinic.hoursSummary}</p>
            <p class="muted" style="font-size:.82rem">${clinic.closedDays}</p>
          </div>
          <div class="sidebar-box">
            <h4>상담</h4>
            <a href="/reservation">예약 상담 신청</a>
            <a href="tel:${clinic.phoneRaw}">${clinic.phone}</a>
            <a href="/directions">오시는 길</a>
          </div>
          <div class="sidebar-box">
            <h4>인근 지역 안내</h4>
            ${raw(seoRegions.filter((r) => r.slug !== region.slug).slice(0, 4).map((r) => `<a href="/area/${r.slug}-${treatment.slug}">${r.name} ${treatment.name}</a>`).join(''))}
          </div>
        </aside>
      </div>
    </div>
  </section>

  <section class="section cta-band">
    <div class="container">
      <h2 data-reveal>${region.name}에서 가까운 정밀 진료,<br>상담부터 시작하세요.</h2>
      <a href="/reservation" class="btn btn-primary" data-reveal data-reveal-delay="1" style="margin-top:2rem">예약 상담 신청 <i class="fas fa-arrow-right"></i></a>
    </div>
  </section>
  `
  return Layout({
    title: `${title} | ${clinic.nameKo} — ${clinic.subway}`,
    description: `${region.full} ${treatment.keyword} — ${clinic.nameKo}. ${tx.short}. ${clinic.subway}, ${clinic.hoursSummary}.`,
    path: `/area/${comboSlug}`,
    jsonLd: [breadcrumbSchema(crumb), placeSchema(region.full), faqSchema(faqs)],
  }, body)
}
