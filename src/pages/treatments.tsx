import { html, raw } from 'hono/html'
import { Layout, Breadcrumb } from '../components/layout'
import { FaqAccordion } from '../components/faq'
import { clinic } from '../data/clinic'
import { treatments, getTreatment, coreTreatments, treatmentGroups, treatmentsByGroup, type Treatment } from '../data/treatments'
import { getDoctor } from '../data/doctors'
import { faqGroups } from '../data/faqs'
import { breadcrumbSchema, faqSchema, procedureSchema, speakableSchema } from '../lib/schema'
import { autoLink } from '../lib/inlink'

// ---------- 진료 전체 목록 ----------
export function TreatmentsIndex() {
  const crumb = [{ name: '홈', url: '/' }, { name: '진료안내', url: '/treatments' }]
  const body = html`
  <section class="page-hero">
    <div class="container">
      <p class="eyebrow">Treatments</p>
      <h1>진료 안내</h1>
      <p>생체모방 원칙을 바탕으로, 치아를 최대한 보존하는 진료를 제공합니다.</p>
    </div>
  </section>
  ${Breadcrumb(crumb)}

  <section class="section">
    <div class="container">
      <div class="sec-head"><p class="eyebrow reveal">Signature</p><h2 class="sec-title reveal reveal-d1">집중 진료</h2></div>
      <div class="grid grid-3">
        ${raw(coreTreatments.map((t, i) => `
          <a href="/treatments/${t.slug}" class="core-card reveal reveal-d${i + 1}">
            <img src="/static/img/tx-${t.slug}.jpg" alt="${t.name}" loading="lazy" onerror="this.style.display='none'">
            <span class="tag">0${i + 1} · ${t.group}</span>
            <h3>${t.name}</h3><p>${t.short}</p>
            <span class="arrow">자세히 보기 <i class="fas fa-arrow-right"></i></span>
          </a>`).join(''))}
      </div>
    </div>
  </section>

  <section class="section bg-paper2">
    <div class="container">
      <div class="sec-head"><p class="eyebrow reveal">All Treatments</p><h2 class="sec-title reveal reveal-d1">전체 진료 과목</h2></div>
      ${raw(treatmentGroups.map((g) => `
        <div class="reveal" style="margin-bottom:2.5rem">
          <h3 style="color:var(--navy);font-size:1.3rem;border-bottom:2px solid var(--gold);display:inline-block;padding-bottom:.4rem;margin-bottom:1.2rem">${g}</h3>
          <div class="grid grid-3">
            ${treatmentsByGroup(g).map((t) => `
              <a href="/treatments/${t.slug}" class="card" style="padding:1.6rem">
                <h3 style="font-size:1.15rem;margin-top:0">${t.name}${t.category === 'core' ? ' <span class="pill" style="font-size:.65rem;padding:.15rem .5rem">핵심</span>' : ''}</h3>
                <p style="font-size:.9rem">${t.short}</p>
                <span class="arrow" style="font-size:.82rem">보기 <i class="fas fa-arrow-right"></i></span>
              </a>`).join('')}
          </div>
        </div>`).join(''))}
    </div>
  </section>
  `
  return Layout({
    title: `진료안내 | ${clinic.nameKo} · 부산 동래 생체모방치과`,
    description: `${clinic.nameKo} 진료 안내 — 중장년 심미보철, 전체임플란트(All-on-X), 생체모방 접착수복, 턱관절·교합치료 등. 치아를 최대한 보존하는 정밀 진료.`,
    path: '/treatments',
    jsonLd: [breadcrumbSchema(crumb)],
  }, body)
}

// ---------- 진료 상세 ----------
export function TreatmentDetail(slug: string) {
  const t = getTreatment(slug)
  if (!t) return null
  const crumb = [{ name: '홈', url: '/' }, { name: '진료안내', url: '/treatments' }, { name: t.name, url: '/treatments/' + t.slug }]
  const docs = t.doctorSlugs.map(getDoctor).filter(Boolean)
  const related = t.relatedTreatments.map(getTreatment).filter(Boolean) as Treatment[]
  const faqGroup = faqGroups[t.faqRef]

  const body = html`
  <section class="page-hero">
    <div class="container">
      <p class="eyebrow">${t.group}${t.category === 'core' ? ' · 집중 진료' : ''}</p>
      <h1>${t.name}</h1>
      <p>${t.short}</p>
    </div>
  </section>
  ${Breadcrumb(crumb)}

  <section class="section">
    <div class="container" style="display:grid;grid-template-columns:1fr 320px;gap:3.5rem;align-items:start" class="tx-grid">
      <div class="prose" style="max-width:none">
        <p class="lead reveal" style="margin-bottom:2rem">${t.hero}</p>
        ${raw(autoLink(t.sections.map((s, i) => `
          <div class="reveal reveal-d${i % 3}">
            <h2>${s.q}</h2>
            <div class="answer">${s.a}</div>
            ${s.body ? `<p>${s.body}</p>` : ''}
          </div>`).join(''), 12))}

        ${t.procedures ? raw(`
          <h2 class="reveal">세부 시술</h2>
          <div class="grid grid-2 reveal" style="margin-top:1rem">
            ${t.procedures.map((p) => `
              <div style="border:1px solid var(--line);border-radius:12px;padding:1.3rem;background:#fff">
                <h3 style="font-size:1.05rem;margin:0 0 .4rem;color:var(--navy)">${p.name}</h3>
                <p style="margin:0;font-size:.92rem;color:var(--ink-soft)">${p.desc}</p>
              </div>`).join('')}
          </div>`) : ''}
      </div>

      <!-- 사이드 (인링크 허브) -->
      <aside style="position:sticky;top:100px" class="reveal reveal-d1">
        <div class="card" style="padding:1.6rem">
          <h3 style="font-size:1rem;margin-top:0;color:var(--gold)">담당 의료진</h3>
          ${raw(docs.map((d) => `
            <a href="/doctors/${d!.slug}" style="display:flex;gap:.8rem;align-items:center;padding:.7rem 0;border-bottom:1px solid var(--line)">
              <span style="width:42px;height:42px;border-radius:50%;background:var(--paper-2);display:grid;place-items:center;flex-shrink:0"><i class="fas fa-user-md" style="color:var(--gold)"></i></span>
              <span><strong style="color:var(--navy);display:block;font-size:.95rem">${d!.name} ${d!.role}</strong><small style="color:var(--muted)">${d!.title}</small></span>
            </a>`).join(''))}
          ${related.length ? `<h3 style="font-size:1rem;margin:1.4rem 0 .6rem;color:var(--gold)">관련 진료</h3>
            ${related.map((r) => `<a href="/treatments/${r.slug}" class="mega-item" style="color:var(--ink-soft)">→ ${r.name}</a>`).join('')}` : ''}
          <a href="/cases/gallery?treatment=${t.slug}" class="btn btn-outline" style="width:100%;justify-content:center;margin-top:1.4rem;font-size:.88rem">관련 비포/애프터 <i class="fas fa-images"></i></a>
          <a href="/reservation" class="btn btn-navy" style="width:100%;justify-content:center;margin-top:.6rem;font-size:.88rem">예약 상담 <i class="fas fa-arrow-right"></i></a>
        </div>
      </aside>
    </div>
  </section>

  ${faqGroup ? html`
  <section class="section bg-paper2">
    <div class="container" style="max-width:840px">
      <div class="sec-head center"><p class="eyebrow reveal">FAQ</p><h2 class="sec-title reveal reveal-d1">${t.name} 자주 묻는 질문</h2></div>
      ${FaqAccordion(faqGroup.faqs)}
      <p style="text-align:center;margin-top:2rem" class="reveal"><a href="/faq" class="btn btn-outline">전체 FAQ 보기 <i class="fas fa-arrow-right"></i></a></p>
    </div>
  </section>` : ''}

  <section class="section" style="background:linear-gradient(135deg,var(--navy),var(--navy-dark));color:#fff;text-align:center">
    <div class="container">
      <h2 class="sec-title reveal" style="color:#fff">${t.name}, <span class="gold">상담받아 보세요</span></h2>
      <p class="reveal reveal-d1" style="color:rgba(255,255,255,.8);margin:1.2rem 0 2rem">정밀 진단 후 내 치아에 맞는 치료계획을 안내드립니다.</p>
      <div class="reveal reveal-d2" style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap">
        <a href="/reservation" class="btn btn-gold">예약 상담 <i class="fas fa-arrow-right"></i></a>
        <a href="tel:${clinic.phoneRaw}" class="btn btn-ghost"><i class="fas fa-phone"></i> ${clinic.phone}</a>
      </div>
    </div>
  </section>

  <style>@media (max-width:900px){ .tx-grid{ grid-template-columns:1fr !important } aside{ position:static !important } }</style>
  `

  const jsonLd: object[] = [breadcrumbSchema(crumb), procedureSchema(t), speakableSchema(['.lead', '.answer'])]
  if (faqGroup) jsonLd.push(faqSchema(faqGroup.faqs))

  return Layout({
    title: `${t.name} | ${clinic.nameKo} · 부산 동래`,
    description: t.hero.slice(0, 155),
    path: '/treatments/' + t.slug,
    jsonLd,
  }, body)
}

export const treatmentSlugs = treatments.map((t) => t.slug)
