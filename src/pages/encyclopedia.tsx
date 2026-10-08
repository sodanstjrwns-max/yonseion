import { html, raw } from 'hono/html'
import { Layout, Breadcrumb } from '../components/layout'
import { clinic } from '../data/clinic'
import { hubA } from '../lib/hub-link'
import { encyclopedia, getEntry, encycloCategories } from '../data/encyclopedia'
import { glossary, GlossaryEntry, GLOSSARY_ALIASES } from '../data/glossary'
import { getTreatment } from '../data/treatments'
import { breadcrumbSchema, speakableSchema, faqSchema, definedTermSchema, medicalWebPageSchema } from '../lib/schema'
import { isThinEncyclo, isThinGlossary, NOINDEX_FOLLOW } from '../lib/thin-content'
import { encycloEntryDate } from '../lib/content-dates'
import { getEnrichment } from '../data/encyclopedia-enrich'
import type { Enrichment } from '../data/encyclopedia-enrich/types'

// ============================================================================
// 치과 백과사전 — AEO 직답형 정적 콘텐츠 허브
//  · 리치 레이어: encyclopedia.ts (심층 해설 12편)
//  · 경량 레이어: glossary.ts (500+ 용어, 한 문장 정의)
// ============================================================================

const glossaryCategories = (() => {
  const seen: string[] = []
  for (const e of glossary) if (!seen.includes(e.category)) seen.push(e.category)
  return seen
})()

/**
 * 실제로 열리는 서로 다른 용어 수 (2026-10-08) — 리치 해설과 경량 용어가 같은 slug 면 한 페이지(리치)로 열리고,
 * alias slug 는 301 이므로 제외. 예전 표기(encyclopedia.length + glossary.length = 634)는 겹치는 104개를 두 번 셌다.
 */
export function publicTermStats() {
  const rich = new Set(encyclopedia.map((e) => e.slug))
  const all = new Set<string>([...rich, ...glossary.map((g) => g.slug)].filter((s) => !GLOSSARY_ALIASES[s]))
  const glossaryOnly = glossary.filter((g) => !rich.has(g.slug) && !GLOSSARY_ALIASES[g.slug]).length
  return { total: all.size, rich: rich.size, glossaryOnly, overlap: glossary.length - glossaryOnly }
}

export function getGlossaryEntry(slug: string): GlossaryEntry | undefined {
  return glossary.find((e) => e.slug === slug)
}

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// slug → 용어명 (리치 우선, 보강본 관련 용어 링크용)
function termName(slug: string): string | undefined {
  return encyclopedia.find((e) => e.slug === slug)?.term || glossary.find((e) => e.slug === slug)?.term
}

// 보강본 렌더 (2026-10-08) — 본문 섹션 + FAQ(<details>, FAQPage 와 같은 텍스트) + 관련 용어·진료 링크
function enrichHtml(x: Enrichment, term: string): string {
  const terms = x.relatedTerms.map((s) => ({ s, t: termName(s) })).filter((r) => r.t)
  const txs = (x.relatedTreatments || []).map((s) => getTreatment(s)).filter(Boolean)
  return [
    x.sections.map((b) => `<h2>${esc(b.h)}</h2><p>${esc(b.p)}</p>`).join(''),
    `<h2>${esc(term)} 자주 묻는 질문</h2><div class="enc-faq">${x.faqs.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}</div>`,
    terms.length || txs.length
      ? `<h2>함께 보면 좋은 내용</h2><ul class="enc-rel">${txs.map((t) => `<li><a href="/treatments/${t!.slug}">진료 안내 · ${esc(t!.name)}</a></li>`).join('')}${terms.map((r) => `<li><a href="/encyclopedia/${r.s}">${esc(r.t!)}</a></li>`).join('')}</ul>`
      : '',
  ].join('')
}
const ENRICH_STYLE = `<style>
.enc-faq details{border-bottom:1px solid var(--line);padding:.2rem 0}
.enc-faq summary{cursor:pointer;font-weight:600;color:var(--ink);padding:1rem 0;list-style:none}
.enc-faq summary::-webkit-details-marker{display:none}
.enc-faq summary::before{content:'Q. ';color:var(--gold-2)}
.enc-faq details p{margin:0 0 1rem}
.enc-rel{list-style:none;margin:0 0 1.4rem;padding:0;display:flex;flex-wrap:wrap;gap:.5rem}
.enc-rel li{margin:0}
.enc-rel a{display:inline-block;border:1px solid var(--line);border-radius:999px;padding:.35rem .9rem;font-size:.86rem;text-decoration:none;color:var(--ink);background:#fff}
.enc-rel a:hover{border-color:var(--gold);color:var(--gold-2)}
</style>`

export function EncyclopediaIndex() {
  const crumb = [{ name: '홈', url: '/' }, { name: '치과 백과사전', url: '/encyclopedia' }]
  const stats = publicTermStats()
  const total = stats.total

  // DefinedTermSet 스키마 (AEO)
  const termSetSchema = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    name: `${clinic.nameKo} 치과 백과사전`,
    description: `치과 용어 ${total}개를 환자의 언어로 설명하는 용어 사전`,
    url: `${clinic.domain}/encyclopedia`,
  }

  const body = html`
  <section class="page-hero">
    <div class="container">
      <p class="eyebrow">Encyclopedia</p>
      <h1>치과 백과사전</h1>
      <p class="lead">진료실에서 자주 등장하는 용어 ${total}개를, 환자의 언어로 풀어 설명합니다.</p>
    </div>
  </section>
  ${Breadcrumb(crumb)}

  <section class="section--tight">
    <div class="container">

      <!-- 심층 해설 (리치 레이어) -->
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

      <!-- 용어 사전 (경량 레이어) -->
      <div id="glossary-section" data-reveal style="margin-top:4.5rem;padding-top:3rem;border-top:1px solid var(--line)">
        <h2 style="font-family:var(--serif-kr);font-size:var(--t-h3);margin-bottom:.6rem">치과 용어 사전 <span style="font-size:.9rem;color:var(--mist);font-family:var(--sans)">검색 목록 ${glossary.length}개 · 그중 ${stats.overlap}개는 위 심층 해설로 연결</span></h2>
        <p class="muted" style="margin-bottom:1.6rem;font-size:.92rem">검색하거나 분류를 선택해 원하는 용어를 찾아보세요.</p>

        <div style="display:flex;flex-wrap:wrap;gap:.8rem;align-items:center;margin-bottom:1.8rem">
          <input type="search" id="glossary-search" placeholder="용어 검색 (예: 임플란트, 신경치료…)"
            style="flex:1;min-width:220px;max-width:380px;padding:.7rem 1rem;border:1px solid var(--line);border-radius:4px;font-size:.95rem;background:#fff" />
        </div>
        <nav id="glossary-filter" aria-label="용어 분류" style="display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:2.2rem">
          <button class="gf-btn is-active" data-cat="all" style="padding:.42rem .9rem;border:1px solid var(--gold);border-radius:999px;background:var(--gold);color:#fff;font-size:.83rem;cursor:pointer">전체</button>
          ${raw(glossaryCategories.map((cat) => `<button class="gf-btn" data-cat="${esc(cat)}" style="padding:.42rem .9rem;border:1px solid var(--line);border-radius:999px;background:#fff;color:var(--ink);font-size:.83rem;cursor:pointer">${esc(cat)}</button>`).join(''))}
        </nav>

        <div id="glossary-list">
          ${raw(glossaryCategories.map((cat) => `
          <section class="glossary-group" data-cat="${esc(cat)}" style="margin-bottom:2.6rem">
            <h3 style="font-size:1.05rem;color:var(--gold-2);margin-bottom:1rem;letter-spacing:.04em">${esc(cat)}</h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:.7rem">
              ${glossary.filter((e) => e.category === cat).map((e) => `
              <a href="/encyclopedia/${e.slug}" class="glossary-term" data-term="${esc(e.term)} ${esc(e.termEn)}"
                 style="display:block;border:1px solid var(--line);border-radius:4px;padding:.85rem 1rem;background:#fff;text-decoration:none;color:inherit">
                <strong style="font-size:.95rem;display:block;margin-bottom:.2rem">${esc(e.term)}</strong>
                <span style="font-size:.78rem;color:var(--mist)">${esc(e.termEn)}</span>
              </a>`).join('')}
            </div>
          </section>`).join(''))}
        </div>
        <p id="glossary-empty" class="muted" style="display:none;padding:2rem 0;text-align:center">검색 결과가 없습니다. 다른 키워드로 시도해 보세요.</p>
      </div>
    </div>
  </section>

  <script>
  (function(){
    var search = document.getElementById('glossary-search');
    var btns = document.querySelectorAll('#glossary-filter .gf-btn');
    var groups = document.querySelectorAll('.glossary-group');
    var empty = document.getElementById('glossary-empty');
    var activeCat = 'all';
    function apply(){
      var q = (search.value || '').trim().toLowerCase();
      var visible = 0;
      groups.forEach(function(g){
        var catOk = activeCat === 'all' || g.dataset.cat === activeCat;
        var groupVisible = 0;
        g.querySelectorAll('.glossary-term').forEach(function(t){
          var hit = catOk && (!q || t.dataset.term.toLowerCase().indexOf(q) > -1);
          t.style.display = hit ? '' : 'none';
          if (hit) groupVisible++;
        });
        g.style.display = groupVisible ? '' : 'none';
        visible += groupVisible;
      });
      empty.style.display = visible ? 'none' : '';
    }
    search && search.addEventListener('input', apply);
    btns.forEach(function(b){
      b.addEventListener('click', function(){
        activeCat = b.dataset.cat;
        btns.forEach(function(x){ x.classList.remove('is-active'); x.style.background='#fff'; x.style.color='var(--ink)'; x.style.borderColor='var(--line)'; });
        b.classList.add('is-active'); b.style.background='var(--gold)'; b.style.color='#fff'; b.style.borderColor='var(--gold)';
        apply();
      });
    });
  })();
  </script>
  `
  return Layout({
    title: `치과 백과사전 — 치과 용어 ${total}개 총정리 | ${clinic.nameKo}`,
    description: `생체모방치의학, 러버댐, IDS, 올온엑스부터 임플란트·신경치료·교정 용어까지 — 치과 용어 ${total}개를 환자의 언어로 설명하는 ${clinic.nameKo} 백과사전.`,
    path: '/encyclopedia',
    jsonLd: [breadcrumbSchema(crumb), termSetSchema],
  }, body)
}

export function EncyclopediaDetail(slug: string) {
  const entry = getEntry(slug)
  if (!entry) return GlossaryDetail(slug)
  const crumb = [{ name: '홈', url: '/' }, { name: '치과 백과사전', url: '/encyclopedia' }, { name: entry.term, url: `/encyclopedia/${entry.slug}` }]
  const related = entry.relatedTreatments.map((s) => getTreatment(s)).filter(Boolean)
  const others = encyclopedia.filter((e) => e.category === entry.category && e.slug !== entry.slug)

  // AEO 스키마: 본문 Q&A → FAQPage / 용어 → DefinedTerm / 페이지 → MedicalWebPage(publisher 병원, 원장 감수 표기 없음)
  const enrich = getEnrichment(entry.slug)
  const reviewed = encycloEntryDate(entry.slug, 'encyclopedia', !!enrich)
  const faqEntries = [
    ...entry.body.filter((b) => /[?？]\s*$/.test(b.h.trim())).map((b) => ({ q: b.h, a: b.p })),
    ...(enrich ? enrich.faqs : []),
  ]

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
          ${raw(enrich ? ENRICH_STYLE + enrichHtml(enrich, entry.term) : '')}
          <p class="muted enc-review" style="font-size:.82rem;margin-top:2.5rem">일반 건강정보입니다. 진료 판단은 내원 상담에서 원장이 직접 합니다. · 최종 수정 <time datetime="${reviewed}">${reviewed}</time></p>
          <p class="muted" style="font-size:.8rem;margin-top:.6rem">※ 본 내용은 일반적인 의학 정보이며, 개인의 상태에 따라 진단·치료 방법이 다를 수 있습니다. 정확한 내용은 내원하여 전문의와 상담하시기 바랍니다.</p>
        </article>
        <aside class="sidebar">
          ${raw(related.length ? `
          <div class="sidebar-box">
            <h3>관련 진료</h3>
            ${related.map((t) => `<a href="/treatments/${t!.slug}">${t!.name}</a>`).join('')}
          </div>` : '')}
          ${raw(others.length ? `
          <div class="sidebar-box">
            <h3>같은 분류의 용어</h3>
            ${others.map((e) => `<a href="/encyclopedia/${e.slug}">${e.term}</a>`).join('')}
          </div>` : '')}
          <div class="sidebar-box">
            <h3>상담</h3>
            <a href="/reservation">예약 상담 신청</a>
            <a href="tel:${clinic.phoneRaw}">${clinic.phone}</a>
            <p style="margin:.8rem 0 0;font-size:.84rem;line-height:1.7">위치·진료시간 안내: ${raw(hubA())}</p>
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
    robots: isThinEncyclo(entry) ? NOINDEX_FOLLOW : undefined,
    jsonLd: [
      breadcrumbSchema(crumb),
      definedTermSchema({ term: entry.term, termEn: entry.termEn, description: entry.oneLiner, slug: entry.slug }),
      medicalWebPageSchema({
        title: `${entry.term}이란?`,
        description: entry.oneLiner,
        path: `/encyclopedia/${entry.slug}`,
        noReview: true, // 원장 검토 기록 없음 — 감수 신호 미표기 (2026-10-08)
        dateModified: reviewed,
        about: { type: 'DefinedTerm', id: `${clinic.domain}/encyclopedia/${entry.slug}#term`, name: entry.term },
      }),
      ...(faqEntries.length ? [faqSchema(faqEntries)] : []),
      speakableSchema(['#encyclo-answer']),
    ],
  }, body)
}

// 경량 용어 상세 페이지 (glossary 레이어)
export function GlossaryDetail(slug: string) {
  const entry = getGlossaryEntry(slug)
  if (!entry) return null
  const crumb = [{ name: '홈', url: '/' }, { name: '치과 백과사전', url: '/encyclopedia' }, { name: entry.term, url: `/encyclopedia/${entry.slug}` }]
  const related = (entry.related || []).map((s) => getTreatment(s)).filter(Boolean)
  const sameCategory = glossary.filter((e) => e.category === entry.category && e.slug !== entry.slug).slice(0, 12)
  const richSame = encyclopedia.filter((e) => (entry.related || []).some((r) => e.relatedTreatments.includes(r))).slice(0, 4)
  const enrich = getEnrichment(entry.slug)
  const reviewed = encycloEntryDate(entry.slug, 'glossary', !!enrich)

  const termSchema = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    '@id': `${clinic.domain}/encyclopedia/${entry.slug}#term`,
    name: entry.term,
    alternateName: entry.termEn,
    description: entry.def,
    url: `${clinic.domain}/encyclopedia/${entry.slug}`,
    inDefinedTermSet: { '@type': 'DefinedTermSet', name: `${clinic.nameKo} 치과 백과사전`, url: `${clinic.domain}/encyclopedia` },
  }

  const body = html`
  <section class="page-hero">
    <div class="container">
      <p class="eyebrow">${entry.category} · ${entry.termEn}</p>
      <h1 style="font-size:var(--t-h2)">${entry.term}</h1>
      <p class="lead" id="encyclo-answer">${entry.def}</p>
    </div>
  </section>
  ${Breadcrumb(crumb)}

  <section class="section--tight">
    <div class="container">
      <div class="detail-grid">
        <article class="prose" data-reveal>
          ${raw(enrich ? ENRICH_STYLE + enrichHtml(enrich, entry.term) : `<h2>${entry.term}(${entry.termEn})이란?</h2>
          <p>${entry.def}</p>
          ${related.length ? `<h2>관련 진료 안내</h2><p>${entry.term}와(과) 관련된 진료가 궁금하시다면 ${related.map((t) => `<a href="/treatments/${t!.slug}">${t!.name}</a>`).join(', ')} 페이지에서 더 자세한 내용을 확인하실 수 있습니다.</p>` : ''}`)}
          <p class="muted enc-review" style="font-size:.82rem;margin-top:2.5rem">일반 건강정보입니다. 진료 판단은 내원 상담에서 원장이 직접 합니다. · 최종 수정 <time datetime="${reviewed}">${reviewed}</time></p>
          <p class="muted" style="font-size:.8rem;margin-top:.6rem">※ 본 내용은 일반적인 의학 정보이며, 개인의 상태에 따라 진단·치료 방법이 다를 수 있습니다. 정확한 내용은 내원하여 전문의와 상담하시기 바랍니다.</p>
        </article>
        <aside class="sidebar">
          ${raw(related.length ? `
          <div class="sidebar-box">
            <h3>관련 진료</h3>
            ${related.map((t) => `<a href="/treatments/${t!.slug}">${t!.name}</a>`).join('')}
          </div>` : '')}
          ${raw(richSame.length ? `
          <div class="sidebar-box">
            <h3>심층 해설 읽어보기</h3>
            ${richSame.map((e) => `<a href="/encyclopedia/${e.slug}">${e.term}</a>`).join('')}
          </div>` : '')}
          ${raw(sameCategory.length ? `
          <div class="sidebar-box">
            <h3>같은 분류의 용어</h3>
            ${sameCategory.map((e) => `<a href="/encyclopedia/${e.slug}">${e.term}</a>`).join('')}
          </div>` : '')}
          <div class="sidebar-box">
            <h3>상담</h3>
            <a href="/reservation">예약 상담 신청</a>
            <a href="tel:${clinic.phoneRaw}">${clinic.phone}</a>
            <p style="margin:.8rem 0 0;font-size:.84rem;line-height:1.7">위치·진료시간 안내: ${raw(hubA())}</p>
          </div>
        </aside>
      </div>
    </div>
  </section>
  `
  return Layout({
    title: `${entry.term}(${entry.termEn})이란? | 치과 백과사전 | ${clinic.nameKo}`,
    description: entry.def,
    path: `/encyclopedia/${entry.slug}`,
    robots: isThinGlossary(entry) ? NOINDEX_FOLLOW : undefined, // 한 문장 정의만 있는 경량 용어 → noindex, follow
    jsonLd: [
      breadcrumbSchema(crumb),
      termSchema,
      medicalWebPageSchema({
        title: `${entry.term}(${entry.termEn})이란?`,
        description: entry.def,
        path: `/encyclopedia/${entry.slug}`,
        noReview: true, // 원장 검토 기록 없음 — 감수 신호 미표기 (2026-10-08)
        dateModified: reviewed,
        about: { type: 'DefinedTerm', id: `${clinic.domain}/encyclopedia/${entry.slug}#term`, name: entry.term },
      }),
      ...(enrich ? [faqSchema(enrich.faqs)] : []),
      speakableSchema(['#encyclo-answer']),
    ],
  }, body)
}
