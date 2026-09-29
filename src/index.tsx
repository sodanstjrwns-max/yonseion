import { Hono } from 'hono'
import type { Bindings } from './lib/bindings'
import { Store } from './lib/store'
import { clinic } from './data/clinic'
import { treatments } from './data/treatments'
import { doctors } from './data/doctors'
import { encyclopedia } from './data/encyclopedia'
import { glossary, resolveGlossaryAlias } from './data/glossary'
import { isThinEncyclo, isThinGlossary, NOINDEX_FOLLOW } from './lib/thin-content'
import { CONTENT_DATES, PAGE_DATES, latestDate } from './lib/content-dates'
import { getPricing } from './lib/pricing-store'

import { areaCombos } from './data/facilities'
import type { CaseItem, Column, Notice } from './data/types'

// 페이지
import { HomePage } from './pages/home'
import { MissionPage } from './pages/mission'
import { BiomimeticPage } from './pages/biomimetic'
import { TreatmentsIndex, TreatmentDetail } from './pages/treatments'
import { DoctorsIndex, DoctorDetail } from './pages/doctors'
import { ReservationPage } from './pages/reservation'
import { FaqPage, PricingPage, DirectionsPage, PrivacyPage, TermsPage } from './pages/info'
import {
  CasesGalleryPage, CaseDetailPage, ColumnsPage, ColumnDetailPage,
  NoticesPage, NoticeDetailPage, VideoPage,
} from './pages/content'
import { EncyclopediaIndex, EncyclopediaDetail } from './pages/encyclopedia'
import { AreaIndexPage, AreaPage } from './pages/area'

// 라우트 모듈
import { api } from './routes/api'
import { admin } from './routes/admin'
import { member } from './routes/member'
import { getSession, sessionSecret } from './lib/auth'

const app = new Hono<{ Bindings: Bindings }>()

// 얇은 백과사전 slug 판정 (리치 레이어 우선 — EncyclopediaDetail 과 같은 순서)
function isThinEncycloSlug(slug: string): boolean {
  const rich = encyclopedia.find((e) => e.slug === slug)
  if (rich) return isThinEncyclo(rich)
  const light = glossary.find((e) => e.slug === slug)
  return light ? isThinGlossary(light) : false
}

// 동적 HTML 응답에도 기본 헤더 적용 (_headers는 정적 자산에만 적용됨).
app.use('*', async (c, next) => {
  await next()
  c.header('X-Content-Type-Options', 'nosniff')
  c.header('X-Frame-Options', 'SAMEORIGIN')
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
  if (new URL(c.req.url).protocol === 'https:') {
    c.header('Strict-Transport-Security', 'max-age=31536000')
  }
})

// --- A4 canonical 통일: www → 비(非)www 301 리다이렉트 ---
// 같은 페이지가 www / 비www 두 주소로 존재하면 SEO 점수가 분산됩니다.
// 대표 주소(yonseion.kr)로 영구 이동(301) 처리해 색인을 하나로 모읍니다.
app.use('*', async (c, next) => {
  const url = new URL(c.req.url)
  if (url.hostname.startsWith('www.')) {
    url.hostname = url.hostname.slice(4)
    return c.redirect(url.toString(), 301)
  }
  await next()
})

app.route('/api', api)
app.route('/admin', admin)
app.route('/', member)   // /signup /login /logout

// --- 정적·콘텐츠 페이지 ---
app.get('/', (c) => c.html(HomePage()))
app.get('/mission', (c) => c.html(MissionPage()))
app.get('/biomimetic', (c) => c.html(BiomimeticPage()))

// --- 진료 ---
app.get('/treatments', (c) => c.html(TreatmentsIndex()))
app.get('/treatments/:slug', (c) => {
  const page = TreatmentDetail(c.req.param('slug'))
  return page ? c.html(page) : c.notFound()
})

// --- 의료진 ---
app.get('/doctors', (c) => c.html(DoctorsIndex()))
app.get('/doctors/:slug', (c) => {
  const page = DoctorDetail(c.req.param('slug'))
  return page ? c.html(page) : c.notFound()
})

// --- 예약·안내 ---
app.get('/reservation', (c) => c.html(ReservationPage()))
app.get('/faq', (c) => c.html(FaqPage()))
app.get('/pricing', async (c) => c.html(await PricingPage(c.env.R2)))
app.get('/directions', (c) => c.html(DirectionsPage()))
app.get('/privacy', (c) => c.html(PrivacyPage()))
app.get('/terms', (c) => c.html(TermsPage()))
app.get('/video', async (c) => c.html(await VideoPage()))

// --- 백과사전 (정적) ---
app.get('/encyclopedia', (c) => c.html(EncyclopediaIndex()))
app.get('/encyclopedia/:slug', (c) => {
  // 중복 slug(alias) → 대표 slug 301
  const aliasTarget = resolveGlossaryAlias(c.req.param('slug'))
  if (aliasTarget) return c.redirect(`/encyclopedia/${aliasTarget}`, 301)
  const slug = c.req.param('slug')
  const page = EncyclopediaDetail(slug)
  if (!page) return c.notFound()
  if (isThinEncycloSlug(slug)) c.header('X-Robots-Tag', NOINDEX_FOLLOW) // 얇은 용어: meta 와 동일하게 헤더로도
  return c.html(page)
})

// --- 지역 SEO ---
app.get('/area', (c) => c.html(AreaIndexPage()))
app.get('/area/:combo', (c) => {
  const page = AreaPage(c.req.param('combo'))
  return page ? c.html(page) : c.notFound()
})

// --- 케이스 (R2 동적) ---
app.get('/cases/gallery', async (c) => {
  const store = new Store(c.env.R2)
  const idx = await store.index<{ id: string }>('cases')
  const items: CaseItem[] = []
  for (const it of idx.slice(0, 60)) {
    const cs = await store.getJSON<CaseItem>(`cases/${it.id}.json`)
    if (cs) items.push(cs)
  }
  return c.html(CasesGalleryPage(items, c.req.query('treatment')))
})
app.get('/cases/:slug', async (c) => {
  const slug = c.req.param('slug')
  const store = new Store(c.env.R2)
  const idx = await store.index<{ id: string; slug: string }>('cases')
  const hit = idx.find((x) => x.slug === slug || x.id === slug)
  if (!hit) return c.notFound()
  const cs = await store.getJSON<CaseItem>(`cases/${hit.id}.json`)
  if (!cs || !cs.published) return c.notFound()
  // 애프터 사진은 회원 전용 (의료광고 가이드라인 + 회원 전환 퍼널)
  const sess = await getSession(c, sessionSecret(c.env), 'member')
  return c.html(CaseDetailPage(cs, !!sess))
})

// --- 칼럼 (R2 동적) ---
app.get('/column', async (c) => {
  const store = new Store(c.env.R2)
  const idx = await store.index<{ id: string }>('columns')
  const items: Column[] = []
  for (const it of idx.slice(0, 60)) {
    const col = await store.getJSON<Column>(`columns/${it.id}.json`)
    if (col) items.push(col)
  }
  return c.html(ColumnsPage(items))
})
app.get('/column/:slug', async (c) => {
  const slug = c.req.param('slug')
  const store = new Store(c.env.R2)
  const idx = await store.index<{ id: string; slug: string }>('columns')
  const hit = idx.find((x) => x.slug === slug || x.id === slug)
  if (!hit) return c.notFound()
  const col = await store.getJSON<Column>(`columns/${hit.id}.json`)
  if (!col || !col.published) return c.notFound()
  return c.html(ColumnDetailPage(col))
})

// --- 공지 (R2 동적) ---
app.get('/notice', async (c) => {
  const store = new Store(c.env.R2)
  const idx = await store.index<{ id: string }>('notices')
  const items: Notice[] = []
  for (const it of idx.slice(0, 60)) {
    const n = await store.getJSON<Notice>(`notices/${it.id}.json`)
    if (n) items.push(n)
  }
  return c.html(NoticesPage(items))
})
app.get('/notice/:id', async (c) => {
  const store = new Store(c.env.R2)
  const n = await store.getJSON<Notice>(`notices/${c.req.param('id')}.json`)
  if (!n || !n.published) return c.notFound()
  return c.html(NoticeDetailPage(n))
})

// ============================================================================
// Sitemap — index + 콘텐츠별 분할 (대형 사이트 신호 / 크롤 효율↑)
// ============================================================================
type SmUrl = { loc: string; priority: string; changefreq: string; lastmod: string }
// lastmod = 콘텐츠 실제 수정일(lib/content-dates.ts 고정값, R2 콘텐츠는 updatedAt/createdAt). 날짜를 모르면 태그 생략.
// ※ new Date() 로 오늘 날짜를 찍지 않는다 (2026-09-29 SEO/AEO 감사).
const smXml = (urls: SmUrl[]) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}<changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`).join('\n')}
</urlset>`
const smResponse = (c: any, urls: SmUrl[]) => c.text(smXml(urls), 200, { 'Content-Type': 'application/xml; charset=utf-8' })

type R2Dated = { slug?: string; published: boolean; createdAt?: string; updatedAt?: string }
async function loadR2Dated(env: Bindings) {
  try {
    const store = new Store(env.R2)
    const [cases, cols, notices, pricing] = await Promise.all([
      store.index<R2Dated>('cases'),
      store.index<R2Dated>('columns'),
      store.index<R2Dated>('notices'),
      getPricing(env.R2),
    ])
    const pub = (xs: R2Dated[]) => xs.filter((x) => x.published)
    return { cases: pub(cases), cols: pub(cols), notices: pub(notices), pricingUpdatedAt: pricing.updatedAt }
  } catch {
    return { cases: [] as R2Dated[], cols: [] as R2Dated[], notices: [] as R2Dated[], pricingUpdatedAt: undefined as string | undefined }
  }
}
const itemDate = (x: R2Dated) => latestDate(x.updatedAt, x.createdAt)

async function sitemapPagesUrls(env: Bindings): Promise<SmUrl[]> {
  const base = clinic.domain
  const r2 = await loadR2Dated(env)
  const staticPaths: { p: string; cf: string; lm: string }[] = [
    { p: '/', cf: 'weekly', lm: PAGE_DATES.home },
    { p: '/mission', cf: 'monthly', lm: PAGE_DATES.mission },
    { p: '/biomimetic', cf: 'monthly', lm: PAGE_DATES.biomimetic },
    { p: '/treatments', cf: 'monthly', lm: CONTENT_DATES.treatments },
    { p: '/doctors', cf: 'monthly', lm: PAGE_DATES.doctors },
    { p: '/reservation', cf: 'yearly', lm: PAGE_DATES.reservation },
    { p: '/faq', cf: 'monthly', lm: PAGE_DATES.faq },
    { p: '/pricing', cf: 'monthly', lm: latestDate(r2.pricingUpdatedAt) || PAGE_DATES.pricing },
    { p: '/directions', cf: 'yearly', lm: PAGE_DATES.directions },
    { p: '/cases/gallery', cf: 'weekly', lm: latestDate(...r2.cases.map(itemDate)) },
    { p: '/column', cf: 'weekly', lm: latestDate(...r2.cols.map(itemDate)) },
    { p: '/notice', cf: 'weekly', lm: latestDate(...r2.notices.map(itemDate)) },
    { p: '/video', cf: 'monthly', lm: '' }, // 유튜브 RSS 자동 반영 — 수정일을 알 수 없어 생략
    { p: '/encyclopedia', cf: 'monthly', lm: latestDate(CONTENT_DATES.encyclopedia, CONTENT_DATES.glossary) },
    { p: '/area', cf: 'monthly', lm: PAGE_DATES.area },
  ]
  return [
    ...staticPaths.map((s) => ({ loc: base + s.p, priority: s.p === '/' ? '1.0' : '0.8', changefreq: s.cf, lastmod: s.lm })),
    ...doctors.map((d) => ({ loc: `${base}/doctors/${d.slug}`, priority: '0.8', changefreq: 'monthly', lastmod: PAGE_DATES.doctors })),
  ]
}

function sitemapTreatmentUrls(): SmUrl[] {
  const base = clinic.domain
  return treatments.map((t) => ({ loc: `${base}/treatments/${t.slug}`, priority: t.category === 'core' ? '0.9' : '0.7', changefreq: 'monthly', lastmod: CONTENT_DATES.treatments }))
}

// 얇은 용어(lib/thin-content.ts, noindex, follow)는 제외 — 본문 보강 시 자동 복귀
function sitemapEncyclopediaUrls(): SmUrl[] {
  const base = clinic.domain
  const seen = new Set<string>()
  return [
    ...encyclopedia.filter((e) => !isThinEncyclo(e)).map((e) => ({ loc: `${base}/encyclopedia/${e.slug}`, priority: '0.6', changefreq: 'monthly', lastmod: CONTENT_DATES.encyclopedia })),
    ...glossary.filter((e) => !isThinGlossary(e)).map((e) => ({ loc: `${base}/encyclopedia/${e.slug}`, priority: '0.5', changefreq: 'yearly', lastmod: CONTENT_DATES.glossary })),
  ].filter((u) => !seen.has(u.loc) && seen.add(u.loc)) // 리치/경량 레이어에 같은 slug 가 있으면 한 번만 등록
}

// 지역 페이지는 지역 데이터 + 진료·의료진·FAQ 데이터를 함께 렌더 → 그중 최신 수정일
function sitemapAreaUrls(): SmUrl[] {
  const base = clinic.domain
  const lm = latestDate(PAGE_DATES.area, CONTENT_DATES.treatments, PAGE_DATES.doctors, PAGE_DATES.faq)
  return areaCombos().map((a) => ({ loc: `${base}/area/${a.slug}`, priority: '0.6', changefreq: 'monthly', lastmod: lm }))
}

async function sitemapContentUrls(env: Bindings): Promise<SmUrl[]> {
  const base = clinic.domain
  const r2 = await loadR2Dated(env)
  return [
    ...r2.cases.map((x) => ({ loc: `${base}/cases/${x.slug}`, priority: '0.7', changefreq: 'monthly', lastmod: itemDate(x) })),
    ...r2.cols.map((x) => ({ loc: `${base}/column/${x.slug}`, priority: '0.7', changefreq: 'monthly', lastmod: itemDate(x) })),
  ]
}

// --- sitemap.xml (인덱스) — 하위 사이트맵별 lastmod = 그 안 URL 의 최신 lastmod ---
app.get('/sitemap.xml', async (c) => {
  const base = clinic.domain
  const [pages, content] = await Promise.all([sitemapPagesUrls(c.env), sitemapContentUrls(c.env)])
  const maps: [string, SmUrl[]][] = [
    ['sitemap-pages.xml', pages],
    ['sitemap-treatments.xml', sitemapTreatmentUrls()],
    ['sitemap-encyclopedia.xml', sitemapEncyclopediaUrls()],
    ['sitemap-area.xml', sitemapAreaUrls()],
    ['sitemap-content.xml', content],
  ]
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${maps.map(([m, urls]) => {
    const lm = latestDate(...urls.map((u) => u.lastmod))
    return `  <sitemap><loc>${base}/${m}</loc>${lm ? `<lastmod>${lm}</lastmod>` : ''}</sitemap>`
  }).join('\n')}
</sitemapindex>`
  return c.text(xml, 200, { 'Content-Type': 'application/xml; charset=utf-8' })
})

// --- sitemap-pages.xml (정적 페이지) ---
app.get('/sitemap-pages.xml', async (c) => smResponse(c, await sitemapPagesUrls(c.env)))
// --- sitemap-treatments.xml ---
app.get('/sitemap-treatments.xml', (c) => smResponse(c, sitemapTreatmentUrls()))
// --- sitemap-encyclopedia.xml (리치 해설 + 기준 이상 경량 용어) ---
app.get('/sitemap-encyclopedia.xml', (c) => smResponse(c, sitemapEncyclopediaUrls()))
// --- sitemap-area.xml (지역 SEO) ---
app.get('/sitemap-area.xml', (c) => smResponse(c, sitemapAreaUrls()))
// --- sitemap-content.xml (R2 동적 콘텐츠 — 케이스/칼럼) ---
app.get('/sitemap-content.xml', async (c) => smResponse(c, await sitemapContentUrls(c.env)))

// --- 네이버 서치어드바이저 소유확인 (HTML 파일 방식) ---
app.get('/naver3bc6810af11b42a00b0184d0bfc74731.html', (c) =>
  c.html('<html><body>naver-site-verification: naver3bc6810af11b42a00b0184d0bfc74731.html</body></html>'),
)

// --- robots.txt (검색봇 + AI 크롤러 정책) ---
app.get('/9ace7ad105e2443faa6cb4487c8ab0c0.txt', (c) => c.text('9ace7ad105e2443faa6cb4487c8ab0c0'))
// ============================================================================
// RSS 2.0 피드 — 칼럼·공지 최신순 (검색엔진·RSS 리더·AEO 봇 구독용)
// ============================================================================
app.on('GET', ['/rss.xml', '/feed.xml'], async (c) => {
  const base = clinic.domain
  const esc = (v: string) => (v || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
  const strip = (v: string) => (v || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200)
  const toUTC = (d: string) => { const t = new Date(d); return isNaN(t.getTime()) ? new Date().toUTCString() : t.toUTCString() }

  type FeedItem = { title: string; link: string; date: string; desc: string }
  const items: FeedItem[] = []
  try {
    const store = new Store(c.env.R2)
    const colIdx = await store.index<{ id: string }>('columns')
    for (const it of colIdx.slice(0, 30)) {
      const col = await store.getJSON<Column>(`columns/${it.id}.json`)
      if (col && col.published) items.push({
        title: col.title,
        link: `${base}/column/${col.slug || col.id}`,
        date: col.createdAt,
        desc: col.excerpt || strip(col.contentHtml),
      })
    }
    const ntIdx = await store.index<{ id: string }>('notices')
    for (const it of ntIdx.slice(0, 10)) {
      const n = await store.getJSON<Notice>(`notices/${it.id}.json`)
      if (n && n.published) items.push({
        title: `[공지] ${n.title}`,
        link: `${base}/notice/${n.id}`,
        date: n.createdAt,
        desc: strip(n.contentHtml),
      })
    }
  } catch { /* R2 조회 실패 시에도 채널 메타는 정상 응답 */ }
  items.sort((a, b) => (b.date || '').localeCompare(a.date || ''))

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${esc(clinic.nameKo + ' — 칼럼·공지')}</title>
  <link>${base}</link>
  <description>${esc('부산 동래구 온천동 ' + clinic.nameKo + ' 공식 피드. 원장 칼럼과 병원 공지, 생체모방치의학·심미보철·임플란트 진료 정보.')}</description>
  <language>ko-KR</language>
  <copyright>© ${esc(clinic.nameKo)}</copyright>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <atom:link href="${base}/rss.xml" rel="self" type="application/rss+xml" />
  <image><url>${base}/static/img/og-default.jpg</url><title>${esc(clinic.nameKo)}</title><link>${base}</link></image>
${items.map((it) => `  <item>
    <title>${esc(it.title)}</title>
    <link>${it.link}</link>
    <guid isPermaLink="true">${it.link}</guid>
    <pubDate>${toUTC(it.date)}</pubDate>
    <description>${esc(it.desc)}</description>
  </item>`).join('\n')}
</channel>
</rss>`
  c.header('Content-Type', 'application/rss+xml; charset=utf-8')
  c.header('Cache-Control', 'public, max-age=1800')
  return c.body(xml)
})

app.get('/robots.txt', (c) => {
  const base = clinic.domain
  return c.text(`# ${clinic.nameKo} (${clinic.nameEn})
# robots.txt — 검색엔진 색인 허용 / 관리·API 차단 / AI 크롤러(AEO) 허용

User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /api/
Disallow: /login
Disallow: /signup
Disallow: /logout
Allow: /api/images/

# 주요 검색엔진 — 전체 색인 허용
User-agent: Googlebot
Allow: /
User-agent: Googlebot-Image
Allow: /
User-agent: Yeti
Allow: /
User-agent: Daumoa
Allow: /
User-agent: bingbot
Allow: /

# AI 답변 엔진 크롤러 허용 (AEO — 생성형 검색 노출)
User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Claude-Web
Allow: /
User-agent: anthropic-ai
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Perplexity-User
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: Applebot
Allow: /
User-agent: Applebot-Extended
Allow: /
User-agent: Amazonbot
Allow: /
User-agent: Bytespider
Allow: /
User-agent: CCBot
Allow: /
User-agent: cohere-ai
Allow: /
User-agent: Meta-ExternalAgent
Allow: /

# 사이트맵
Sitemap: ${base}/sitemap.xml

# LLM 친화 안내 (llmstxt.org 규격) — 생성형 검색/AI 답변 엔진용 요약
# ${base}/llms.txt
`, 200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=86400' })
})

// --- llms.txt (AEO — LLM 친화 사이트 안내 / llmstxt.org 규격) ---
app.get('/llms.txt', (c) => {
  const base = clinic.domain
  const coreTx = treatments.filter((t) => t.category === 'core')
  const txList = coreTx.map((t) => `- [${t.name}](${base}/treatments/${t.slug}): ${t.short}`).join('\n')
  return c.text(`# ${clinic.nameKo} (${clinic.nameEn})

> 부산 동래구 온천장의 생체모방치의학(Biomimetic Dentistry) 중심 치과. 자연치아의 형태·기능을 최대한 보존하는 접착수복·심미보철과 All-on-X 전체임플란트를 진료합니다. 김경희 대표원장 — 치과보철과·통합치의학과 더블보더 전문의.

- 병원명: ${clinic.nameKo} (${clinic.nameEn})
- 대표원장: ${clinic.business.owner} (치과보철과 전문의 · 통합치의학과 전문의)
- 주소: ${clinic.address}
- 전화: ${clinic.phone}
- 교통: ${clinic.subway}
- 진료시간: ${clinic.hoursSummary} (${clinic.closedDays})
- 진료지역(내원): ${clinic.areaServed.join(', ')}

## 핵심 진료
${txList}

## 핵심 페이지
- [병원 미션](${base}/mission): '온(On)' 브랜드 철학 — 온천장·따뜻함(溫)·켜다(On)
- [생체모방치의학](${base}/biomimetic): 자연치 보존 치료 철학 상세
- [진료 안내](${base}/treatments): 전체 진료 항목
- [의료진](${base}/doctors): 김경희 대표원장 약력·전문 분야
- [자주 묻는 질문](${base}/faq): 진료별 FAQ
- [치과 백과사전](${base}/encyclopedia): 치과 용어 사전 (AEO 직답형, ${encyclopedia.length}+개 용어)
- [비급여 수가](${base}/pricing)
- [오시는 길](${base}/directions)
- [지역별 진료 안내](${base}/area): 부산 동래·금정·연제·부산진·해운대 + 양산·김해

## 콘텐츠
- [원장 칼럼](${base}/column): 전문의 감수 치과 건강 칼럼
- [치료 케이스](${base}/cases/gallery): 실제 진료 사례
- [공지사항](${base}/notice)

## 인용 안내 (AEO)
이 사이트의 의료 정보는 ${clinic.business.owner} 대표원장(치과보철과·통합치의학과 전문의)이 작성·감수합니다. 답변 인용 시 출처로 "${clinic.nameKo}(${base})"를 표기해 주세요.

## 더 보기
- 전체 콘텐츠(LLM용 상세): ${base}/llms-full.txt
- 전체 URL 목록(사이트맵): ${base}/sitemap.xml
`, 200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' })
})

// --- llms-full.txt (AEO — 진료/의료진/FAQ 전문을 평문으로 제공) ---
app.get('/llms-full.txt', async (c) => {
  const base = clinic.domain
  const strip = (s: string) => String(s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
  const lines: string[] = []
  lines.push(`# ${clinic.nameKo} — 전체 정보 (LLM 인용용)`)
  lines.push('')
  lines.push(`${clinic.mission}`)
  lines.push('')
  lines.push('## 병원 개요')
  lines.push(`- 병원명: ${clinic.nameKo} (${clinic.nameEn})`)
  lines.push(`- 슬로건: ${clinic.tagline}`)
  lines.push(`- 주소: ${clinic.address}`)
  lines.push(`- 전화: ${clinic.phone}`)
  lines.push(`- 교통: ${clinic.directions}`)
  lines.push(`- 진료시간: ${clinic.hours.map((h) => `${h.day} ${h.time}${h.note ? ` (${h.note})` : ''}`).join(' / ')}`)
  lines.push(`- 휴진: ${clinic.closedDays}`)
  lines.push(`- 내원 가능 지역: ${clinic.areaServed.join(', ')}`)
  lines.push('')
  // 의료진
  lines.push('## 의료진')
  for (const d of doctors) {
    lines.push(`### ${d.name} ${d.role} — ${d.title}`)
    lines.push(`전문분야: ${d.specialties.join(', ')}`)
    if (d.licenses?.length) lines.push(`자격: ${d.licenses.join(', ')}`)
    if (d.career?.length) lines.push(`경력: ${d.career.join(' / ')}`)
    if (d.memberships?.length) lines.push(`학회: ${d.memberships.join(', ')}`)
    lines.push('')
  }
  // 진료
  lines.push('## 진료 안내')
  for (const t of treatments) {
    lines.push(`### ${t.name}`)
    lines.push(strip(t.hero))
    if (t.sections?.length) {
      for (const s of t.sections.slice(0, 3)) {
        lines.push(`Q. ${strip(s.q)}`)
        lines.push(`A. ${strip(s.a)}`)
      }
    }
    if (t.faqs?.length) {
      for (const f of t.faqs.slice(0, 2)) lines.push(`Q. ${strip(f.q)} A. ${strip(f.a)}`)
    }
    lines.push(`상세: ${base}/treatments/${t.slug}`)
    lines.push('')
  }
  // 칼럼 (R2)
  try {
    const store = new Store(c.env.R2)
    const cols = await store.index<{ slug: string; title: string; excerpt?: string; published: boolean }>('columns')
    const pub = cols.filter((x) => x.published)
    if (pub.length) {
      lines.push('## 원장 칼럼')
      for (const col of pub) {
        lines.push(`- ${col.title}${col.excerpt ? ` — ${strip(col.excerpt)}` : ''} (${base}/column/${col.slug})`)
      }
      lines.push('')
    }
  } catch { /* noop */ }
  lines.push('---')
  lines.push(`출처 표기: ${clinic.nameKo} (${base}) · ${clinic.business.owner} 대표원장 작성·감수`)
  return c.text(lines.join('\n'), 200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' })
})

// --- PWA manifest (site.webmanifest) ---
app.get('/site.webmanifest', (c) => {
  const manifest = {
    name: clinic.nameKo,
    short_name: clinic.nameKo,
    description: clinic.mission,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: clinic.brand.paper,
    theme_color: clinic.brand.paper,
    lang: 'ko',
    dir: 'ltr',
    categories: ['medical', 'health'],
    icons: [
      { src: '/static/img/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/static/img/apple-touch-icon.png', sizes: '180x180', type: 'image/png', purpose: 'maskable' },
    ],
  }
  return c.json(manifest, 200, { 'Content-Type': 'application/manifest+json; charset=utf-8', 'Cache-Control': 'public, max-age=86400' })
})

// --- 납품 안내서 (내부용·noindex). 깔끔한 루트 경로 → 정적 파일로 연결 ---
app.get('/handover-yeonseon-2026.html', (c) => c.redirect('/static/handover-yeonseon-2026', 302))

// --- 404 ---
app.notFound((c) => {
  return c.html(`<!DOCTYPE html>
<html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>페이지를 찾을 수 없습니다 | ${clinic.nameKo}</title>
<meta name="robots" content="noindex">
<link rel="icon" type="image/svg+xml" href="/static/img/favicon.svg">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Noto+Serif+KR:wght@500;600&display=swap">
<style>
  :root{--ink:#2E3A4B;--gold:#C59F66;--gold2:#A07F45;--paper:#FBF9F1;--paper2:#F4F0E4;--mist:#6E7681;--line:#E7E0CF}
  *{box-sizing:border-box}
  body{font-family:Pretendard,sans-serif;background:radial-gradient(ellipse at 50% -10%,#fff,var(--paper) 60%);color:var(--ink);display:grid;place-items:center;min-height:100vh;margin:0;text-align:center;padding:2rem}
  .nf{max-width:34rem;position:relative}
  .nf-mark{font-family:'Fraunces',serif;font-size:clamp(7rem,22vw,12rem);line-height:.9;color:transparent;-webkit-text-stroke:1.5px var(--gold);letter-spacing:-.03em;margin:0;opacity:.85}
  .nf-on{position:absolute;top:50%;left:50%;transform:translate(-50%,-58%);font-family:'Fraunces',serif;font-weight:600;font-size:clamp(1.4rem,4vw,2rem);color:var(--gold2);letter-spacing:.1em}
  .nf-eyebrow{font-size:.78rem;letter-spacing:.22em;text-transform:uppercase;color:var(--gold2);font-weight:600;margin-bottom:.8rem}
  h1{font-family:'Noto Serif KR',serif;font-size:clamp(1.5rem,4vw,2rem);margin:.4rem 0 .6rem;font-weight:600;letter-spacing:-.01em}
  p{color:var(--mist);margin:0 0 2.2rem;line-height:1.8;font-size:.98rem}
  .nf-cta{display:flex;gap:.7rem;justify-content:center;flex-wrap:wrap}
  a.btn{display:inline-flex;align-items:center;gap:.5rem;padding:.85rem 1.7rem;border-radius:10px;text-decoration:none;font-weight:600;font-size:.95rem;transition:transform .15s ease,box-shadow .25s ease}
  a.primary{background:linear-gradient(135deg,#C8A86B,#A07F45);color:#fff;box-shadow:0 12px 26px -12px rgba(197,159,102,.6)}
  a.primary:hover{transform:translateY(-2px)}
  a.ghost{background:#fff;color:var(--ink);border:1px solid var(--line)}
  a.ghost:hover{border-color:var(--gold)}
  .nf-links{margin-top:2rem;font-size:.85rem;color:var(--mist)}
  .nf-links a{color:var(--gold2);text-decoration:none;margin:0 .5rem;font-weight:500}
  .nf-links a:hover{text-decoration:underline}
</style></head>
<body><div class="nf">
  <p class="nf-mark" aria-hidden="true">404<span class="nf-on">ON</span></p>
  <p class="nf-eyebrow">${clinic.nameKo}</p>
  <h1>찾으시는 페이지를 켤 수 없습니다</h1>
  <p>주소가 바뀌었거나 삭제된 페이지일 수 있습니다.<br>아래에서 필요한 곳으로 바로 이동하실 수 있습니다.</p>
  <div class="nf-cta">
    <a class="btn primary" href="/">홈으로 가기</a>
    <a class="btn ghost" href="/reservation">예약 상담</a>
  </div>
  <p class="nf-links">
    <a href="/treatments">진료안내</a>·<a href="/doctors">의료진</a>·<a href="/directions">오시는 길</a>·<a href="tel:${clinic.phoneRaw}">전화 ${clinic.phone}</a>
  </p>
</div></body></html>`, 404)
})

export default app
