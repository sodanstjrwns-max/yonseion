// ============================================================================
// 공개 API — 예약 접수 / 조회수 집계 / 이미지 서빙
// ============================================================================
import { Hono } from 'hono'
import type { Bindings } from '../lib/bindings'
import { Store, newId } from '../lib/store'
import { isBot } from '../lib/auth'
import type { Reservation } from '../data/types'

export const api = new Hono<{ Bindings: Bindings }>()

// --- 예약 접수 ---
api.post('/reservations', async (c) => {
  let body: Record<string, unknown>
  try { body = await c.req.json() } catch { return c.json({ ok: false, error: '잘못된 요청입니다.' }, 400) }

  const name = String(body.name || '').trim().slice(0, 30)
  const phone = String(body.phone || '').trim().slice(0, 20)
  if (!name || !phone) return c.json({ ok: false, error: '성함과 연락처를 입력해 주세요.' }, 400)
  if (!/^[\d\s\-+().]{8,20}$/.test(phone)) return c.json({ ok: false, error: '연락처 형식을 확인해 주세요.' }, 400)
  if (!body.agreePrivacy) return c.json({ ok: false, error: '개인정보 수집·이용 동의가 필요합니다.' }, 400)

  const rsv: Reservation = {
    id: newId('rsv_'),
    name,
    phone,
    treatment: String(body.treatment || '').slice(0, 60),
    preferredDate: String(body.preferredDate || '').slice(0, 60),
    message: String(body.message || '').slice(0, 800),
    status: 'new',
    createdAt: new Date().toISOString(),
  }

  // R2 주 저장
  const store = new Store(c.env.R2)
  await store.putJSON(`reservations/${rsv.id}.json`, rsv)
  const idx = await store.index<{ id: string; name: string; createdAt: string }>('reservations')
  idx.unshift({ id: rsv.id, name: rsv.name, createdAt: rsv.createdAt })
  await store.setIndex('reservations', idx.slice(0, 1000))

  // D1 인덱스 (빠른 조회용 — 실패해도 접수는 성공)
  try {
    await c.env.DB.prepare(
      'INSERT INTO reservation_index (id, name, phone, treatment, status) VALUES (?, ?, ?, ?, ?)'
    ).bind(rsv.id, rsv.name, rsv.phone, rsv.treatment, rsv.status).run()
  } catch { /* D1 미연결 환경 폴백 */ }

  return c.json({ ok: true, id: rsv.id })
})

// --- 조회수 집계 (봇 제외) ---
api.post('/views/:type/:id', async (c) => {
  const type = c.req.param('type')
  const id = c.req.param('id')
  if (!['case', 'column', 'notice'].includes(type)) return c.json({ ok: false }, 400)
  const ua = c.req.header('user-agent') || ''
  try {
    await c.env.DB.prepare(
      'INSERT INTO page_views (content_type, content_id, is_bot) VALUES (?, ?, ?)'
    ).bind(type, id, isBot(ua) ? 1 : 0).run()
  } catch { /* noop */ }
  return c.json({ ok: true })
})

api.get('/views/:type/:id', async (c) => {
  const type = c.req.param('type')
  const id = c.req.param('id')
  try {
    const row = await c.env.DB.prepare(
      'SELECT COUNT(*) AS n FROM page_views WHERE content_type = ? AND content_id = ? AND is_bot = 0'
    ).bind(type, id).first<{ n: number }>()
    return c.json({ ok: true, views: row?.n || 0 })
  } catch {
    return c.json({ ok: true, views: 0 })
  }
})

// --- R2 이미지 서빙 ---
api.get('/images/:key{.+}', async (c) => {
  const key = c.req.param('key')
  const obj = await c.env.R2.get(`images/${key}`)
  if (!obj) return c.notFound()
  return new Response(obj.body, {
    headers: {
      'Content-Type': obj.httpMetadata?.contentType || 'image/jpeg',
      'Cache-Control': 'public, max-age=86400',
    },
  })
})
