import { html, raw } from 'hono/html'
import { Layout, Breadcrumb } from '../components/layout'
import { clinic } from '../data/clinic'
import { encyclopedia, getEntry, encycloCategories } from '../data/encyclopedia'
import { getTreatment } from '../data/treatments'
import { breadcrumbSchema, speakableSchema } from '../lib/schema'

// ============================================================================
// 치과 백과사전 — AEO 직답형 정적 콘텐츠 허브
// ============================================================================
export function EncyclopediaIndex() {
  const crumb = [{ name: '홈', url: '/' }, { name: '치과 백과사전', url: '/encyclopedia' }]
  const body = html`
  <section class="page-hero">
    <div class="container">
      <p class="eyebrow">Encyclopedia</p>
      <h1>치과 백과사전</h1>
      <p class="lead">진료실에서 자주 등장하는 용어를, 환자의 언어로 풀어 설명합니다.</p>
    </div>
  </section>
  ${Breadcrumb(crumb)}

  <section class="section--tight">
    <div class="container">
      ${raw(encycloCategories.map((cat) => `
        <div data-reveal style="margin-bottom:3.5rem">
          <h2 style="font-family:var(--serif-kr);font-size:var(--t-h3);margin-bottom:1.4rem">${cat}</h2>
          <div class="cards cards--3">
            ${encyclopedia.filter((e) => e.category === cat).map((e) => `
              <a href="/encyclopedia/${e.slug}" class="card" style="border:1px solid var(--line);border-radius:4px;padding:1.6rem;gap:.6rem">
                <span class="tag">${e.termEn}</span>
                <h3 style="font-size:1.2rem;margin:0">${e.term}</h3>
                <p style="font-size:.88rem;line-height:1.7">${e.oneLiner.slice(0, 72)}…</p>
                <span class="link-arrow" style="font-size:.85rem;margin-top:auto">자세히 <i class="fas fa-arrow-right"></i></span>
              </a>`).join('')}
          </div>
        </div>`).join(''))}
    </div>
  </section>
  `
  return Layout({
    title: `치과 백과사전 | ${clinic.nameKo}`,
    description: `생체모방치의학, 러버댐, IDS, 올온엑스 등 치과 용어를 환자의 언어로 설명하는 ${clinic.nameKo} 백과사전.`,
    path: '/encyclopedia',
    jsonLd: [breadcrumbSchema(crumb)],
  }, body)
}

export function EncyclopediaDetail(slug: string) {
  const entry = getEntry(slug)
  if (!entry) return null
  const crumb = [{ name: '홈', url: '/' }, { name: '치과 백과사전', url: '/encyclopedia' }, { name: entry.term, url: `/encyclopedia/${entry.slug}` }]
  const related = entry.relatedTreatments.map((s) => getTreatment(s)).filter(Boolean)
  const others = encyclopedia.filter((e) => e.category === entry.category && e.slug !== entry.slug)

  const body = html`
  <section class="page-hero">
    <div class="container">
      <p class="eyebrow">${entry.category} · ${entry.termEn}</p>
      <h1 style="font-size:var(--t-h2)">${entry.term}</h1>
      <p class="lead" id="encyclo-answer">${entry.oneLiner}</p>
    </div>
  </section>
  ${Breadcrumb(crumb)}

  <section class="section--tight">
    <div class="container">
      <div class="detail-grid">
        <article class="prose" data-reveal>
          ${raw(entry.body.map((b) => `<h2>${b.h}</h2><p>${b.p}</p>`).join(''))}
          <p class="muted" style="font-size:.8rem;margin-top:2.5rem">※ 본 내용은 일반적인 의학 정보이며, 개인의 상태에 따라 진단·치료 방법이 다를 수 있습니다. 정확한 내용은 내원하여 전문의와 상담하시기 바랍니다.</p>
        </article>
        <aside class="sidebar">
          ${raw(related.length ? `
          <div class="sidebar-box">
            <h4>관련 진료</h4>
            ${related.map((t) => `<a href="/treatments/${t!.slug}">${t!.name}</a>`).join('')}
          </div>` : '')}
          ${raw(others.length ? `
          <div class="sidebar-box">
            <h4>같은 분류의 용어</h4>
            ${others.map((e) => `<a href="/encyclopedia/${e.slug}">${e.term}</a>`).join('')}
          </div>` : '')}
          <div class="sidebar-box">
            <h4>상담</h4>
            <a href="/reservation">예약 상담 신청</a>
            <a href="tel:${clinic.phoneRaw}">${clinic.phone}</a>
          </div>
        </aside>
      </div>
    </div>
  </section>
  `
  return Layout({
    title: `${entry.term}이란? | 치과 백과사전 | ${clinic.nameKo}`,
    description: entry.oneLiner,
    path: `/encyclopedia/${entry.slug}`,
    jsonLd: [breadcrumbSchema(crumb), speakableSchema(['#encyclo-answer'])],
  }, body)
}
