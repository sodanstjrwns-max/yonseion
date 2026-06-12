import { Hono } from 'hono'
import type { Bindings } from './lib/bindings'
import { Store } from './lib/store'
import { clinic } from './data/clinic'
import { treatments } from './data/treatments'
import { doctors } from './data/doctors'
import { encyclopedia } from './data/encyclopedia'
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

const app = new Hono<{ Bindings: Bindings }>()

app.route('/api', api)
app.route('/admin', admin)

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
  return c.html(CaseDetailPage(cs))
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

// --- sitemap.xml (정적 + 동적 콘텐츠 포함) ---
app.get('/sitemap.xml', async (c) => {
  const base = clinic.domain
  const staticPaths = [
    '/', '/mission', '/biomimetic', '/treatments', '/doctors',
    '/reservation', '/faq', '/pricing', '/directions',
    '/cases/gallery', '/column', '/notice', '/video', '/encyclopedia', '/area',
  ]
  const urls: { loc: string; priority: string }[] = [
    ...staticPaths.map((p) => ({ loc: base + p, priority: p === '/' ? '1.0' : '0.8' })),
    ...treatments.map((t) => ({ loc: `${base}/treatments/${t.slug}`, priority: t.category === 'core' ? '0.9' : '0.7' })),
    ...doctors.map((d) => ({ loc: `${base}/doctors/${d.slug}`, priority: '0.8' })),
    ...encyclopedia.map((e) => ({ loc: `${base}/encyclopedia/${e.slug}`, priority: '0.6' })),
    ...areaCombos().map((a) => ({ loc: `${base}/area/${a.slug}`, priority: '0.6' })),
  ]
  // 동적 콘텐츠
  try {
    const store = new Store(c.env.R2)
    const [cases, cols] = await Promise.all([
      store.index<{ slug: string; published: boolean }>('cases'),
      store.index<{ slug: string; published: boolean }>('columns'),
    ])
    cases.filter((x) => x.published).forEach((x) => urls.push({ loc: `${base}/cases/${x.slug}`, priority: '0.7' }))
    cols.filter((x) => x.published).forEach((x) => urls.push({ loc: `${base}/column/${x.slug}`, priority: '0.7' }))
  } catch { /* noop */ }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><priority>${u.priority}</priority></url>`).join('\n')}
</urlset>`
  return c.text(xml, 200, { 'Content-Type': 'application/xml; charset=utf-8' })
})

// --- robots.txt ---
app.get('/robots.txt', (c) => {
  return c.text(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api

Sitemap: ${clinic.domain}/sitemap.xml
`)
})

// --- 404 ---
app.notFound((c) => {
  return c.html(`<!DOCTYPE html>
<html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>페이지를 찾을 수 없습니다 | ${clinic.nameKo}</title>
<meta name="robots" content="noindex">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<style>body{font-family:Pretendard,sans-serif;background:#FAF8F2;color:#14243E;display:grid;place-items:center;min-height:100vh;margin:0;text-align:center}
h1{font-size:5rem;margin:0;letter-spacing:-.04em}p{color:#8A93A6;margin:.8rem 0 2rem}
a{display:inline-block;background:#14243E;color:#FAF8F2;padding:.85rem 1.8rem;border-radius:2px;text-decoration:none;margin:0 .3rem}</style></head>
<body><div><h1>404</h1><p>찾으시는 페이지가 없습니다.<br>주소가 바뀌었거나 삭제된 페이지일 수 있습니다.</p>
<a href="/">홈으로</a><a href="/reservation" style="background:transparent;color:#14243E;border:1px solid #E1DCCC">예약 상담</a></div></body></html>`, 404)
})

export default app
