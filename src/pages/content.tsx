import { html, raw } from 'hono/html'
import { Layout, Breadcrumb } from '../components/layout'
import { clinic } from '../data/clinic'
import { getTreatment, treatments as ALL_TREATMENTS } from '../data/treatments'
import { answerSummary, faqsFromArticleHtml, enhanceArticleImages, caseAutoSummary, flatText, clipSentences, kstYmd } from '../lib/column-seo'
import { getDoctor } from '../data/doctors'
import { columnDoctor, CLINIC_GENERAL_INFO_NOTE } from '../lib/authorship'
import { breadcrumbSchema, articleSchema } from '../lib/schema'
import type { CaseItem, Column, Notice } from '../data/types'
import { autoLink } from '../lib/inlink'
import { getMergedVideos } from '../lib/youtube'
import { isThinNotice, NOINDEX_FOLLOW } from '../lib/thin-content'

const fmt = (iso: string) => (iso || '').slice(0, 10).replace(/-/g, '.')
const BASE = clinic.domain
export const LIST_PER = 12
const escA = (s: any) => String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** 서버 렌더 페이지네이션 — 1페이지는 쿼리 없는 주소, 나머지 ?page=N (a 링크) */
function pagerHtml(base: string, page: number, pages: number): string {
  if (pages <= 1) return ''
  const href = (n: number) => (n === 1 ? base.replace(/[?&]$/, '') : `${base}page=${n}`)
  return `<nav class="list-pager" aria-label="페이지">${Array.from({ length: pages }, (_, i) => i + 1).map((n) => `<a href="${href(n)}"${n === page ? ' aria-current="page"' : ''}>${n}</a>`).join('')}</nav>`
}
const LIST_CSS = `<style>
    .list-pager{display:flex;gap:.5rem;justify-content:center;flex-wrap:wrap;margin-top:3rem}
    .list-pager a{min-width:2.6rem;height:2.6rem;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--line);border-radius:4px;color:var(--ink);font-family:var(--serif,serif)}
    .list-pager a:hover{border-color:var(--gold)}
    .list-pager a[aria-current]{background:var(--ink);border-color:var(--ink);color:var(--paper)}
    .answer-box{border:1px solid var(--line);border-left:3px solid var(--gold);background:var(--paper-2);padding:1.4rem 1.6rem;margin:0 0 2.2rem;border-radius:4px}
    .answer-box .answer-label{font-size:.78rem;letter-spacing:.14em;color:var(--gold);margin:0 0 .5rem}
    .answer-box .answer-summary{margin:0;line-height:1.85;color:var(--ink)}
    .answer-box dl{display:flex;flex-wrap:wrap;gap:.6rem 2rem;margin:1rem 0 0;font-size:.88rem}
    .answer-box dt{color:var(--mist-2,#8A93A6);font-size:.78rem}
    .answer-box dd{margin:.15rem 0 0;color:var(--ink);font-weight:600}
  </style>`

/** 목록 CollectionPage + ItemList + Breadcrumb (@graph) */
function collectionGraph(opts: { path: string; name: string; total: number; offset: number; items: { name: string; path: string }[]; crumb: { name: string; url: string }[] }) {
  const url = BASE + opts.path
  const bc: any = breadcrumbSchema(opts.crumb); delete bc['@context']; bc['@id'] = url + '#breadcrumb'
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'CollectionPage', '@id': url + '#webpage', url, name: opts.name, inLanguage: 'ko', isPartOf: { '@id': BASE + '/#website' }, mainEntity: { '@id': url + '#itemlist' }, breadcrumb: { '@id': url + '#breadcrumb' } },
      { '@type': 'ItemList', '@id': url + '#itemlist', name: opts.name, numberOfItems: opts.total, itemListOrder: 'https://schema.org/ItemListOrderDescending',
        itemListElement: opts.items.map((it, i) => ({ '@type': 'ListItem', position: opts.offset + i + 1, name: it.name, url: BASE + it.path })) },
      bc,
    ],
  }
}
const byNewest = <T extends { createdAt?: string }>(a: T, b: T) => String(b.createdAt || '').localeCompare(String(a.createdAt || ''))

// 본문 H2에 anchor id 부여 + 목차(TOC) 추출
function buildToc(htmlStr: string): { html: string; toc: { id: string; text: string; level: number }[] } {
  const toc: { id: string; text: string; level: number }[] = []
  let i = 0
  // H2·H3 모두 목차에 포함 (원장/직원 누구나 소제목만 넣으면 목차 자동 생성)
  const out = htmlStr.replace(/<(h2|h3)(\s[^>]*)?>([\s\S]*?)<\/\1>/gi, (_m, tag, attr, inner) => {
    const text = String(inner).replace(/<[^>]+>/g, '').trim()
    if (!text) return _m
    const id = `sec-${++i}`
    toc.push({ id, text, level: tag.toLowerCase() === 'h3' ? 3 : 2 })
    // 외부 복붙으로 제목 태그·내부 span에 인라인 글자크기가 박혀 있으면 제거해
    // 사이트의 제목 스타일(크게·굵게)이 항상 적용되도록 함
    const cleanAttr = String(attr || '').replace(/\sstyle\s*=\s*("[^"]*"|'[^']*')/gi, '')
    const cleanInner = String(inner).replace(/\s(?:style|face|color|size)\s*=\s*("[^"]*"|'[^']*')/gi, '')
    return `<${tag} id="${id}"${cleanAttr}>${cleanInner}</${tag}>`
  })
  return { html: out, toc }
}
// 읽기 시간 (한글 기준 분당 ~500자)
function readingMin(htmlStr: string): number {
  const text = String(htmlStr).replace(/<[^>]+>/g, '')
  return Math.max(1, Math.round(text.length / 500))
}

function emptyState(label: string, sub: string) {
  return `<div class="empty-state" data-reveal>
    <i class="far fa-folder-open"></i>
    <p class="t">${label}</p>
    <p class="s">${sub}</p>
  </div>`
}

// ============================================================================
// 비포/애프터 케이스 갤러리
// ============================================================================
export function CasesGalleryPage(items: CaseItem[], filter?: string, pageQ = 1) {
  const published = items.filter((x) => x.published).sort(byNewest)
  const cats = [...new Set(published.map((x) => x.treatmentSlug))]
  const cat = filter && cats.includes(filter) ? filter : ''
  const all = cat ? published.filter((x) => x.treatmentSlug === cat) : published
  const total = all.length
  const pages = Math.max(1, Math.ceil(total / LIST_PER))
  const page = Math.min(Math.max(1, pageQ), pages)
  const offset = (page - 1) * LIST_PER
  const list = all.slice(offset, offset + LIST_PER)
  const catT = cat ? getTreatment(cat) : undefined
  const crumb = [{ name: '홈', url: '/' }, { name: '비포 / 애프터', url: '/cases/gallery' }, ...(catT ? [{ name: catT.name, url: `/cases/gallery?treatment=${cat}` }] : [])]
  const qs = [cat ? `treatment=${cat}` : '', page > 1 ? `page=${page}` : ''].filter(Boolean).join('&')
  const path = `/cases/gallery${qs ? `?${qs}` : ''}`
  const pageSuffix = page > 1 ? ` (${page}페이지)` : ''

  const body = html`
  <section class="page-hero">
    <div class="container">
      <p class="eyebrow">Before &amp; After</p>
      <h1>${catT ? `${catT.name} 치료 전후 케이스` : '치료 전후 케이스'}</h1>
      <p class="lead">연세온치과에서 진행한 치료의 전후 기록입니다.<br>치료 결과는 개인의 구강 상태에 따라 다를 수 있습니다.</p>
    </div>
  </section>
  ${Breadcrumb(crumb)}

  <section class="section--tight">
    <div class="container">
      ${raw(cats.length ? `
      <nav class="faq-tabs" data-reveal aria-label="케이스 분류">
        <a href="/cases/gallery" class="faq-tab${!cat ? ' active' : ''}">전체</a>
        ${cats.map((slug) => {
          const t = getTreatment(slug)
          return `<a href="/cases/gallery?treatment=${slug}" class="faq-tab${cat === slug ? ' active' : ''}">${t?.name || slug}</a>`
        }).join('')}
      </nav>` : '')}
      ${raw(catT ? `<p class="muted" style="margin-top:1.2rem;font-size:.9rem">${catT.name} 케이스 ${total}건 · <a href="/treatments/${catT.slug}" class="link-arrow">${catT.name} 진료 안내</a> · <a href="/column?treatment=${catT.slug}" class="link-arrow">관련 원장 칼럼</a></p>` : '')}

      ${raw(list.length ? `
      <div class="cards cards--3" style="margin-top:2.5rem">
        ${list.map((cs, i) => {
          const t = getTreatment(cs.treatmentSlug)
          // 갤러리 카드는 비로그인에게도 노출 → 썸네일은 비포 사진만 사용 (애프터는 회원 전용)
          const img = cs.images.intraBefore || cs.images.panoBefore
          return `
          <a href="/cases/${cs.slug}" class="card" data-reveal data-reveal-delay="${(i % 3) + 1}">
            <div class="card-img">${img
              ? `<img src="${img}" alt="${escA(t?.name || '치과')} 치료 전" loading="lazy" decoding="async">`
              : `<div class="ph" style="height:100%"><span class="ph-label">CASE</span></div>`}</div>
            <span class="tag">${[t?.name || cs.treatmentSlug, [cs.ageGroup, cs.gender].filter(Boolean).join(' ')].filter(Boolean).join(' · ')}</span>
            <h2 style="font-size:1.25rem">${cs.title}</h2>
            ${caseMetaLine(cs) ? `<p>${caseMetaLine(cs)}</p>` : ''}
          </a>`
        }).join('')}
      </div>${pagerHtml(`/cases/gallery?${cat ? `treatment=${cat}&` : ''}`, page, pages)}` : emptyState('등록된 케이스를 준비하고 있습니다', '실제 치료 케이스가 순차적으로 업데이트될 예정입니다.'))}

      <p class="muted" style="font-size:.78rem;margin-top:3rem;line-height:1.8" data-reveal>
        ※ 본 게시물은 의료법 제56조를 준수하며, 치료 전후 사진은 동일 환자·동일 부위이며 환자 동의하에 게시되었습니다.
        치료 결과는 개인에 따라 다를 수 있으며, 부작용이 발생할 수 있으므로 전문의와 상담하시기 바랍니다.
      </p>
    </div>
  </section>
  ${raw(LIST_CSS)}
  `
  return Layout({
    title: `${catT ? `${catT.name} ` : ''}비포/애프터 케이스${pageSuffix} | ${clinic.nameKo}`,
    description: (catT
      ? `${clinic.nameKo} ${catT.name} 치료 전후 케이스 ${total}건 — 진단·치료 과정과 치료 기간을 공개합니다(치료 후 사진은 회원 전용). 결과는 개인에 따라 다를 수 있습니다.`
      : `${clinic.nameKo} 치료 전후(비포/애프터) 케이스 — 심미보철, All-on-X 전체임플란트, 접착수복 등 생체모방치의학 기반 실제 치료 기록을 ${clinic.addressLocality}에서 투명하게 공개합니다.`) + pageSuffix,
    path,
    jsonLd: [collectionGraph({ path, name: `${catT ? `${catT.name} ` : ''}치료 전후 케이스 목록${pageSuffix}`, total, offset, items: list.map((x) => ({ name: x.title, path: `/cases/${x.slug}` })), crumb })],
  }, body)
}

/** 목록·상세 보조 줄 — 비어 있는 항목은 건너뜀 (지역·기간이 없는 케이스) */
function caseMetaLine(cs: CaseItem, withPatient = false): string {
  return [withPatient ? [cs.ageGroup, cs.gender].filter(Boolean).join(' ') : '', cs.regionLabel, cs.duration ? `치료기간 ${cs.duration}` : '']
    .filter(Boolean).map(escA).join(' · ')
}

export function CaseDetailPage(cs: CaseItem, isMember = false, siblings: CaseItem[] = [], relCols: Column[] = []) {
  const t = getTreatment(cs.treatmentSlug)
  const doc = getDoctor(cs.doctorSlug)
  const crumb = [{ name: '홈', url: '/' }, { name: '비포 / 애프터', url: '/cases/gallery' }, ...(t ? [{ name: t.name, url: `/cases/gallery?treatment=${t.slug}` }] : []), { name: cs.title, url: `/cases/${cs.slug}` }]
  const txName = t?.name || '치과'
  const summary = caseAutoSummary(cs, txName, doc ? `${doc.name} ${doc.role}` : '', clinic.nameKo)

  // 회원 전용 잠금 오버레이 (애프터 사진)
  const lockOverlay = (label: string) => `
    <div style="position:absolute;inset:0;display:grid;place-items:center;background:rgba(20,36,62,.55);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);z-index:2">
      <div style="text-align:center;color:#fff;padding:1.5rem">
        <i class="fas fa-lock" style="font-size:1.6rem;color:var(--gold-light);margin-bottom:.8rem;display:block"></i>
        <p style="font-weight:600;margin-bottom:.3rem">${label} 치료 후 사진은 회원 전용입니다</p>
        <p style="font-size:.82rem;opacity:.75;margin-bottom:1.1rem">로그인하면 전체 전후 비교를 보실 수 있습니다</p>
        <a href="/login?back=/cases/${cs.slug}" class="btn-primary" style="font-size:.85rem;padding:.6rem 1.3rem">로그인</a>
        <a href="/signup?back=/cases/${cs.slug}" style="display:inline-block;margin-left:.6rem;color:var(--gold-light);font-size:.85rem;text-decoration:underline">회원가입</a>
      </div>
    </div>`

  // face: 안모(얼굴) — 세로 사진(2:3) 비율, alt "{진료명} 치료 전 안모" 형식, 게이트 정책은 구내·파노라마와 동일
  const pair = (label: string, before?: string, after?: string, face = false) => {
    if (!before && !after) return ''
    const box = face ? 'aspect-ratio:2/3;max-width:440px;margin:0 auto' : 'aspect-ratio:16/9'
    const altOf = (when: '치료 전' | '치료 후') => face ? `${txName} ${when} 안모` : `${txName} ${when} (${label})`
    // 비회원: 애프터 사진 잠금 — 비포만 표시 + 잠금 안내
    if (after && !isMember) {
      return `
      <div data-reveal style="margin-bottom:3rem">
        <h3 style="font-family:var(--serif-kr);font-size:1.2rem;margin-bottom:1rem">${label}</h3>
        <div style="position:relative;${box};overflow:hidden;border-radius:4px;background:var(--paper-2)">
          ${before
            ? `<img src="${before}" alt="${altOf('치료 전')}" loading="lazy" decoding="async" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
               <span style="position:absolute;left:1rem;top:1rem;background:rgba(0,0,0,.55);color:#fff;font-size:.7rem;letter-spacing:.14em;padding:.3rem .7rem;border-radius:2px;z-index:3">BEFORE</span>`
            : ''}
          ${lockOverlay(label)}
        </div>
        <p class="muted" style="font-size:.78rem;margin-top:.6rem">치료 후 사진은 회원 로그인 후 열람하실 수 있습니다.</p>
      </div>`
    }
    if (before && after) {
      return `
      <div data-reveal style="margin-bottom:3rem">
        <h3 style="font-family:var(--serif-kr);font-size:1.2rem;margin-bottom:1rem">${label}</h3>
        <div class="compare" data-compare style="position:relative;${box};overflow:hidden;border-radius:4px;background:var(--paper-2);cursor:ew-resize">
          <img src="${after}" alt="${altOf('치료 후')}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
          <div class="compare-top" style="position:absolute;inset:0;clip-path:inset(0 50% 0 0)">
            <img src="${before}" alt="${altOf('치료 전')}" style="width:100%;height:100%;object-fit:cover">
          </div>
          <div class="compare-handle" style="position:absolute;top:0;bottom:0;left:50%;width:2px;background:#fff;box-shadow:0 0 8px rgba(0,0,0,.4)"></div>
          <span style="position:absolute;left:1rem;top:1rem;background:rgba(0,0,0,.55);color:#fff;font-size:.7rem;letter-spacing:.14em;padding:.3rem .7rem;border-radius:2px">BEFORE</span>
          <span style="position:absolute;right:1rem;top:1rem;background:rgba(0,0,0,.55);color:#fff;font-size:.7rem;letter-spacing:.14em;padding:.3rem .7rem;border-radius:2px">AFTER</span>
        </div>
        <p class="muted" style="font-size:.78rem;margin-top:.6rem">좌우로 드래그하여 전후를 비교해 보세요.</p>
      </div>`
    }
    const single = before || after
    return `
    <div data-reveal style="margin-bottom:3rem">
      <h3 style="font-family:var(--serif-kr);font-size:1.2rem;margin-bottom:1rem">${label} (${before ? '치료 전' : '치료 후'})</h3>
      <img src="${single}" alt="${altOf(before ? '치료 전' : '치료 후')}" style="width:100%;${face ? 'max-width:440px;display:block;margin:0 auto;' : ''}border-radius:4px" loading="lazy">
    </div>`
  }

  const body = html`
  <section class="page-hero">
    <div class="container">
      <p class="eyebrow">${t?.name || 'Case'} Case</p>
      <h1 style="font-size:var(--t-h2)">${cs.title}</h1>
      ${raw(caseMetaLine(cs, true) ? `<p class="lead">${caseMetaLine(cs, true)}</p>` : '')}
    </div>
  </section>
  ${Breadcrumb(crumb)}

  <section class="section--tight">
    <div class="container">
      <div class="detail-grid">
        <div>
          <div class="answer-box" data-reveal>
            <p class="answer-label">CASE SUMMARY · 케이스 요약</p>
            <p class="answer-summary">${summary}</p>
            <dl>
              ${raw(t ? `<div><dt>진료</dt><dd><a href="/treatments/${t.slug}">${t.name}</a></dd></div>` : '')}
              ${raw(cs.duration ? `<div><dt>치료 기간</dt><dd>${escA(cs.duration)}</dd></div>` : '')}
              ${raw(doc ? `<div><dt>담당</dt><dd><a href="/doctors/${doc.slug}">${doc.name} ${doc.role}</a></dd></div>` : '')}
            </dl>
          </div>
          ${raw(pair('구내 사진', cs.images.intraBefore, cs.images.intraAfter))}
          ${raw(pair('파노라마', cs.images.panoBefore, cs.images.panoAfter))}
          ${raw(pair('안모(얼굴)', cs.images.faceBefore, cs.images.faceAfter, true))}
          <div class="prose" data-reveal>
            <h2>치료 이야기</h2>
            ${raw(autoLink(cs.description.split('\n').filter(Boolean).map((p) => `<p>${p}</p>`).join(''), 8))}
          </div>
          <p class="muted" style="font-size:.78rem;margin-top:2.5rem;line-height:1.8">
            ※ 동일 환자·동일 부위의 치료 전후 사진이며, 환자 동의하에 게시되었습니다. 치료 결과는 개인에 따라 다를 수 있으며 부작용이 발생할 수 있습니다.
          </p>
          ${raw(siblings.length ? `<div data-reveal style="margin-top:2.5rem"><h2 style="font-family:var(--serif-kr);font-size:1.25rem;margin-bottom:.8rem">${txName} 다른 케이스</h2>${siblings.map((x) => `<a href="/cases/${x.slug}" class="link-arrow" style="display:block;padding:.45rem 0">${x.title} <i class="fas fa-arrow-right"></i></a>`).join('')}<a href="/cases/gallery?treatment=${cs.treatmentSlug}" class="muted" style="font-size:.85rem">케이스 전체 보기 →</a></div>` : '')}
          ${raw(relCols.length ? `<div data-reveal style="margin-top:2rem"><h2 style="font-family:var(--serif-kr);font-size:1.25rem;margin-bottom:.8rem">${txName} 관련 원장 칼럼</h2>${relCols.map((x) => `<a href="/column/${x.slug}" class="link-arrow" style="display:block;padding:.45rem 0">${x.title} <i class="fas fa-arrow-right"></i></a>`).join('')}</div>` : '')}
        </div>
        <aside class="sidebar">
          ${raw(doc ? `
          <div class="sidebar-box">
            <h3>담당 의료진</h3>
            <p style="font-weight:600;color:var(--ink)">${doc.name} ${doc.role}</p>
            <p class="muted" style="font-size:.85rem;margin:.4rem 0 .8rem">${doc.title}</p>
            <a href="/doctors/${doc.slug}" class="link-arrow" style="font-size:.88rem">의료진 소개 <i class="fas fa-arrow-right"></i></a>
          </div>` : '')}
          ${raw(t ? `
          <div class="sidebar-box">
            <h3>관련 진료</h3>
            <a href="/treatments/${t.slug}">${t.name}</a>
          </div>` : '')}
          <div class="sidebar-box">
            <h3>상담</h3>
            <a href="/reservation">예약 상담 신청</a>
            <a href="tel:${clinic.phoneRaw}">${clinic.phone}</a>
          </div>
        </aside>
      </div>
    </div>
  </section>
  <script>fetch('/api/views/case/${cs.id}',{method:'POST'}).catch(function(){});</script>
  ${raw(LIST_CSS)}
  `
  const path = `/cases/${cs.slug}`
  const url = BASE + path
  const pubImg = cs.images.intraBefore || cs.images.panoBefore // 공개 사진 = 치료 전만 (안모는 절대 사용 금지)
  const bc: any = breadcrumbSchema(crumb); delete bc['@context']; bc['@id'] = url + '#breadcrumb'
  const desc = clipSentences(`${cs.title}. ${flatText(cs.description) || summary}`, 155, 60)
  // MedicalWebPage (Review·Rating 없음 — 의료법)
  const graph = [
    {
      '@type': 'MedicalWebPage',
      '@id': url + '#webpage',
      url,
      name: `${t ? `${t.name} 케이스 — ` : ''}${cs.title}`,
      description: desc,
      inLanguage: 'ko',
      isPartOf: { '@id': BASE + '/#website' },
      breadcrumb: { '@id': url + '#breadcrumb' },
      about: t ? { '@id': BASE + '/treatments/' + t.slug + '#procedure' } : { '@id': BASE + '/#clinic' },
      ...(doc ? { reviewedBy: { '@id': BASE + '/doctors/' + doc.slug + '#person' } } : {}),
      ...(cs.createdAt ? { datePublished: cs.createdAt, dateModified: (cs as any).updatedAt || cs.createdAt, lastReviewed: kstYmd((cs as any).updatedAt || cs.createdAt) } : {}),
      ...(pubImg ? { primaryImageOfPage: { '@type': 'ImageObject', url: BASE + pubImg, caption: `${txName} 치료 전` } } : {}),
      medicalAudience: { '@type': 'MedicalAudience', audienceType: 'Patient' },
      speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '.answer-summary'] },
    },
    bc,
  ]
  return Layout({
    title: `${t ? `${t.name} 케이스 — ` : ''}${cs.title}${cs.duration ? ` (${cs.duration})` : ''} | ${clinic.nameKo}`,
    description: desc,
    path,
    ogType: 'article',
    article: { published: cs.createdAt, modified: (cs as any).updatedAt || cs.createdAt, section: t?.name },
    jsonLd: [{ '@context': 'https://schema.org', '@graph': graph }],
  }, body)
}

// ============================================================================
// 원장 칼럼
// ============================================================================
export function ColumnsPage(items: Column[], pageQ = 1, treatment?: string) {
  const pub = items.filter((x) => x.published).sort(byNewest)
  const usedTx = ALL_TREATMENTS.filter((t) => pub.some((x) => (x.relatedTreatments || []).includes(t.slug)))
  const tx = treatment && usedTx.some((t) => t.slug === treatment) ? getTreatment(treatment) : undefined
  const all = tx ? pub.filter((x) => (x.relatedTreatments || []).includes(tx.slug)) : pub
  const total = all.length
  const pages = Math.max(1, Math.ceil(total / LIST_PER))
  const page = Math.min(Math.max(1, pageQ), pages)
  const offset = (page - 1) * LIST_PER
  const list = all.slice(offset, offset + LIST_PER)
  const crumb = [{ name: '홈', url: '/' }, { name: '원장 칼럼', url: '/column' }, ...(tx ? [{ name: tx.name, url: `/column?treatment=${tx.slug}` }] : [])]
  const qs = [tx ? `treatment=${tx.slug}` : '', page > 1 ? `page=${page}` : ''].filter(Boolean).join('&')
  const path = `/column${qs ? `?${qs}` : ''}`
  const pageSuffix = page > 1 ? ` (${page}페이지)` : ''
  const body = html`
  <section class="page-hero">
    <div class="container">
      <p class="eyebrow">Column</p>
      <h1>원장 칼럼</h1>
      <p class="lead">치아 건강에 대해 알아두면 좋은 이야기를 전합니다.</p>
    </div>
  </section>
  ${Breadcrumb(crumb)}

  <section class="section--tight">
    <div class="container">
      ${raw(usedTx.length >= 2 ? `
      <nav class="faq-tabs" data-reveal aria-label="진료별 칼럼" style="margin-bottom:2rem">
        <a href="/column" class="faq-tab${!tx ? ' active' : ''}">전체</a>
        ${usedTx.map((t) => `<a href="/column?treatment=${t.slug}" class="faq-tab${tx?.slug === t.slug ? ' active' : ''}">${t.name}</a>`).join('')}
      </nav>` : '')}
      ${raw(tx ? `<p class="muted" style="margin:-.8rem 0 2rem;font-size:.9rem">${tx.name} 칼럼 ${total}편 · <a href="/treatments/${tx.slug}" class="link-arrow">${tx.name} 진료 안내</a> · <a href="/cases/gallery?treatment=${tx.slug}" class="link-arrow">${tx.name} 케이스</a></p>` : '')}
      ${raw(list.length ? `
      <div class="col-grid">
        ${list.map((col, i) => {
          const doc = columnDoctor(col)
          const thumb = col.thumbnail
          const alt = `${col.title}${doc ? ` — ${doc.name} ${doc.role}` : ''}`
          const media = thumb
            ? `<span class="col-thumb"><img src="${thumb}" alt="${alt.replace(/"/g, '&quot;')}" loading="lazy" decoding="async"></span>`
            : `<span class="col-thumb col-thumb--ph" aria-hidden="true"><i class="fas fa-pen-nib"></i></span>`
          return `
          <a class="col-card" href="/column/${col.slug}" data-reveal data-reveal-delay="${(i % 3) + 1}">
            ${media}
            <span class="col-body">
              <span class="col-date">${fmt(col.createdAt)}</span>
              <span class="col-title">${col.title}</span>
              <span class="col-excerpt">${col.excerpt}</span>
              ${doc ? `<span class="col-author"><i class="fas fa-user-doctor"></i> ${doc.name} ${doc.role}</span>` : `<span class="col-author"><i class="fas fa-hospital"></i> ${clinic.nameKo} 발행</span>`}
            </span>
          </a>`
        }).join('')}
      </div>${pagerHtml(`/column?${tx ? `treatment=${tx.slug}&` : ''}`, page, pages)}` : emptyState('칼럼을 준비하고 있습니다', '원장이 직접 쓰는 치아 건강 이야기가 곧 게시됩니다.'))}
    </div>
  </section>
  ${raw(LIST_CSS)}

  <style>
    .col-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:2rem 1.8rem; }
    .col-card{ display:flex; flex-direction:column; background:var(--paper,#FAF8F2); border:1px solid var(--line,#E1DCCC); border-radius:14px; overflow:hidden; transition:transform .4s var(--ease,ease), box-shadow .4s var(--ease,ease), border-color .4s; }
    .col-card:hover{ transform:translateY(-5px); box-shadow:0 16px 38px rgba(20,36,62,.12); border-color:#C9BE9E; }
    .col-thumb{ display:block; aspect-ratio:16/10; overflow:hidden; background:var(--paper-2,#EFEBE1); }
    .col-thumb img{ width:100%; height:100%; object-fit:cover; transition:transform 1s var(--ease,ease); }
    .col-card:hover .col-thumb img{ transform:scale(1.06); }
    .col-thumb--ph{ display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#1a2c4a,#0c1830); color:rgba(224,201,155,.55); font-size:2.4rem; }
    .col-body{ display:flex; flex-direction:column; gap:.5rem; padding:1.4rem 1.5rem 1.6rem; flex:1; }
    .col-date{ font-family:var(--serif,serif); font-size:.85rem; color:var(--mist-2,#8A93A6); font-variant-numeric:oldstyle-nums; }
    .col-title{ font-family:var(--serif-kr,var(--serif,serif)); font-size:1.28rem; line-height:1.35; color:var(--ink,#14243E); letter-spacing:-.01em; }
    .col-excerpt{ font-size:.92rem; line-height:1.6; color:var(--mist,#6b7280); display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
    .col-author{ margin-top:auto; padding-top:.7rem; font-size:.82rem; color:var(--mist-2,#8A93A6); display:flex; align-items:center; gap:.4rem; }
    .col-author i{ color:#AE8A4C; }
    @media (max-width:960px){ .col-grid{ grid-template-columns:repeat(2,1fr); gap:1.6rem; } }
    @media (max-width:600px){ .col-grid{ grid-template-columns:1fr; } .col-thumb{ aspect-ratio:16/9; } }
  </style>
  `
  return Layout({
    title: `${tx ? `${tx.name} ` : ''}원장 칼럼${pageSuffix} | ${clinic.nameKo}`,
    description: (tx
      ? `${clinic.nameKo} ${tx.name} 칼럼 ${total}편 — ${tx.name} 진료 전에 알아두면 좋은 정보.`
      : `${clinic.nameKo} 원장 칼럼 — 생체모방치의학, 심미보철, 임플란트(All-on-X), 충치·턱관절 치료에 대한 전문의의 깊이 있는 이야기를 ${clinic.addressLocality} 온천장역 연세온치과에서 전합니다.`) + pageSuffix,
    path,
    jsonLd: [collectionGraph({ path, name: `${tx ? `${tx.name} ` : ''}원장 칼럼 목록${pageSuffix}`, total, offset, items: list.map((x) => ({ name: x.title, path: `/column/${x.slug}` })), crumb })],
  }, body)
}

// 스킴 없이 저장된 외부 링크(href="blog.naver.com/…")는 브라우저·크롤러가 현재 경로 기준 상대주소로 해석해
// /column/blog.naver.com/… 404 가 된다 → 도메인 형태의 href 에 https:// 를 붙여 렌더 (저장된 원문은 그대로)
const BARE_HREF_RE = /(<a\b[^>]*?\bhref=)(["'])(?![a-z][a-z0-9+.-]*:|\/|#|\?|\.)((?:[a-z0-9-]+\.)+(?:com|net|org|kr|co|me|io|tv|ly|gl|app|link|page|site|info|biz)(?:[/?#][^"']*)?)\2/gi
export function fixBareHrefs(h: string): string {
  return (h || '').replace(BARE_HREF_RE, '$1$2https://$3$2')
}

export function ColumnDetailPage(col: Column, relCols: Column[] = [], relCases: CaseItem[] = []) {
  // 대행사 투입 글·원장 미지정 글은 병원 발행 — 원장 저자·감수 표시 없음 (lib/authorship.ts)
  const doc = columnDoctor(col)
  const related = (col.relatedTreatments || []).map((s) => getTreatment(s)).filter(Boolean)
  const mainTx = related[0]
  const crumb = [{ name: '홈', url: '/' }, { name: '원장 칼럼', url: '/column' }, ...(mainTx ? [{ name: mainTx.name, url: `/column?treatment=${mainTx.slug}` }] : []), { name: col.title, url: `/column/${col.slug}` }]
  const summary = answerSummary(col.contentHtml, col.excerpt)
  const reviewed = kstYmd(col.updatedAt || col.createdAt)
  const { html: anchoredHtml, toc } = buildToc(enhanceArticleImages(fixBareHrefs(col.contentHtml), col.title).replace(/<(\/?)h1\b/gi, '<$1h2'))
  const mins = readingMin(col.contentHtml)
  const updated = col.updatedAt && col.updatedAt.slice(0, 10) !== col.createdAt.slice(0, 10)
  const body = html`
  <section class="page-hero">
    <div class="container">
      <p class="eyebrow">Column · ${fmt(col.createdAt)}${raw(updated ? ` · 수정 ${fmt(col.updatedAt)}` : '')} · 읽기 ${mins}분</p>
      <h1 style="font-size:var(--t-h2)">${col.title}</h1>
      ${raw(doc ? `<p class="lead" style="font-size:1rem;color:var(--mist)">글 · ${doc.name} ${doc.role} (${doc.title})</p>` : `<p class="lead" style="font-size:1rem;color:var(--mist)">${clinic.nameKo} 발행 · ${CLINIC_GENERAL_INFO_NOTE}</p>`)}
    </div>
  </section>
  ${Breadcrumb(crumb)}

  <section class="section--tight">
    <div class="container">
      <div class="detail-grid">
        <article class="prose" data-reveal>
          ${raw(summary ? `<div class="answer-box"><p class="answer-label">KEY ANSWER · 핵심 답변</p><p class="answer-summary">${escA(summary)}</p></div>` : '')}
          ${raw(col.thumbnail ? `<img src="${col.thumbnail}" alt="${escA(col.metaTitle || col.title)}" style="width:100%;border-radius:4px;margin-bottom:2.5rem" fetchpriority="high" decoding="async">` : '')}
          ${raw(autoLink(anchoredHtml, 10))}
          ${raw(doc ? `
          <div style="border-top:1px solid var(--line);margin-top:3.5rem;padding-top:2rem">
            <p class="muted" style="font-size:.8rem;letter-spacing:.12em;text-transform:uppercase;margin-bottom:.6rem">Written &amp; Reviewed by</p>
            <p style="font-weight:600;color:var(--ink);margin-bottom:.2rem"><a href="/doctors/${doc.slug}">${doc.name} ${doc.role}</a></p>
            <p class="muted" style="font-size:.88rem">${doc.licenses.join(' · ')}</p>
            <p class="muted" style="font-size:.82rem;margin-top:.4rem">게시 ${fmt(col.createdAt)}${reviewed ? ` · 최종 검토 ${reviewed.replace(/-/g, '.')}` : ''}</p>
          </div>` : `
          <div style="border-top:1px solid var(--line);margin-top:3.5rem;padding-top:2rem">
            <p class="muted" style="font-size:.8rem;letter-spacing:.12em;text-transform:uppercase;margin-bottom:.6rem">Published by</p>
            <p style="font-weight:600;color:var(--ink);margin-bottom:.2rem">${clinic.nameKo}</p>
            <p class="muted" style="font-size:.88rem">${CLINIC_GENERAL_INFO_NOTE}</p>
            <p class="muted" style="font-size:.82rem;margin-top:.4rem">게시 ${fmt(col.createdAt)}${updated ? ` · 수정 ${fmt(col.updatedAt)}` : ''}</p>
          </div>`)}
          <p class="muted" style="font-size:.78rem;margin-top:1.4rem;line-height:1.8">※ 이 글은 일반적인 치과 건강 정보이며 진단을 대신하지 않습니다. 치료 방법과 결과는 개인의 구강 상태에 따라 다를 수 있으니 정확한 내용은 내원하여 전문의와 상담하시기 바랍니다.</p>
          ${raw(relCases.length ? `<div style="margin-top:2.5rem"><h2 style="font-size:1.25rem">${mainTx ? mainTx.name + ' ' : ''}치료 케이스</h2>${relCases.map((x) => `<a href="/cases/${x.slug}" class="link-arrow" style="display:block;padding:.4rem 0">${x.title} <i class="fas fa-arrow-right"></i></a>`).join('')}</div>` : '')}
          ${raw(relCols.length ? `<div style="margin-top:2rem"><h2 style="font-size:1.25rem">함께 읽으면 좋은 칼럼</h2>${relCols.map((x) => `<a href="/column/${x.slug}" class="link-arrow" style="display:block;padding:.4rem 0">${x.title} <i class="fas fa-arrow-right"></i></a>`).join('')}</div>` : '')}
        </article>
        <aside class="sidebar">
          ${raw(toc.length >= 2 ? `
          <div class="sidebar-box toc-box">
            <h3>목차</h3>
            ${toc.map((t) => `<a href="#${t.id}" class="toc-link${t.level === 3 ? ' toc-sub' : ''}">${t.text}</a>`).join('')}
          </div>` : '')}
          ${raw(related.length ? `
          <div class="sidebar-box">
            <h3>관련 진료</h3>
            ${related.map((t) => `<a href="/treatments/${t!.slug}">${t!.name}</a>`).join('')}
          </div>` : '')}
          <div class="sidebar-box">
            <h3>상담</h3>
            <a href="/reservation">예약 상담 신청</a>
            <a href="tel:${clinic.phoneRaw}">${clinic.phone}</a>
          </div>
        </aside>
      </div>
    </div>
  </section>
  <style>
    .toc-box .toc-link{display:block;font-size:.88rem;line-height:1.4;padding:.35rem 0;color:var(--ink-soft,#4a5364);border-bottom:1px dashed var(--line)}
    .toc-box .toc-link:last-child{border-bottom:0}
    .toc-box .toc-link:hover{color:var(--gold,#C59F66)}
    .toc-box .toc-sub{padding-left:.9rem;font-size:.8rem;color:var(--ink-soft,#6b7280);position:relative}
    .toc-box .toc-sub::before{content:'ㄴ';position:absolute;left:0;color:var(--line,#d8dce3);font-size:.72rem}
    html{scroll-behavior:smooth}
    .prose h2,.prose h3{scroll-margin-top:90px}
  </style>
  <script>fetch('/api/views/column/${col.id}',{method:'POST'}).catch(function(){});</script>
  ${raw(LIST_CSS)}
  `
  const path = `/column/${col.slug}`
  const url = BASE + path
  const desc = col.metaDescription || clipSentences(flatText(col.excerpt) || summary, 160, 60)
  const authorId = doc ? BASE + '/doctors/' + doc.slug + '#person' : undefined
  const faqs = faqsFromArticleHtml(col.contentHtml)
  const bc: any = breadcrumbSchema(crumb); delete bc['@context']; bc['@id'] = url + '#breadcrumb'
  const image = col.thumbnail ? BASE + col.thumbnail : BASE + '/static/img/og-default.jpg'
  const graph: any[] = [
    {
      '@type': 'BlogPosting',
      '@id': url + '#article',
      headline: (col.metaTitle || col.title).slice(0, 110),
      name: col.title,
      description: desc,
      image: { '@type': 'ImageObject', url: image },
      datePublished: col.createdAt,
      dateModified: col.updatedAt || col.createdAt,
      inLanguage: 'ko',
      ...(authorId ? { author: { '@id': authorId }, reviewedBy: { '@id': authorId } } : { author: { '@id': BASE + '/#clinic' } }),
      publisher: { '@id': BASE + '/#clinic' },
      mainEntityOfPage: { '@id': url + '#webpage' },
      isPartOf: { '@id': BASE + '/#website' },
      ...(mainTx ? { about: related.map((t) => ({ '@id': BASE + '/treatments/' + t!.slug + '#procedure' })), articleSection: mainTx.name } : {}),
      speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '.answer-summary'] },
    },
    {
      '@type': 'MedicalWebPage',
      '@id': url + '#webpage',
      url,
      name: col.metaTitle || col.title,
      description: desc,
      inLanguage: 'ko',
      isPartOf: { '@id': BASE + '/#website' },
      mainEntity: { '@id': url + '#article' },
      breadcrumb: { '@id': url + '#breadcrumb' },
      ...(mainTx ? { about: { '@id': BASE + '/treatments/' + mainTx.slug + '#procedure' } } : {}),
      ...(authorId ? { reviewedBy: { '@id': authorId } } : {}),
      ...(authorId && reviewed ? { lastReviewed: reviewed } : {}),
      datePublished: col.createdAt,
      dateModified: col.updatedAt || col.createdAt,
      medicalAudience: { '@type': 'MedicalAudience', audienceType: 'Patient' },
      speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '.answer-summary'] },
    },
    bc,
    ...(faqs.length ? [{ '@type': 'FAQPage', '@id': url + '#faq', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }] : []),
  ]
  return Layout({
    title: col.metaTitle || `${col.title} | ${clinic.nameKo}`,
    description: desc,
    path,
    ogImage: col.thumbnail ? clinic.domain + col.thumbnail : undefined,
    ogType: 'article',
    article: { published: col.createdAt, modified: col.updatedAt || col.createdAt, section: mainTx?.name },
    jsonLd: [{ '@context': 'https://schema.org', '@graph': graph }],
  }, body)
}

// ============================================================================
// 공지사항
// ============================================================================
export function NoticesPage(items: Notice[]) {
  const crumb = [{ name: '홈', url: '/' }, { name: '공지사항', url: '/notice' }]
  const list = items.filter((x) => x.published).sort((a, b) => Number(b.pinned) - Number(a.pinned))
  // 색인 대상(본문 300자 이상) 공지가 하나도 없으면 목록도 noindex, follow (lib/thin-content.ts)
  const listThin = !list.some((n) => !isThinNotice(n))
  const body = html`
  <section class="page-hero">
    <div class="container"><p class="eyebrow">Notice</p><h1>공지사항</h1></div>
  </section>
  ${Breadcrumb(crumb)}
  <section class="section--tight">
    <div class="container">
      ${raw(list.length ? `
      <div class="index-list" style="max-width:880px">
        ${list.map((n) => `
          <a class="index-row" href="/notice/${n.id}" data-reveal style="grid-template-columns:1fr auto">
            <span>
              <span class="row-title" style="font-size:1.15rem">${n.pinned ? '<span class="badge" style="background:var(--ink);color:var(--paper);font-size:.62rem;padding:.2rem .5rem;border-radius:2px;margin-right:.6rem;vertical-align:middle">공지</span>' : ''}${n.title}</span>
            </span>
            <span class="muted" style="font-size:.85rem">${fmt(n.createdAt)}</span>
          </a>`).join('')}
      </div>` : emptyState('등록된 공지사항이 없습니다', '병원 소식과 안내사항이 게시될 예정입니다.'))}
    </div>
  </section>
  `
  return Layout({
    title: `공지사항 | ${clinic.nameKo}`,
    description: `${clinic.nameKo} 공지사항 — 진료 일정, 병원 소식 안내.`,
    path: '/notice',
    jsonLd: [breadcrumbSchema(crumb)],
    robots: listThin ? NOINDEX_FOLLOW : undefined,
  }, body)
}

export function NoticeDetailPage(n: Notice) {
  const crumb = [{ name: '홈', url: '/' }, { name: '공지사항', url: '/notice' }, { name: n.title, url: `/notice/${n.id}` }]
  const body = html`
  <section class="page-hero">
    <div class="container">
      <p class="eyebrow">Notice · ${fmt(n.createdAt)}</p>
      <h1 style="font-size:var(--t-h2)">${n.title}</h1>
    </div>
  </section>
  ${Breadcrumb(crumb)}
  <section class="section--tight">
    <div class="container">
      <article class="prose" data-reveal>
        ${raw(n.image ? `<img src="${n.image}" alt="${n.title}" style="width:100%;border-radius:4px;margin-bottom:2rem">` : '')}
        ${raw(fixBareHrefs(n.contentHtml))}
      </article>
      <a href="/notice" class="link-arrow" style="margin-top:3rem;display:inline-block">목록으로 <i class="fas fa-arrow-left"></i></a>
    </div>
  </section>
  <script>fetch('/api/views/notice/${n.id}',{method:'POST'}).catch(function(){});</script>
  `
  return Layout({
    title: `${n.title} | 공지사항 | ${clinic.nameKo}`,
    description: `${n.title} — ${clinic.nameKo} 공지사항. ${clinic.subway}. ${(n.contentHtml || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 100) || '진료 일정과 병원 소식을 안내드립니다.'}`,
    path: `/notice/${n.id}`,
    jsonLd: [breadcrumbSchema(crumb)],
    robots: isThinNotice(n) ? NOINDEX_FOLLOW : undefined, // 본문 300자 미만 공지 → noindex, follow
  }, body)
}

// ============================================================================
// 병원 영상
// ============================================================================
export async function VideoPage() {
  const crumb = [{ name: '홈', url: '/' }, { name: '병원 영상', url: '/video' }]
  // 고정 영상 + 유튜브 RSS 자동 영상(쇼츠 제외) 병합. RSS 실패 시 고정 영상만 표시.
  const videos = await getMergedVideos(clinic.youtubeChannelId, clinic.videosPinned ?? [], 9)
  const hasVideos = videos.length > 0
  const watchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`
  // 유튜브 썸네일 자동 생성 (maxresdefault 우선, 실패 시 hqdefault로 fallback)
  const thumbUrl = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`

  const grid = `
    <div class="video-grid">
      ${videos.map((v) => `
        <a class="video-card" href="${watchUrl(v.id)}" target="_blank" rel="noopener" aria-label="유튜브에서 재생: ${v.title}">
          <div class="video-thumb">
            <img src="${thumbUrl(v.id)}" alt="${v.title} — 연세온치과 유튜브 영상 썸네일" loading="lazy" width="480" height="360">
            <span class="video-play" aria-hidden="true"><i class="fas fa-play"></i></span>
          </div>
          <p class="video-title">${v.title}</p>
        </a>`).join('')}
    </div>
    <div style="text-align:center;margin-top:2.4rem">
      <a href="${clinic.sns.youtube}" target="_blank" rel="noopener" class="btn btn-primary">유튜브 채널 전체 보기 <i class="fab fa-youtube"></i></a>
    </div>`

  const body = html`
  <section class="page-hero">
    <div class="container"><p class="eyebrow">Video</p><h1>병원 영상</h1>
    <p class="lead">연세온치과의 공간과 진료 이야기를 영상으로 만나보세요.</p></div>
  </section>
  ${Breadcrumb(crumb)}
  <section class="section--tight">
    <div class="container">
      ${raw(hasVideos ? grid : emptyState('영상을 준비하고 있습니다', '병원 소개·진료 안내 영상이 곧 게시됩니다.'))}
    </div>
  </section>
  <style>
    .video-grid{ display:grid;grid-template-columns:repeat(3,1fr);gap:1.6rem }
    .video-card{ display:block;text-decoration:none;color:inherit }
    .video-thumb{ position:relative;aspect-ratio:16/9;border-radius:12px;overflow:hidden;background:#000;box-shadow:0 2px 12px rgba(0,0,0,.08) }
    .video-thumb img{ width:100%;height:100%;object-fit:cover;display:block;transition:transform .4s var(--ease) }
    .video-card:hover .video-thumb img{ transform:scale(1.05) }
    .video-play{ position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.18);transition:background .3s var(--ease) }
    .video-play i{ width:58px;height:58px;border-radius:50%;background:rgba(220,40,40,.92);color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.3rem;padding-left:4px;box-shadow:0 4px 16px rgba(0,0,0,.3);transition:transform .3s var(--ease) }
    .video-card:hover .video-play{ background:rgba(0,0,0,.28) }
    .video-card:hover .video-play i{ transform:scale(1.12) }
    .video-title{ margin-top:.85rem;font-size:.98rem;font-weight:600;color:var(--navy);line-height:1.5;word-break:keep-all }
    .video-card:hover .video-title{ color:var(--gold-2) }
    @media (max-width:820px){ .video-grid{ grid-template-columns:1fr;gap:1.4rem } }
  </style>
  `
  return Layout({
    title: `병원 영상 | ${clinic.nameKo}`,
    description: `${clinic.nameKo} 병원 소개 영상 — 진료실·수술실·장비, 생체모방치의학 진료 과정과 ${clinic.addressLocality} 온천장역 인근 병원 환경을 영상으로 안내합니다.`,
    path: '/video',
    jsonLd: [breadcrumbSchema(crumb)],
  }, body)
}
