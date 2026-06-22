import { html, raw } from 'hono/html'
import { Layout, Breadcrumb } from '../components/layout'
import { clinic } from '../data/clinic'
import { getTreatment } from '../data/treatments'
import { getDoctor } from '../data/doctors'
import { breadcrumbSchema, articleSchema } from '../lib/schema'
import type { CaseItem, Column, Notice } from '../data/types'
import { autoLink } from '../lib/inlink'

const fmt = (iso: string) => (iso || '').slice(0, 10).replace(/-/g, '.')

// 본문 H2에 anchor id 부여 + 목차(TOC) 추출
function buildToc(htmlStr: string): { html: string; toc: { id: string; text: string }[] } {
  const toc: { id: string; text: string }[] = []
  let i = 0
  const out = htmlStr.replace(/<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/gi, (_m, attr, inner) => {
    const text = String(inner).replace(/<[^>]+>/g, '').trim()
    const id = `sec-${++i}`
    toc.push({ id, text })
    return `<h2 id="${id}"${attr || ''}>${inner}</h2>`
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
export function CasesGalleryPage(items: CaseItem[], filter?: string) {
  const crumb = [{ name: '홈', url: '/' }, { name: '비포 / 애프터', url: '/cases/gallery' }]
  const published = items.filter((x) => x.published)
  const cats = [...new Set(published.map((x) => x.treatmentSlug))]
  const list = filter ? published.filter((x) => x.treatmentSlug === filter) : published

  const body = html`
  <section class="page-hero">
    <div class="container">
      <p class="eyebrow">Before &amp; After</p>
      <h1>치료 전후 케이스</h1>
      <p class="lead">연세온치과에서 진행한 치료의 전후 기록입니다.<br>치료 결과는 개인의 구강 상태에 따라 다를 수 있습니다.</p>
    </div>
  </section>
  ${Breadcrumb(crumb)}

  <section class="section--tight">
    <div class="container">
      ${raw(cats.length ? `
      <nav class="faq-tabs" data-reveal aria-label="케이스 분류">
        <a href="/cases/gallery" class="faq-tab${!filter ? ' active' : ''}">전체</a>
        ${cats.map((slug) => {
          const t = getTreatment(slug)
          return `<a href="/cases/gallery?treatment=${slug}" class="faq-tab${filter === slug ? ' active' : ''}">${t?.name || slug}</a>`
        }).join('')}
      </nav>` : '')}

      ${raw(list.length ? `
      <div class="cards cards--3" style="margin-top:2.5rem">
        ${list.map((cs, i) => {
          const t = getTreatment(cs.treatmentSlug)
          // 갤러리 카드는 비로그인에게도 노출 → 썸네일은 비포 사진만 사용 (애프터는 회원 전용)
          const img = cs.images.intraBefore || cs.images.panoBefore
          return `
          <a href="/cases/${cs.slug}" class="card" data-reveal data-reveal-delay="${(i % 3) + 1}">
            <div class="card-img">${img
              ? `<img src="${img}" alt="${cs.title}" loading="lazy">`
              : `<div class="ph" style="height:100%"><span class="ph-label">CASE</span></div>`}</div>
            <span class="tag">${t?.name || cs.treatmentSlug} · ${cs.ageGroup} ${cs.gender}</span>
            <h3 style="font-size:1.25rem">${cs.title}</h3>
            <p>${cs.regionLabel} · 치료기간 ${cs.duration}</p>
          </a>`
        }).join('')}
      </div>` : emptyState('등록된 케이스를 준비하고 있습니다', '실제 치료 케이스가 순차적으로 업데이트될 예정입니다.'))}

      <p class="muted" style="font-size:.78rem;margin-top:3rem;line-height:1.8" data-reveal>
        ※ 본 게시물은 의료법 제56조를 준수하며, 치료 전후 사진은 동일 환자·동일 부위이며 환자 동의하에 게시되었습니다.
        치료 결과는 개인에 따라 다를 수 있으며, 부작용이 발생할 수 있으므로 전문의와 상담하시기 바랍니다.
      </p>
    </div>
  </section>
  `
  return Layout({
    title: `비포/애프터 케이스 | ${clinic.nameKo}`,
    description: `${clinic.nameKo} 치료 전후(비포/애프터) 케이스 — 심미보철, All-on-X 전체임플란트, 접착수복 등 생체모방치의학 기반 실제 치료 기록을 ${clinic.addressLocality}에서 투명하게 공개합니다.`,
    path: '/cases/gallery',
    jsonLd: [breadcrumbSchema(crumb)],
  }, body)
}

export function CaseDetailPage(cs: CaseItem, isMember = false) {
  const crumb = [{ name: '홈', url: '/' }, { name: '비포 / 애프터', url: '/cases/gallery' }, { name: cs.title, url: `/cases/${cs.slug}` }]
  const t = getTreatment(cs.treatmentSlug)
  const doc = getDoctor(cs.doctorSlug)

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

  const pair = (label: string, before?: string, after?: string) => {
    if (!before && !after) return ''
    // 비회원: 애프터 사진 잠금 — 비포만 표시 + 잠금 안내
    if (after && !isMember) {
      return `
      <div data-reveal style="margin-bottom:3rem">
        <h3 style="font-family:var(--serif-kr);font-size:1.2rem;margin-bottom:1rem">${label}</h3>
        <div style="position:relative;aspect-ratio:16/9;overflow:hidden;border-radius:4px;background:var(--paper-2)">
          ${before
            ? `<img src="${before}" alt="${label} 치료 전" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
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
        <div class="compare" data-compare style="position:relative;aspect-ratio:16/9;overflow:hidden;border-radius:4px;background:var(--paper-2);cursor:ew-resize">
          <img src="${after}" alt="${label} 치료 후" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
          <div class="compare-top" style="position:absolute;inset:0;clip-path:inset(0 50% 0 0)">
            <img src="${before}" alt="${label} 치료 전" style="width:100%;height:100%;object-fit:cover">
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
      <img src="${single}" alt="${label}" style="width:100%;border-radius:4px" loading="lazy">
    </div>`
  }

  const body = html`
  <section class="page-hero">
    <div class="container">
      <p class="eyebrow">${t?.name || 'Case'} Case</p>
      <h1 style="font-size:var(--t-h2)">${cs.title}</h1>
      <p class="lead">${cs.ageGroup} ${cs.gender} · ${cs.regionLabel} · 치료기간 ${cs.duration}</p>
    </div>
  </section>
  ${Breadcrumb(crumb)}

  <section class="section--tight">
    <div class="container">
      <div class="detail-grid">
        <div>
          ${raw(pair('구내 사진', cs.images.intraBefore, cs.images.intraAfter))}
          ${raw(pair('파노라마', cs.images.panoBefore, cs.images.panoAfter))}
          <div class="prose" data-reveal>
            <h2>치료 이야기</h2>
            ${raw(autoLink(cs.description.split('\n').filter(Boolean).map((p) => `<p>${p}</p>`).join(''), 8))}
          </div>
          <p class="muted" style="font-size:.78rem;margin-top:2.5rem;line-height:1.8">
            ※ 동일 환자·동일 부위의 치료 전후 사진이며, 환자 동의하에 게시되었습니다. 치료 결과는 개인에 따라 다를 수 있으며 부작용이 발생할 수 있습니다.
          </p>
        </div>
        <aside class="sidebar">
          ${raw(doc ? `
          <div class="sidebar-box">
            <h4>담당 의료진</h4>
            <p style="font-weight:600;color:var(--ink)">${doc.name} ${doc.role}</p>
            <p class="muted" style="font-size:.85rem;margin:.4rem 0 .8rem">${doc.title}</p>
            <a href="/doctors/${doc.slug}" class="link-arrow" style="font-size:.88rem">의료진 소개 <i class="fas fa-arrow-right"></i></a>
          </div>` : '')}
          ${raw(t ? `
          <div class="sidebar-box">
            <h4>관련 진료</h4>
            <a href="/treatments/${t.slug}">${t.name}</a>
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
  <script>fetch('/api/views/case/${cs.id}',{method:'POST'}).catch(function(){});</script>
  `
  return Layout({
    title: `${cs.title} | 케이스 | ${clinic.nameKo}`,
    description: `${cs.ageGroup} ${cs.gender} ${t?.name || ''} 치료 케이스 — ${cs.description.slice(0, 110)}`,
    path: `/cases/${cs.slug}`,
    jsonLd: [breadcrumbSchema(crumb)],
  }, body)
}

// ============================================================================
// 원장 칼럼
// ============================================================================
export function ColumnsPage(items: Column[]) {
  const crumb = [{ name: '홈', url: '/' }, { name: '원장 칼럼', url: '/column' }]
  const list = items.filter((x) => x.published)
  const body = html`
  <section class="page-hero">
    <div class="container">
      <p class="eyebrow">Column</p>
      <h1>원장 칼럼</h1>
      <p class="lead">치아 건강에 대해 알아두면 좋은 이야기를 원장이 직접 씁니다.</p>
    </div>
  </section>
  ${Breadcrumb(crumb)}

  <section class="section--tight">
    <div class="container">
      ${raw(list.length ? `
      <div class="index-list">
        ${list.map((col, i) => {
          const doc = getDoctor(col.authorSlug)
          return `
          <a class="index-row" href="/column/${col.slug}" data-reveal data-reveal-delay="${(i % 3) + 1}">
            <span class="num">${fmt(col.createdAt)}</span>
            <span>
              <span class="row-title" style="font-size:clamp(1.2rem,2.2vw,1.8rem)">${col.title}</span>
              <span class="row-desc">${col.excerpt}${doc ? ` — ${doc.name} ${doc.role}` : ''}</span>
            </span>
            <span class="row-go"><i class="fas fa-arrow-right"></i></span>
          </a>`
        }).join('')}
      </div>` : emptyState('칼럼을 준비하고 있습니다', '원장이 직접 쓰는 치아 건강 이야기가 곧 게시됩니다.'))}
    </div>
  </section>
  `
  return Layout({
    title: `원장 칼럼 | ${clinic.nameKo}`,
    description: `${clinic.nameKo} 원장 칼럼 — 생체모방치의학, 심미보철, 임플란트(All-on-X), 충치·턱관절 치료에 대한 전문의의 깊이 있는 이야기를 ${clinic.addressLocality} 온천장역 연세온치과에서 전합니다.`,
    path: '/column',
    jsonLd: [breadcrumbSchema(crumb)],
  }, body)
}

export function ColumnDetailPage(col: Column) {
  const crumb = [{ name: '홈', url: '/' }, { name: '원장 칼럼', url: '/column' }, { name: col.title, url: `/column/${col.slug}` }]
  const doc = getDoctor(col.authorSlug)
  const related = (col.relatedTreatments || []).map((s) => getTreatment(s)).filter(Boolean)
  const { html: anchoredHtml, toc } = buildToc(col.contentHtml)
  const mins = readingMin(col.contentHtml)
  const updated = col.updatedAt && col.updatedAt.slice(0, 10) !== col.createdAt.slice(0, 10)
  const body = html`
  <section class="page-hero">
    <div class="container">
      <p class="eyebrow">Column · ${fmt(col.createdAt)}${raw(updated ? ` · 수정 ${fmt(col.updatedAt)}` : '')} · 읽기 ${mins}분</p>
      <h1 style="font-size:var(--t-h2)">${col.title}</h1>
      ${raw(doc ? `<p class="lead" style="font-size:1rem;color:var(--mist)">글 · ${doc.name} ${doc.role} (${doc.title})</p>` : '')}
    </div>
  </section>
  ${Breadcrumb(crumb)}

  <section class="section--tight">
    <div class="container">
      <div class="detail-grid">
        <article class="prose" data-reveal>
          ${raw(col.thumbnail ? `<img src="${col.thumbnail}" alt="${col.metaTitle || col.title}" style="width:100%;border-radius:4px;margin-bottom:2.5rem">` : '')}
          ${raw(autoLink(anchoredHtml, 10))}
          ${raw(doc ? `
          <div style="border-top:1px solid var(--line);margin-top:3.5rem;padding-top:2rem">
            <p class="muted" style="font-size:.8rem;letter-spacing:.12em;text-transform:uppercase;margin-bottom:.6rem">Written &amp; Reviewed by</p>
            <p style="font-weight:600;color:var(--ink);margin-bottom:.2rem">${doc.name} ${doc.role}</p>
            <p class="muted" style="font-size:.88rem">${doc.licenses.join(' · ')}</p>
          </div>` : '')}
        </article>
        <aside class="sidebar">
          ${raw(toc.length >= 2 ? `
          <div class="sidebar-box toc-box">
            <h4>목차</h4>
            ${toc.map((t) => `<a href="#${t.id}" class="toc-link">${t.text}</a>`).join('')}
          </div>` : '')}
          ${raw(related.length ? `
          <div class="sidebar-box">
            <h4>관련 진료</h4>
            ${related.map((t) => `<a href="/treatments/${t!.slug}">${t!.name}</a>`).join('')}
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
  <style>
    .toc-box .toc-link{display:block;font-size:.88rem;line-height:1.4;padding:.35rem 0;color:var(--ink-soft,#4a5364);border-bottom:1px dashed var(--line)}
    .toc-box .toc-link:last-child{border-bottom:0}
    .toc-box .toc-link:hover{color:var(--gold,#C59F66)}
    html{scroll-behavior:smooth}
    .prose h2{scroll-margin-top:90px}
  </style>
  <script>fetch('/api/views/column/${col.id}',{method:'POST'}).catch(function(){});</script>
  `
  return Layout({
    title: col.metaTitle || `${col.title} | ${clinic.nameKo}`,
    description: col.metaDescription || col.excerpt,
    path: `/column/${col.slug}`,
    ogImage: col.thumbnail ? clinic.domain + col.thumbnail : undefined,
    jsonLd: [
      breadcrumbSchema(crumb),
      articleSchema({
        title: col.metaTitle || col.title, description: col.metaDescription || col.excerpt, path: `/column/${col.slug}`,
        image: col.thumbnail, datePublished: col.createdAt, dateModified: col.updatedAt,
        authorSlug: col.authorSlug, authorName: doc?.name,
      }),
    ],
  }, body)
}

// ============================================================================
// 공지사항
// ============================================================================
export function NoticesPage(items: Notice[]) {
  const crumb = [{ name: '홈', url: '/' }, { name: '공지사항', url: '/notice' }]
  const list = items.filter((x) => x.published).sort((a, b) => Number(b.pinned) - Number(a.pinned))
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
        ${raw(n.contentHtml)}
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
  }, body)
}

// ============================================================================
// 병원 영상
// ============================================================================
export function VideoPage() {
  const crumb = [{ name: '홈', url: '/' }, { name: '병원 영상', url: '/video' }]
  const hasVideo = Boolean(clinic.sns.youtube)
  const body = html`
  <section class="page-hero">
    <div class="container"><p class="eyebrow">Video</p><h1>병원 영상</h1>
    <p class="lead">연세온치과의 공간과 진료 이야기를 영상으로 만나보세요.</p></div>
  </section>
  ${Breadcrumb(crumb)}
  <section class="section--tight">
    <div class="container">
      ${raw(hasVideo
        ? `<a href="${clinic.sns.youtube}" target="_blank" rel="noopener" class="btn btn-primary">유튜브 채널 바로가기 <i class="fab fa-youtube"></i></a>`
        : emptyState('영상을 준비하고 있습니다', '병원 소개·진료 안내 영상이 곧 게시됩니다.'))}
    </div>
  </section>
  `
  return Layout({
    title: `병원 영상 | ${clinic.nameKo}`,
    description: `${clinic.nameKo} 병원 소개 영상 — 진료실·수술실·장비, 생체모방치의학 진료 과정과 ${clinic.addressLocality} 온천장역 인근 병원 환경을 영상으로 안내합니다.`,
    path: '/video',
    jsonLd: [breadcrumbSchema(crumb)],
  }, body)
}
