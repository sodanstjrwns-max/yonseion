import { Hono } from 'hono'
import type { Bindings } from './lib/bindings'
import { Store } from './lib/store'
import { clinic } from './data/clinic'
import { treatments } from './data/treatments'
import { doctors } from './data/doctors'
import { encyclopedia } from './data/encyclopedia'
import { glossary } from './data/glossary'
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
app.get('/pricing', (c) => c.html(PricingPage()))
app.get('/directions', (c) => c.html(DirectionsPage()))
app.get('/privacy', (c) => c.html(PrivacyPage()))
app.get('/terms', (c) => c.html(TermsPage()))
app.get('/video', (c) => c.html(VideoPage()))

// --- 백과사전 (정적) ---
app.get('/encyclopedia', (c) => c.html(EncyclopediaIndex()))
app.get('/encyclopedia/:slug', (c) => {
  const page = EncyclopediaDetail(c.req.param('slug'))
  return page ? c.html(page) : c.notFound()
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
const smXml = (urls: SmUrl[]) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`).join('\n')}
</urlset>`

// --- sitemap.xml (인덱스) ---
app.get('/sitemap.xml', (c) => {
  const base = clinic.domain
  const today = new Date().toISOString().slice(0, 10)
  const maps = ['sitemap-pages.xml', 'sitemap-treatments.xml', 'sitemap-encyclopedia.xml', 'sitemap-area.xml', 'sitemap-content.xml']
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${maps.map((m) => `  <sitemap><loc>${base}/${m}</loc><lastmod>${today}</lastmod></sitemap>`).join('\n')}
</sitemapindex>`
  return c.text(xml, 200, { 'Content-Type': 'application/xml; charset=utf-8' })
})

// --- sitemap-pages.xml (정적 페이지) ---
app.get('/sitemap-pages.xml', (c) => {
  const base = clinic.domain
  const today = new Date().toISOString().slice(0, 10)
  const staticPaths: { p: string; cf: string }[] = [
    { p: '/', cf: 'weekly' }, { p: '/mission', cf: 'monthly' }, { p: '/biomimetic', cf: 'monthly' },
    { p: '/treatments', cf: 'monthly' }, { p: '/doctors', cf: 'monthly' },
    { p: '/reservation', cf: 'yearly' }, { p: '/faq', cf: 'monthly' }, { p: '/pricing', cf: 'monthly' },
    { p: '/directions', cf: 'yearly' }, { p: '/cases/gallery', cf: 'weekly' }, { p: '/column', cf: 'weekly' },
    { p: '/notice', cf: 'weekly' }, { p: '/video', cf: 'monthly' }, { p: '/encyclopedia', cf: 'monthly' }, { p: '/area', cf: 'monthly' },
  ]
  const urls: SmUrl[] = [
    ...staticPaths.map((s) => ({ loc: base + s.p, priority: s.p === '/' ? '1.0' : '0.8', changefreq: s.cf, lastmod: today })),
    ...doctors.map((d) => ({ loc: `${base}/doctors/${d.slug}`, priority: '0.8', changefreq: 'monthly', lastmod: today })),
  ]
  return c.text(smXml(urls), 200, { 'Content-Type': 'application/xml; charset=utf-8' })
})

// --- sitemap-treatments.xml ---
app.get('/sitemap-treatments.xml', (c) => {
  const base = clinic.domain
  const today = new Date().toISOString().slice(0, 10)
  const urls: SmUrl[] = treatments.map((t) => ({ loc: `${base}/treatments/${t.slug}`, priority: t.category === 'core' ? '0.9' : '0.7', changefreq: 'monthly', lastmod: today }))
  return c.text(smXml(urls), 200, { 'Content-Type': 'application/xml; charset=utf-8' })
})

// --- sitemap-encyclopedia.xml (200 용어 + glossary) ---
app.get('/sitemap-encyclopedia.xml', (c) => {
  const base = clinic.domain
  const today = new Date().toISOString().slice(0, 10)
  const urls: SmUrl[] = [
    ...encyclopedia.map((e) => ({ loc: `${base}/encyclopedia/${e.slug}`, priority: '0.6', changefreq: 'monthly', lastmod: today })),
    ...glossary.map((e) => ({ loc: `${base}/encyclopedia/${e.slug}`, priority: '0.5', changefreq: 'yearly', lastmod: today })),
  ]
  return c.text(smXml(urls), 200, { 'Content-Type': 'application/xml; charset=utf-8' })
})

// --- sitemap-area.xml (지역 SEO) ---
app.get('/sitemap-area.xml', (c) => {
  const base = clinic.domain
  const today = new Date().toISOString().slice(0, 10)
  const urls: SmUrl[] = areaCombos().map((a) => ({ loc: `${base}/area/${a.slug}`, priority: '0.6', changefreq: 'monthly', lastmod: today }))
  return c.text(smXml(urls), 200, { 'Content-Type': 'application/xml; charset=utf-8' })
})

// --- sitemap-content.xml (R2 동적 콘텐츠 — 케이스/칼럼) ---
app.get('/sitemap-content.xml', async (c) => {
  const base = clinic.domain
  const today = new Date().toISOString().slice(0, 10)
  const urls: SmUrl[] = []
  try {
    const store = new Store(c.env.R2)
    const [cases, cols] = await Promise.all([
      store.index<{ slug: string; published: boolean; createdAt?: string; updatedAt?: string }>('cases'),
      store.index<{ slug: string; published: boolean; createdAt?: string; updatedAt?: string }>('columns'),
    ])
    const lm = (x: { updatedAt?: string; createdAt?: string }) => (x.updatedAt || x.createdAt || today).slice(0, 10)
    cases.filter((x) => x.published).forEach((x) => urls.push({ loc: `${base}/cases/${x.slug}`, priority: '0.7', changefreq: 'monthly', lastmod: lm(x) }))
    cols.filter((x) => x.published).forEach((x) => urls.push({ loc: `${base}/column/${x.slug}`, priority: '0.7', changefreq: 'monthly', lastmod: lm(x) }))
  } catch { /* noop */ }
  return c.text(smXml(urls), 200, { 'Content-Type': 'application/xml; charset=utf-8' })
})

// --- robots.txt ---
app.get('/robots.txt', (c) => {
  return c.text(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api

# AI 크롤러 허용 (AEO)
User-agent: GPTBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /

Sitemap: ${clinic.domain}/sitemap.xml
`)
})

// --- llms.txt (AEO — LLM 친화 사이트 안내) ---
app.get('/llms.txt', (c) => {
  const base = clinic.domain
  return c.text(`# ${clinic.nameKo} (Yeonseon On Dental Clinic)

> 부산 동래구 온천동의 생체모방치의학 중심 치과. 자연치아를 닮은 보존적 치료(접착수복·심미보철)와 All-on-X 전체임플란트를 진료합니다. 김경희 대표원장 — 통합치의학과·치과보철과 더블보더 전문의.

주소: ${clinic.address}
전화: ${clinic.phone}

## 핵심 페이지
- [병원 미션](${base}/mission): '온(On)' 브랜드 철학 — 따뜻함·켜다·전부
- [생체모방치의학](${base}/biomimetic): 치료 철학 상세
- [진료 안내](${base}/treatments): 심미보철 / All-on-X / 접착수복 외
- [의료진](${base}/doctors): 약력·전문 분야
- [자주 묻는 질문](${base}/faq): 진료별 FAQ 전체
- [치과 백과사전](${base}/encyclopedia): 치과 용어 사전 (AEO 직답형)
- [비급여 수가](${base}/pricing)
- [오시는 길](${base}/directions)

## 콘텐츠
- [원장 칼럼](${base}/column)
- [치료 케이스](${base}/cases/gallery)
- [지역 안내](${base}/area): 지역별 진료 안내 페이지

전체 URL 목록: ${base}/sitemap.xml
`)
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

// --- 404 ---
app.notFound((c) => {
  return c.html(`<!DOCTYPE html>
<html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>페이지를 찾을 수 없습니다 | ${clinic.nameKo}</title>
<meta name="robots" content="noindex">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<style>body{font-family:Pretendard,sans-serif;background:#FBF9F1;color:#000000;display:grid;place-items:center;min-height:100vh;margin:0;text-align:center}
h1{font-size:5rem;margin:0;letter-spacing:-.04em}p{color:#6B6B6B;margin:.8rem 0 2rem}
a{display:inline-block;background:#000000;color:#FBF9F1;padding:.85rem 1.8rem;border-radius:2px;text-decoration:none;margin:0 .3rem}</style></head>
<body><div><h1>404</h1><p>찾으시는 페이지가 없습니다.<br>주소가 바뀌었거나 삭제된 페이지일 수 있습니다.</p>
<a href="/">홈으로</a><a href="/reservation" style="background:transparent;color:#000000;border:1px solid #E3DECE">예약 상담</a></div></body></html>`, 404)
})

export default app
