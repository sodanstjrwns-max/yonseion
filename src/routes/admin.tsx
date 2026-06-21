// ============================================================================
// 관리자 — 로그인 / 대시보드 / 예약 관리 / 케이스·칼럼·공지 작성 / 이미지 업로드
// ============================================================================
import { Hono } from 'hono'
import { html, raw } from 'hono/html'
import type { Bindings } from '../lib/bindings'
import { Store, newId, slugify } from '../lib/store'
import { fireIndexNotify } from '../lib/indexing'
import {
  getSession, setSessionCookie, clearSession, sessionSecret, adminPassword,
} from '../lib/auth'
import type { CaseItem, Column, Notice, Reservation, User } from '../data/types'
import { treatments } from '../data/treatments'
import { doctors } from '../data/doctors'
import { clinic } from '../data/clinic'
import { regionList } from '../data/regions'

export const admin = new Hono<{ Bindings: Bindings }>()

// HTML 속성/텍스트 영역 이스케이프 (XSS·따옴표 깨짐 방지)
function esc(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

// ---------- 공통 셸 ----------
function shell(title: string, body: string, active = '') {
  const nav = [
    ['/admin', '대시보드', 'gauge'],
    ['/admin/reservations', '예약 관리', 'calendar-check'],
    ['/admin/members', '회원 관리', 'users'],
    ['/admin/cases', '케이스', 'images'],
    ['/admin/columns', '칼럼', 'pen-nib'],
    ['/admin/notices', '공지', 'bullhorn'],
  ]
  return html`<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${title} | 연세온치과 관리자</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.1/css/all.min.css">
<style>
:root{--ink:#14243E;--paper:#FAF8F2;--line:#E1DCCC;--mist:#8A93A6;--acc:#0C1830}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Pretendard',sans-serif;background:var(--paper);color:var(--ink);font-size:15px;line-height:1.6}
a{color:inherit;text-decoration:none}
.layout{display:grid;grid-template-columns:220px 1fr;min-height:100vh}
.side{background:var(--ink);color:#EFEBE3;padding:1.6rem 1rem;display:flex;flex-direction:column;gap:.3rem}
.side .brand{font-weight:700;padding:.4rem .8rem 1.4rem;letter-spacing:-.01em}
.side a{padding:.65rem .8rem;border-radius:6px;font-size:.92rem;display:flex;gap:.7rem;align-items:center;color:rgba(239,235,227,.75)}
.side a:hover,.side a.on{background:rgba(255,255,255,.08);color:#fff}
.side .logout{margin-top:auto}
.main{padding:2.2rem 2.6rem;max-width:1100px}
h1{font-size:1.5rem;margin-bottom:1.6rem;letter-spacing:-.02em}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem;margin-bottom:2rem}
.stat{background:#fff;border:1px solid var(--line);border-radius:10px;padding:1.3rem;transition:border-color .15s,box-shadow .15s}
a.stat:hover{border-color:#C9BE9E;box-shadow:0 4px 14px rgba(20,36,62,.08)}
.stat .n{font-size:1.9rem;font-weight:700}.stat .l{color:var(--mist);font-size:.85rem}
table{width:100%;border-collapse:collapse;background:#fff;border:1px solid var(--line);border-radius:10px;overflow:hidden}
th,td{padding:.75rem .9rem;text-align:left;border-bottom:1px solid var(--line);font-size:.9rem;vertical-align:top}
th{background:#F4F0E8;font-size:.78rem;letter-spacing:.06em;color:var(--mist);text-transform:uppercase}
tr:last-child td{border-bottom:0}
.btn{display:inline-flex;align-items:center;gap:.45rem;background:var(--ink);color:#fff;padding:.6rem 1.1rem;border-radius:7px;border:0;font:inherit;font-size:.88rem;cursor:pointer}
.btn.ghost{background:transparent;color:var(--ink);border:1px solid var(--line)}
.btn.sm{padding:.35rem .7rem;font-size:.8rem}
.btn.danger{background:#9C2B2B}
form.panel,div.panel{background:#fff;border:1px solid var(--line);border-radius:10px;padding:1.6rem;margin-bottom:1.6rem}
label{display:block;font-size:.82rem;font-weight:600;margin:.9rem 0 .3rem;color:var(--ink)}
input,select,textarea{width:100%;padding:.6rem .8rem;border:1px solid var(--line);border-radius:7px;font:inherit;background:#fff}
textarea{min-height:120px;resize:vertical}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
.row3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem}
.badge{display:inline-block;font-size:.72rem;padding:.18rem .55rem;border-radius:20px;background:#EEE8DC;color:var(--ink)}
.badge.new{background:#14243E;color:#fff}.badge.confirmed{background:#2E5E3A;color:#fff}.badge.done{background:#888;color:#fff}.badge.cancel{background:#9C2B2B;color:#fff}
.toolbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:1.2rem;gap:1rem;flex-wrap:wrap}
.muted{color:var(--mist);font-size:.85rem}
/* 토글 스위치 */
.switch{display:flex;align-items:center;gap:.7rem;padding:.85rem 1rem;border:1px solid var(--line);border-radius:9px;background:#FBFAF6;cursor:pointer;margin:.5rem 0;transition:border-color .15s,background .15s}
.switch:hover{border-color:#C9BE9E}
.switch input{display:none}
.switch .track{flex:0 0 44px;width:44px;height:25px;border-radius:20px;background:#CFC9BA;position:relative;transition:background .2s}
.switch .track::after{content:'';position:absolute;top:3px;left:3px;width:19px;height:19px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.25);transition:transform .2s}
.switch input:checked+.track{background:#2E7D52}
.switch input:checked+.track::after{transform:translateX(19px)}
.switch .sw-text{flex:1}
.switch .sw-text b{display:block;font-size:.9rem;font-weight:600}
.switch .sw-text small{color:var(--mist);font-size:.78rem}
.switch.accent input:checked+.track{background:#AE8A4C}
.badge.pin{background:#AE8A4C;color:#fff}.badge.popup{background:#2E5E8A;color:#fff}.badge.off{background:#DDD6C7;color:#7A7361}
.sub-fields{padding:1rem 1.1rem;border-left:3px solid #E4D9BC;background:#FCFAF3;border-radius:0 8px 8px 0;margin:.3rem 0 .6rem}
/* ===== 리치 에디터 ===== */
.rte-wrap{border:1px solid var(--line);border-radius:10px;overflow:hidden;background:#fff}
.rte-toolbar{display:flex;flex-wrap:wrap;gap:.15rem;padding:.5rem .6rem;background:#F6F2E9;border-bottom:1px solid var(--line);position:sticky;top:0;z-index:5}
.rte-toolbar button{width:34px;height:32px;border:1px solid transparent;background:none;border-radius:6px;cursor:pointer;color:#3A4356;font-size:.92rem;display:inline-flex;align-items:center;justify-content:center;transition:.12s}
.rte-toolbar button:hover{background:#fff;border-color:var(--line)}
.rte-toolbar button.on{background:#14243E;color:#fff}
.rte-toolbar .sep{width:1px;height:22px;background:#D8D0BD;margin:0 .25rem;align-self:center}
.rte-toolbar .lbl{font-size:.78rem;font-weight:600;width:auto;padding:0 .55rem;color:#5a6478}
.rte-editor{min-height:380px;max-height:620px;overflow-y:auto;padding:1.4rem 1.6rem;font-size:1rem;line-height:1.8;color:#1f2937;outline:none}
.rte-editor:focus{background:#fffdf8}
.rte-editor.drag{outline:2px dashed #AE8A4C;outline-offset:-6px;background:#FCF7EA}
.rte-editor h2{font-size:1.45rem;font-weight:700;margin:1.6rem 0 .7rem;color:#14243E;line-height:1.4}
.rte-editor h3{font-size:1.18rem;font-weight:700;margin:1.3rem 0 .5rem;color:#1f2d44}
.rte-editor p{margin:0 0 1rem}
.rte-editor ul,.rte-editor ol{margin:0 0 1rem 1.4rem}
.rte-editor blockquote{border-left:3px solid #AE8A4C;margin:1.2rem 0;padding:.4rem 0 .4rem 1.2rem;color:#4a5364;font-style:italic;background:#FCFAF3}
.rte-editor a{color:#1d4ed8;text-decoration:underline}
.rte-editor hr{border:0;border-top:1px solid var(--line);margin:2rem 0}
.rte-editor figure{margin:1.4rem 0;position:relative}
.rte-editor figure img{width:100%;border-radius:8px;display:block}
.rte-editor figure.is-selected{outline:2px solid #AE8A4C;outline-offset:3px;border-radius:8px}
.rte-editor figure figcaption{text-align:center;font-size:.85rem;color:#8A93A6;margin-top:.5rem;padding:.2rem;outline:none;border-radius:4px}
.rte-editor figure figcaption:empty::before{content:'사진 설명을 입력하세요 (선택)';color:#c3bca9}
.rte-editor figure.align-left{max-width:55%;float:left;margin-right:1.4rem}
.rte-editor figure.align-right{max-width:55%;float:right;margin-left:1.4rem}
.rte-editor img.uploading{opacity:.45;filter:grayscale(.5)}
.rte-editor:empty::before{content:attr(data-ph);color:#b8b09c}
.rte-status{display:flex;gap:1.2rem;flex-wrap:wrap;padding:.55rem .9rem;background:#FAF8F2;border-top:1px solid var(--line);font-size:.78rem;color:#8A93A6}
.rte-status b{color:#14243E}
/* 이미지 컨텍스트 미니바 */
.img-bar{position:absolute;top:8px;left:8px;display:flex;gap:.2rem;background:rgba(20,36,62,.92);border-radius:7px;padding:.25rem;z-index:6}
.img-bar button{width:28px;height:26px;border:0;background:none;color:#fff;border-radius:5px;cursor:pointer;font-size:.78rem}
.img-bar button:hover{background:rgba(255,255,255,.18)}
.img-bar button.on{background:#AE8A4C}
/* SEO 패널 */
.seo-panel{background:#fff;border:1px solid var(--line);border-radius:10px;padding:1.3rem 1.4rem;position:sticky;top:1rem}
.seo-score{display:flex;align-items:center;gap:.9rem;margin-bottom:1rem}
.seo-ring{--p:0;width:64px;height:64px;border-radius:50%;background:conic-gradient(var(--ring,#2E7D52) calc(var(--p)*1%),#ECE7D8 0);display:grid;place-items:center;flex:0 0 64px}
.seo-ring span{width:48px;height:48px;border-radius:50%;background:#fff;display:grid;place-items:center;font-weight:700;font-size:1.05rem;color:#14243E}
.seo-checks{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.45rem}
.seo-checks li{display:flex;gap:.55rem;font-size:.83rem;line-height:1.45;color:#5a6478;align-items:flex-start}
.seo-checks li i{margin-top:.18rem;flex:0 0 14px}
.seo-checks li.ok i{color:#2E7D52}.seo-checks li.warn i{color:#C99A2E}.seo-checks li.bad i{color:#C25B4A}
.gpreview{border:1px solid var(--line);border-radius:8px;padding:.9rem 1rem;margin-top:1rem;background:#fff}
.gpreview .g-t{color:#1a0dab;font-size:1.02rem;line-height:1.3;margin-bottom:.15rem;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical}
.gpreview .g-u{color:#006621;font-size:.8rem;margin-bottom:.2rem}
.gpreview .g-d{color:#4d5156;font-size:.84rem;line-height:1.45;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.charcount{font-size:.74rem;color:#8A93A6;text-align:right;margin-top:.2rem}
.charcount.warn{color:#C99A2E}.charcount.bad{color:#C25B4A}
.col-layout{display:grid;grid-template-columns:1fr 320px;gap:1.4rem;align-items:start}
@media(max-width:1100px){.col-layout{grid-template-columns:1fr}.seo-panel{position:static}}
@media(max-width:860px){.layout{grid-template-columns:1fr}.side{flex-direction:row;flex-wrap:wrap}.side .logout{margin:0}.main{padding:1.4rem}}
</style>
</head>
<body>
<div class="layout">
  <aside class="side">
    <div class="brand">연세온치과<br><small style="font-weight:400;opacity:.6">ADMIN</small></div>
    ${raw(nav.map(([href, label, icon]) => `<a href="${href}" class="${active === href ? 'on' : ''}"><i class="fas fa-${icon}" style="width:18px"></i>${label}</a>`).join(''))}
    <a href="/" target="_blank"><i class="fas fa-arrow-up-right-from-square" style="width:18px"></i>사이트 보기</a>
    <a href="/admin/logout" class="logout"><i class="fas fa-right-from-bracket" style="width:18px"></i>로그아웃</a>
  </aside>
  <main class="main">${raw(body)}</main>
</div>
</body></html>`
}

// ---------- 인증 가드 ----------
admin.use('*', async (c, next) => {
  const path = new URL(c.req.url).pathname
  if (path === '/admin/login' || path === '/admin/logout') return next()
  const sess = await getSession(c, sessionSecret(c.env), 'admin')
  if (!sess || sess.role !== 'admin') return c.redirect('/admin/login')
  return next()
})

// ---------- 로그인 ----------
admin.get('/login', (c) => {
  return c.html(html`<!DOCTYPE html><html lang="ko"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex"><title>관리자 로그인 | 연세온치과</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<style>body{font-family:Pretendard,sans-serif;background:#14243E;display:grid;place-items:center;min-height:100vh;margin:0}
.box{background:#FAF8F2;border-radius:14px;padding:2.6rem;width:min(380px,90vw)}
h1{font-size:1.2rem;margin:0 0 1.6rem;letter-spacing:-.01em}
input{width:100%;padding:.75rem .9rem;border:1px solid #E1DCCC;border-radius:8px;font:inherit;box-sizing:border-box}
button{width:100%;margin-top:1rem;padding:.8rem;background:#14243E;color:#fff;border:0;border-radius:8px;font:inherit;font-weight:600;cursor:pointer}
.err{color:#9C2B2B;font-size:.85rem;margin-top:.8rem}</style></head>
<body><form class="box" method="POST" action="/admin/login">
<h1>연세온치과 관리자</h1>
<input type="password" name="password" placeholder="관리자 비밀번호" required autofocus>
<button>로그인</button>
${c.req.query('e') ? html`<p class="err">비밀번호가 올바르지 않습니다.</p>` : ''}
</form></body></html>`)
})

admin.post('/login', async (c) => {
  const form = await c.req.parseBody()
  const pw = String(form.password || '')
  if (pw !== adminPassword(c.env)) return c.redirect('/admin/login?e=1')
  await setSessionCookie(c, {
    sub: 'admin', role: 'admin', exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
  }, sessionSecret(c.env))
  return c.redirect('/admin')
})

admin.get('/logout', (c) => {
  clearSession(c, 'admin')
  return c.redirect('/admin/login')
})

// ---------- 대시보드 ----------
admin.get('/', async (c) => {
  const store = new Store(c.env.R2)
  const [rsvIdx, caseIdx, colIdx, ntcIdx, userIdx] = await Promise.all([
    store.index<{ id: string }>('reservations'),
    store.index<{ id: string }>('cases'),
    store.index<{ id: string }>('columns'),
    store.index<{ id: string }>('notices'),
    store.index<{ email: string }>('users'),
  ])
  let newCount = 0
  try {
    const row = await c.env.DB.prepare("SELECT COUNT(*) AS n FROM reservation_index WHERE status = 'new'").first<{ n: number }>()
    newCount = row?.n || 0
  } catch { /* noop */ }

  // 활성 팝업 공지 현황
  const today = new Date().toISOString().slice(0, 10)
  const activePopups = (ntcIdx as any[]).filter((x) => x.popup && x.published !== false && (!x.popupUntil || x.popupUntil >= today))

  // 최근 예약 5건
  const recentRsv: Reservation[] = []
  for (const it of (rsvIdx as any[]).slice(0, 5)) {
    const r = await store.getJSON<Reservation>(`reservations/${it.id}.json`)
    if (r) recentRsv.push(r)
  }
  const rsvBadge = (s: string) => `<span class="badge ${s}">${({ new: '신규', confirmed: '확정', done: '완료', cancel: '취소' } as any)[s] || s}</span>`
  const fmtDate = (iso: string) => { try { const d = new Date(iso); return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` } catch { return (iso || '').slice(0, 10) } }

  const body = `
  <h1>대시보드</h1>
  ${newCount ? `<div class="panel" style="background:#14243E;color:#fff;border:0;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem">
    <span style="font-size:1rem"><i class="fas fa-bell" style="color:#E0C99B;margin-right:.5rem"></i> 확인하지 않은 <b>신규 예약 ${newCount}건</b>이 있습니다.</span>
    <a class="btn" style="background:#E0C99B;color:#14243E" href="/admin/reservations">예약 확인하기 <i class="fas fa-arrow-right"></i></a>
  </div>` : ''}
  ${activePopups.length ? `<div class="panel" style="background:#FCF7EA;border-color:#E4D9BC;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.8rem;padding:.9rem 1.2rem">
    <span><i class="fas fa-bullhorn" style="color:#AE8A4C;margin-right:.4rem"></i> 메인 화면에 공지 <b>${activePopups.length}건</b>이 팝업으로 노출 중입니다.</span>
    <a class="btn sm ghost" href="/admin/notices">공지 관리</a>
  </div>` : ''}
  <div class="cards">
    <a class="stat" href="/admin/reservations" style="display:block"><div class="n">${rsvIdx.length}</div><div class="l">누적 예약${newCount ? ` · <b style="color:#9C2B2B">신규 ${newCount}</b>` : ''}</div></a>
    <a class="stat" href="/admin/members" style="display:block"><div class="n">${userIdx.length}</div><div class="l">회원</div></a>
    <a class="stat" href="/admin/cases" style="display:block"><div class="n">${caseIdx.length}</div><div class="l">케이스</div></a>
    <a class="stat" href="/admin/columns" style="display:block"><div class="n">${colIdx.length}</div><div class="l">칼럼</div></a>
    <a class="stat" href="/admin/notices" style="display:block"><div class="n">${ntcIdx.length}</div><div class="l">공지${activePopups.length ? ` · <b style="color:#AE8A4C">팝업 ${activePopups.length}</b>` : ''}</div></a>
  </div>

  <div class="row2" style="align-items:start">
    <div class="panel" style="margin-bottom:0">
      <div class="toolbar" style="margin-bottom:.8rem"><strong>최근 예약 신청</strong><a class="muted" href="/admin/reservations" style="font-size:.82rem">전체 보기 →</a></div>
      ${recentRsv.length ? `<table style="border:0">
        <tbody>${recentRsv.map((r) => `<tr>
          <td style="border-bottom:1px solid var(--line)"><b>${esc(r.name)}</b><br><small class="muted">${esc(r.treatment || '문의')}</small></td>
          <td style="border-bottom:1px solid var(--line);text-align:right"><small class="muted">${fmtDate(r.createdAt)}</small><br>${rsvBadge(r.status)}</td>
        </tr>`).join('')}</tbody>
      </table>` : '<p class="muted">아직 예약 신청이 없습니다.</p>'}
    </div>
    <div class="panel" style="margin-bottom:0">
      <strong>빠른 작업</strong>
      <div style="display:flex;flex-direction:column;gap:.6rem;margin-top:1rem">
        <a class="btn" href="/admin/notices/new"><i class="fas fa-bullhorn"></i> 공지 작성 (팝업 띄우기)</a>
        <a class="btn ghost" href="/admin/cases/new"><i class="fas fa-plus"></i> 케이스 등록</a>
        <a class="btn ghost" href="/admin/columns/new"><i class="fas fa-pen-nib"></i> 칼럼 작성</a>
        <a class="btn ghost" href="/" target="_blank"><i class="fas fa-arrow-up-right-from-square"></i> 사이트 미리보기</a>
      </div>
    </div>
  </div>
  <p class="muted" style="margin-top:1.6rem">병원 기본정보(전화·주소·진료시간)는 <code>src/data/clinic.ts</code> 파일에서 관리됩니다.</p>`
  return c.html(shell('대시보드', body, '/admin'))
})

// ---------- 예약 관리 ----------
admin.get('/reservations', async (c) => {
  const store = new Store(c.env.R2)
  const idx = await store.index<{ id: string }>('reservations')
  const items: Reservation[] = []
  for (const it of idx.slice(0, 50)) {
    const r = await store.getJSON<Reservation>(`reservations/${it.id}.json`)
    if (r) items.push(r)
  }
  const badge = (s: string) => `<span class="badge ${s}">${{ new: '신규', confirmed: '확정', done: '완료', cancel: '취소' }[s] || s}</span>`
  const body = `
  <h1>예약 관리</h1>
  ${items.length ? `
  <table>
    <thead><tr><th>접수일시</th><th>성함</th><th>연락처</th><th>관심 진료</th><th>희망 일정</th><th>메모</th><th>상태</th><th></th></tr></thead>
    <tbody>
    ${items.map((r) => `
      <tr>
        <td class="muted">${r.createdAt.slice(0, 16).replace('T', ' ')}</td>
        <td><strong>${r.name}</strong></td>
        <td><a href="tel:${r.phone}">${r.phone}</a></td>
        <td>${r.treatment || '-'}</td>
        <td>${r.preferredDate || '-'}</td>
        <td style="max-width:220px;font-size:.84rem">${(r.message || '-').slice(0, 80)}</td>
        <td>${badge(r.status)}</td>
        <td>
          <form method="POST" action="/admin/reservations/${r.id}/status" style="display:flex;gap:.3rem">
            <select name="status" style="width:auto;padding:.3rem .4rem;font-size:.8rem">
              ${['new', 'confirmed', 'done', 'cancel'].map((s) => `<option value="${s}" ${r.status === s ? 'selected' : ''}>${{ new: '신규', confirmed: '확정', done: '완료', cancel: '취소' }[s]}</option>`).join('')}
            </select>
            <button class="btn sm">저장</button>
          </form>
        </td>
      </tr>`).join('')}
    </tbody>
  </table>` : '<div class="panel">아직 접수된 예약 신청이 없습니다.</div>'}`
  return c.html(shell('예약 관리', body, '/admin/reservations'))
})

admin.post('/reservations/:id/status', async (c) => {
  const id = c.req.param('id')
  const form = await c.req.parseBody()
  const status = String(form.status || 'new') as Reservation['status']
  const store = new Store(c.env.R2)
  const r = await store.getJSON<Reservation>(`reservations/${id}.json`)
  if (r) {
    r.status = status
    await store.putJSON(`reservations/${id}.json`, r)
    try {
      await c.env.DB.prepare('UPDATE reservation_index SET status = ? WHERE id = ?').bind(status, id).run()
    } catch { /* noop */ }
  }
  return c.redirect('/admin/reservations')
})

// ---------- 회원 관리 ----------
admin.get('/members', async (c) => {
  const store = new Store(c.env.R2)
  const idx = await store.index<{ email: string; name?: string; phone?: string; agreeMarketing?: boolean; createdAt?: string }>('users')
  const body = `
  <h1>회원 관리 <small class="muted" style="font-weight:400;font-size:.9rem">총 ${idx.length}명</small></h1>
  ${idx.length ? `
  <table>
    <thead><tr><th>가입일</th><th>이름</th><th>이메일</th><th>휴대전화</th><th>마케팅 동의</th><th></th></tr></thead>
    <tbody>
    ${idx.map((u) => `
      <tr>
        <td class="muted">${(u.createdAt || '').slice(0, 10)}</td>
        <td><strong>${u.name || '-'}</strong></td>
        <td>${u.email}</td>
        <td>${u.phone ? `<a href="tel:${u.phone}">${u.phone}</a>` : '-'}</td>
        <td>${u.agreeMarketing ? '<span class="badge confirmed">동의</span>' : '<span class="badge">미동의</span>'}</td>
        <td><form method="POST" action="/admin/members/delete" style="display:inline" onsubmit="return confirm('회원을 삭제(탈퇴 처리)할까요?')">
          <input type="hidden" name="email" value="${u.email}"><button class="btn sm danger">삭제</button></form></td>
      </tr>`).join('')}
    </tbody>
  </table>
  <p class="muted" style="margin-top:1rem">※ 마케팅 미동의 회원에게는 광고성 정보를 발송할 수 없습니다 (정보통신망법).</p>`
    : '<div class="panel">가입한 회원이 없습니다. 사이트의 <a href="/signup" target="_blank" style="text-decoration:underline">회원가입</a> 페이지에서 가입할 수 있습니다.</div>'}`
  return c.html(shell('회원 관리', body, '/admin/members'))
})

admin.post('/members/delete', async (c) => {
  const f = await c.req.parseBody()
  const email = String(f.email || '').toLowerCase()
  if (email) {
    const store = new Store(c.env.R2)
    await store.delete(`users/${encodeURIComponent(email)}.json`)
    await store.setIndex('users', (await store.index<any>('users')).filter((x: any) => x.email !== email))
  }
  return c.redirect('/admin/members')
})

// ---------- 조회수 헬퍼 (D1 집계 — 봇 제외) ----------
async function viewCounts(c: any, type: string, ids: string[]): Promise<Record<string, number>> {
  const out: Record<string, number> = {}
  if (!ids.length) return out
  try {
    const placeholders = ids.map(() => '?').join(',')
    const rows = await c.env.DB.prepare(
      `SELECT content_id, COUNT(*) AS n FROM page_views WHERE content_type = ? AND is_bot = 0 AND content_id IN (${placeholders}) GROUP BY content_id`
    ).bind(type, ...ids).all()
    for (const r of (rows?.results || []) as any[]) out[r.content_id] = r.n
  } catch { /* D1 미연결 폴백 */ }
  return out
}

// ---------- 이미지 업로드 (공용) ----------
admin.post('/upload', async (c) => {
  const form = await c.req.parseBody()
  const file = form.file
  if (!(file instanceof File)) return c.json({ ok: false, error: '파일이 없습니다.' }, 400)
  if (file.size > 8 * 1024 * 1024) return c.json({ ok: false, error: '8MB 이하 이미지만 가능합니다.' }, 400)
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
  const key = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}.${ext}`
  const store = new Store(c.env.R2)
  await store.putImage(`images/${key}`, await file.arrayBuffer(), file.type || 'image/jpeg')
  return c.json({ ok: true, url: `/api/images/${key}` })
})

// 업로드 위젯 스크립트 (폼 안에서 사용)
const uploadScript = `
<script>
async function upload(input, targetId) {
  var f = input.files && input.files[0];
  if (!f) return;
  var fd = new FormData(); fd.append('file', f);
  var note = input.nextElementSibling;
  if (note) note.textContent = '업로드 중…';
  var res = await fetch('/admin/upload', { method: 'POST', body: fd });
  var data = await res.json();
  if (data.ok) {
    document.getElementById(targetId).value = data.url;
    if (note) note.textContent = '✓ 업로드 완료: ' + data.url;
  } else if (note) note.textContent = '실패: ' + (data.error || '');
}
// --- 드래그앤드롭 이미지 삽입 (textarea[data-dropzone]) ---
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('textarea[data-dropzone]').forEach(function (ta) {
    ['dragenter','dragover'].forEach(function (ev) {
      ta.addEventListener(ev, function (e) { e.preventDefault(); ta.style.outline = '2px dashed #AE8A4C'; });
    });
    ['dragleave','drop'].forEach(function (ev) {
      ta.addEventListener(ev, function (e) { e.preventDefault(); ta.style.outline = ''; });
    });
    ta.addEventListener('drop', async function (e) {
      var files = e.dataTransfer && e.dataTransfer.files;
      if (!files || !files.length) return;
      var pos = ta.selectionStart || ta.value.length;
      for (var i = 0; i < files.length; i++) {
        var f = files[i];
        if (!/^image\\//.test(f.type)) continue;
        var fd = new FormData(); fd.append('file', f);
        var marker = '\\n<p>[이미지 업로드 중…]</p>\\n';
        ta.value = ta.value.slice(0, pos) + marker + ta.value.slice(pos);
        var res = await fetch('/admin/upload', { method: 'POST', body: fd });
        var data = await res.json();
        var tag = data.ok
          ? '\\n<figure><img src="' + data.url + '" alt="" loading="lazy" style="width:100%;border-radius:4px"><figcaption></figcaption></figure>\\n'
          : '\\n<!-- 업로드 실패: ' + (data.error || '') + ' -->\\n';
        ta.value = ta.value.replace(marker, tag);
        pos = ta.value.indexOf(tag) + tag.length;
      }
    });
  });
});
</script>`

// ===== 리치 에디터 + SEO 진단 스크립트 (칼럼 작성용) =====
const rteScript = `
<script>
var ED, SRC, srcMode=false;
document.addEventListener('DOMContentLoaded', function(){
  ED = document.getElementById('rteEditor');
  SRC = document.getElementById('rteSource');
  if(!ED) return;

  // 툴바 명령
  document.querySelectorAll('#rteToolbar button[data-cmd]').forEach(function(b){
    b.addEventListener('mousedown', function(e){ e.preventDefault(); });
    b.addEventListener('click', function(){ document.execCommand(b.getAttribute('data-cmd'),false,null); ED.focus(); refreshToolbar(); afterChange(); });
  });
  ED.addEventListener('keyup', refreshToolbar);
  ED.addEventListener('mouseup', refreshToolbar);
  ED.addEventListener('input', afterChange);

  // 단축키
  ED.addEventListener('keydown', function(e){
    if((e.ctrlKey||e.metaKey)){
      var k=e.key.toLowerCase();
      if(k==='b'||k==='i'||k==='u'){ /* 브라우저 기본 처리 후 갱신 */ setTimeout(refreshToolbar,0); }
    }
  });

  // 드래그앤드롭 이미지
  ['dragenter','dragover'].forEach(function(ev){ ED.addEventListener(ev,function(e){ e.preventDefault(); ED.classList.add('drag'); }); });
  ['dragleave','dragend'].forEach(function(ev){ ED.addEventListener(ev,function(e){ ED.classList.remove('drag'); }); });
  ED.addEventListener('drop', function(e){
    e.preventDefault(); ED.classList.remove('drag');
    var files = e.dataTransfer && e.dataTransfer.files;
    if(files && files.length){ placeCaret(e); rteFiles(files); }
  });
  // 붙여넣기 이미지
  ED.addEventListener('paste', function(e){
    var items = e.clipboardData && e.clipboardData.items; if(!items) return;
    var imgs=[]; for(var i=0;i<items.length;i++){ if(items[i].type.indexOf('image')===0){ var f=items[i].getAsFile(); if(f) imgs.push(f); } }
    if(imgs.length){ e.preventDefault(); rteFiles(imgs); }
  });

  // 이미지 선택 → 미니바
  ED.addEventListener('click', function(e){
    var fig = e.target.closest && e.target.closest('figure');
    document.querySelectorAll('.rte-editor figure.is-selected').forEach(function(f){ if(f!==fig){ f.classList.remove('is-selected'); var bar=f.querySelector('.img-bar'); if(bar) bar.remove(); } });
    if(fig && e.target.tagName==='IMG'){ selectFigure(fig); }
  });

  afterChange(); updateSeo();
});

function placeCaret(e){
  var r;
  if(document.caretRangeFromPoint) r=document.caretRangeFromPoint(e.clientX,e.clientY);
  else if(document.caretPositionFromPoint){ var p=document.caretPositionFromPoint(e.clientX,e.clientY); r=document.createRange(); r.setStart(p.offsetNode,p.offset); }
  if(r){ var sel=window.getSelection(); sel.removeAllRanges(); sel.addRange(r); }
}

function refreshToolbar(){
  ['bold','italic','underline','insertUnorderedList','insertOrderedList'].forEach(function(cmd){
    var b=document.querySelector('#rteToolbar button[data-cmd="'+cmd+'"]'); if(!b) return;
    try{ b.classList.toggle('on', document.queryCommandState(cmd)); }catch(_){}
  });
}
function rteBlock(tag){ if(!tag) return; document.execCommand('formatBlock',false, tag==='p'?'p':tag); ED.focus(); afterChange(); }
function rteLink(){ var url=prompt('링크 주소를 입력하세요 (예: /treatments/implant 또는 https://...)'); if(url){ document.execCommand('createLink',false,url); afterChange(); } }
function rteHr(){ document.execCommand('insertHTML',false,'<hr>'); afterChange(); }

// 이미지 업로드 후 삽입
function rteFiles(files){
  for(var i=0;i<files.length;i++){ (function(f){
    if(!/^image\\//.test(f.type)) return;
    var id='up'+Date.now()+Math.floor(Math.random()*999);
    var figHtml='<figure contenteditable="false"><img id="'+id+'" class="uploading" src="" alt=""><figcaption contenteditable="true"></figcaption></figure><p><br></p>';
    document.execCommand('insertHTML',false,figHtml);
    var fd=new FormData(); fd.append('file',f);
    fetch('/admin/upload',{method:'POST',body:fd}).then(function(r){return r.json();}).then(function(d){
      var img=document.getElementById(id); if(!img) return;
      if(d.ok){ img.src=d.url; img.classList.remove('uploading'); }
      else { var fig=img.closest('figure'); if(fig) fig.remove(); alert('업로드 실패: '+(d.error||'')); }
      afterChange();
    }).catch(function(){ var img=document.getElementById(id); if(img){var fig=img.closest('figure'); if(fig) fig.remove();} });
  })(files[i]); }
}

// 이미지 미니바 (정렬·alt·삭제)
function selectFigure(fig){
  fig.classList.add('is-selected');
  if(fig.querySelector('.img-bar')) return;
  var bar=document.createElement('div'); bar.className='img-bar'; bar.contentEditable='false';
  bar.innerHTML='<button type="button" data-a="" title="기본(가운데)"><i class="fas fa-align-center"></i></button>'+
    '<button type="button" data-a="align-left" title="왼쪽 정렬"><i class="fas fa-align-left"></i></button>'+
    '<button type="button" data-a="align-right" title="오른쪽 정렬"><i class="fas fa-align-right"></i></button>'+
    '<button type="button" data-alt title="대체텍스트(alt) — SEO"><i class="fas fa-tag"></i></button>'+
    '<button type="button" data-del title="삭제"><i class="fas fa-trash"></i></button>';
  fig.appendChild(bar);
  bar.querySelectorAll('button[data-a]').forEach(function(b){ b.addEventListener('click',function(e){ e.stopPropagation();
    fig.classList.remove('align-left','align-right'); var a=b.getAttribute('data-a'); if(a) fig.classList.add(a);
    bar.querySelectorAll('button[data-a]').forEach(function(x){x.classList.remove('on');}); b.classList.add('on'); afterChange(); }); });
  bar.querySelector('[data-alt]').addEventListener('click',function(e){ e.stopPropagation();
    var img=fig.querySelector('img'); var v=prompt('이미지 대체텍스트(alt) — 검색엔진·접근성에 중요합니다:', img.getAttribute('alt')||''); if(v!==null){ img.setAttribute('alt',v); afterChange(); } });
  bar.querySelector('[data-del]').addEventListener('click',function(e){ e.stopPropagation(); if(confirm('이미지를 삭제할까요?')){ fig.remove(); afterChange(); } });
}

// 소스 보기 토글
function rteToggleSource(){
  srcMode=!srcMode; var btn=document.getElementById('srcBtn');
  if(srcMode){ SRC.value=cleanHtml(ED.innerHTML); ED.style.display='none'; SRC.style.display='block'; btn.classList.add('on'); }
  else { ED.innerHTML=SRC.value; SRC.style.display='none'; ED.style.display='block'; btn.classList.remove('on'); afterChange(); }
}

// HTML 정리 (저장용) — 미니바·선택표시 제거, 빈 단락 정리
function cleanHtml(h){
  var tmp=document.createElement('div'); tmp.innerHTML=h;
  tmp.querySelectorAll('.img-bar').forEach(function(n){n.remove();});
  tmp.querySelectorAll('figure').forEach(function(f){ f.classList.remove('is-selected'); f.removeAttribute('contenteditable'); });
  tmp.querySelectorAll('figcaption').forEach(function(f){ f.removeAttribute('contenteditable'); if(!f.textContent.trim()) f.remove(); });
  tmp.querySelectorAll('img').forEach(function(im){ im.classList.remove('uploading'); im.removeAttribute('id'); im.setAttribute('loading','lazy'); });
  tmp.querySelectorAll('[style=""]').forEach(function(n){n.removeAttribute('style');});
  return tmp.innerHTML.replace(/<p><br><\\/p>\\s*$/,'').trim();
}

// 통계·SEO 갱신
function plain(){ return (ED.textContent||'').replace(/\\s+/g,' ').trim(); }
function afterChange(){
  var t=plain(); var chars=t.length; var words=t?t.split(/\\s+/).length:0; var imgs=ED.querySelectorAll('img').length;
  document.getElementById('st-chars').textContent=chars;
  document.getElementById('st-words').textContent=words;
  document.getElementById('st-imgs').textContent=imgs;
  document.getElementById('st-read').textContent=Math.max(1,Math.round(chars/500))+'분';
  updateSeo();
}

function cc(elId,val,min,max){
  var el=document.getElementById(elId); if(!el) return;
  el.textContent=val+' / 권장 '+min+'~'+max+'자';
  el.className='charcount'+(val>max||(val>0&&val<min)?' warn':'')+(val>max+15?' bad':'');
}
function updateSeo(){
  var title=(document.getElementById('f-title').value||'').trim();
  var excerpt=(document.getElementById('f-excerpt').value||'').trim();
  var mt=(document.getElementById('f-metatitle').value||'').trim();
  var md=(document.getElementById('f-metadesc').value||'').trim();
  var thumb=(document.getElementById('thumbnail').value||'').trim();
  var rel=document.getElementById('f-related').selectedOptions.length;
  var bodyText=ED?plain():''; var chars=bodyText.length;
  var h2=ED?ED.querySelectorAll('h2,h3').length:0;
  var imgs=ED?ED.querySelectorAll('img'):[];
  var imgNoAlt=0; for(var i=0;i<imgs.length;i++){ if(!(imgs[i].getAttribute('alt')||'').trim()) imgNoAlt++; }
  var links=ED?ED.querySelectorAll('a').length:0;

  cc('cc-title',title.length,15,35);
  cc('cc-excerpt',excerpt.length,50,160);
  cc('cc-metatitle',(mt||title).length,15,60);
  cc('cc-metadesc',(md||excerpt).length,50,155);

  // 구글 미리보기
  document.getElementById('gp-t').textContent=(mt||title||'제목을 입력하세요');
  document.getElementById('gp-d').textContent=(md||excerpt||'요약/메타 설명을 입력하세요');
  document.getElementById('gp-u').textContent='${esc(clinic.domain)}'.replace(/^https?:\\/\\//,'')+'/column/' + (slugP(title)||'…');

  var checks=[
    { ok: title.length>=15 && title.length<=40, warn:title.length>0, t:'제목 15~40자 ('+title.length+'자)' },
    { ok: (md||excerpt).length>=50 && (md||excerpt).length<=155, warn:(md||excerpt).length>0, t:'메타 설명 50~155자' },
    { ok: chars>=600, warn:chars>0, t:'본문 충분한 분량 (현재 '+chars+'자 / 권장 600+)' },
    { ok: h2>=2, warn:h2>0, t:'소제목(H2/H3) 2개 이상 ('+h2+'개)' },
    { ok: imgs.length>=1, warn:false, t:'본문 이미지 1장 이상 ('+imgs.length+'장)' },
    { ok: imgs.length===0||imgNoAlt===0, warn:imgNoAlt>0, t: imgNoAlt>0?('이미지 alt 누락 '+imgNoAlt+'개 — 채워주세요'):'모든 이미지 alt 입력 완료' },
    { ok: !!thumb, warn:false, t:'대표 이미지(썸네일·OG) 설정' },
    { ok: rel>=1, warn:false, t:'관련 진료 연결 — 내부링크 ('+rel+'개)' },
    { ok: links>=1, warn:false, t:'본문 내 링크 1개 이상 ('+links+'개)' },
  ];
  var score=0; checks.forEach(function(c){ score += c.ok?1:0; });
  var pct=Math.round(score/checks.length*100);
  var ring=document.getElementById('seoRing'); ring.style.setProperty('--p',pct);
  ring.style.setProperty('--ring', pct>=80?'#2E7D52':pct>=50?'#C99A2E':'#C25B4A');
  document.getElementById('seoNum').textContent=pct;
  document.getElementById('seoGrade').textContent = pct>=80?'훌륭합니다 🎉':pct>=50?'좋아요 — 조금만 더!':'개선이 필요해요';
  document.getElementById('seoChecks').innerHTML = checks.map(function(c){
    var cls=c.ok?'ok':(c.warn?'warn':'bad');
    var ic=c.ok?'fa-circle-check':(c.warn?'fa-circle-exclamation':'fa-circle-xmark');
    return '<li class="'+cls+'"><i class="fas '+ic+'"></i><span>'+c.t+'</span></li>';
  }).join('');
}
function slugP(s){ return (s||'').toLowerCase().trim().replace(/[^\\w가-힣\\s-]/g,'').replace(/\\s+/g,'-').slice(0,40); }

// 저장 직전 — 에디터 HTML을 hidden 필드에 동기화
function syncEditor(){
  if(srcMode){ rteToggleSource(); }
  document.querySelectorAll('.rte-editor figure.is-selected').forEach(function(f){ f.classList.remove('is-selected'); var b=f.querySelector('.img-bar'); if(b) b.remove(); });
  var html=cleanHtml(ED.innerHTML);
  if(plain().length<10){ alert('본문 내용을 입력해 주세요.'); return false; }
  document.getElementById('contentHtml').value=html;
  return true;
}
</script>`

// ============================================================================
// 케이스 관리
// ============================================================================
admin.get('/cases', async (c) => {
  const store = new Store(c.env.R2)
  const idx = await store.index<{ id: string; title: string; createdAt: string; published: boolean }>('cases')
  const views = await viewCounts(c, 'case', idx.map((x) => x.id))
  const body = `
  <div class="toolbar"><h1 style="margin:0">케이스 관리</h1><a class="btn" href="/admin/cases/new"><i class="fas fa-plus"></i> 새 케이스</a></div>
  ${idx.length ? `<table><thead><tr><th>제목</th><th>등록일</th><th>조회수</th><th>상태</th><th></th></tr></thead><tbody>
    ${idx.map((x) => `<tr><td>${x.title}</td><td class="muted">${(x.createdAt || '').slice(0, 10)}</td>
      <td class="muted"><i class="far fa-eye" style="font-size:.75rem"></i> ${views[x.id] || 0}</td>
      <td>${x.published ? '<span class="badge confirmed">게시</span>' : '<span class="badge">비공개</span>'}</td>
      <td><a class="btn sm ghost" href="/admin/cases/${x.id}">수정</a>
      <form method="POST" action="/admin/cases/${x.id}/delete" style="display:inline" onsubmit="return confirm('삭제할까요?')"><button class="btn sm danger">삭제</button></form></td></tr>`).join('')}
  </tbody></table>` : '<div class="panel">등록된 케이스가 없습니다.</div>'}`
  return c.html(shell('케이스', body, '/admin/cases'))
})

function caseForm(cs?: CaseItem) {
  const txOpts = treatments.map((t) => `<option value="${t.slug}" ${cs?.treatmentSlug === t.slug ? 'selected' : ''}>${t.name}</option>`).join('')
  const docOpts = doctors.map((d) => `<option value="${d.slug}" ${cs?.doctorSlug === d.slug ? 'selected' : ''}>${d.name} ${d.role}</option>`).join('')
  const imgField = (id: string, label: string, val?: string) => `
    <label>${label}</label>
    <input type="text" id="${id}" name="${id}" value="${val || ''}" placeholder="/api/images/... (직접 입력 또는 업로드)">
    <input type="file" accept="image/*" onchange="upload(this,'${id}')" style="margin-top:.3rem"><small class="muted"></small>`
  return `
  <form class="panel" method="POST">
    <label>케이스 제목 *</label><input name="title" required value="${cs?.title || ''}" placeholder="예: 50대 남성 — 상악 전치부 심미보철">
    <div class="row3">
      <div><label>나이대</label><input name="ageGroup" value="${cs?.ageGroup || ''}" placeholder="50대"></div>
      <div><label>성별</label><select name="gender">${['남성', '여성'].map((g) => `<option ${cs?.gender === g ? 'selected' : ''}>${g}</option>`).join('')}</select></div>
      <div><label>치료 기간</label><input name="duration" value="${cs?.duration || ''}" placeholder="3개월"></div>
    </div>
    <div class="row2">
      <div><label>진료 분류</label><select name="treatmentSlug">${txOpts}</select></div>
      <div><label>담당 원장</label><select name="doctorSlug">${docOpts}</select></div>
    </div>
    <label>지역 라벨 <small class="muted">(입력하면 자동완성 — 예: "온천" → 부산광역시 동래구 온천동)</small></label>
    <input name="regionLabel" list="region-list" value="${cs?.regionLabel || ''}" placeholder="동 이름으로 검색 — 예: 온천, 장전, 명률…" autocomplete="off">
    <datalist id="region-list">${regionList.map((r) => `<option value="${r}">`).join('')}</datalist>
    <label>상세 설명 (SEO 본문, 줄바꿈으로 문단 구분) *</label>
    <textarea name="description" required placeholder="내원 계기 → 진단 → 치료 과정 → 결과를 환자의 언어로.">${cs?.description || ''}</textarea>
    <div class="row2">
      <div>${imgField('intraBefore', '구내 사진 — 치료 전', cs?.images?.intraBefore)}</div>
      <div>${imgField('intraAfter', '구내 사진 — 치료 후', cs?.images?.intraAfter)}</div>
    </div>
    <div class="row2">
      <div>${imgField('panoBefore', '파노라마 — 치료 전', cs?.images?.panoBefore)}</div>
      <div>${imgField('panoAfter', '파노라마 — 치료 후', cs?.images?.panoAfter)}</div>
    </div>
    <label><input type="checkbox" name="published" style="width:auto;margin-right:.5rem" ${cs?.published !== false ? 'checked' : ''}>게시 (체크 해제 시 비공개 저장)</label>
    <label><input type="checkbox" name="consent" style="width:auto;margin-right:.5rem" required ${cs ? 'checked' : ''}>환자 동의를 받았으며, 동일 환자·동일 부위 사진임을 확인합니다 (의료법 §56)</label>
    <button class="btn" style="margin-top:1.2rem"><i class="fas fa-floppy-disk"></i> 저장</button>
  </form>${uploadScript}`
}

admin.get('/cases/new', (c) => c.html(shell('케이스 등록', `<h1>새 케이스</h1>${caseForm()}`, '/admin/cases')))
admin.get('/cases/:id', async (c) => {
  const store = new Store(c.env.R2)
  const cs = await store.getJSON<CaseItem>(`cases/${c.req.param('id')}.json`)
  if (!cs) return c.redirect('/admin/cases')
  return c.html(shell('케이스 수정', `<h1>케이스 수정</h1>${caseForm(cs)}`, '/admin/cases'))
})

async function saveCase(c: any, existing?: CaseItem) {
  const f = await c.req.parseBody()
  const store = new Store(c.env.R2)
  const title = String(f.title || '').trim()
  const cs: CaseItem = {
    id: existing?.id || newId('cs_'),
    slug: existing?.slug || slugify(title) || newId('case-'),
    title,
    ageGroup: String(f.ageGroup || ''),
    gender: String(f.gender || ''),
    treatmentSlug: String(f.treatmentSlug || ''),
    regionLabel: String(f.regionLabel || ''),
    doctorSlug: String(f.doctorSlug || ''),
    duration: String(f.duration || ''),
    description: String(f.description || ''),
    images: {
      panoBefore: String(f.panoBefore || '') || undefined,
      panoAfter: String(f.panoAfter || '') || undefined,
      intraBefore: String(f.intraBefore || '') || undefined,
      intraAfter: String(f.intraAfter || '') || undefined,
    },
    published: !!f.published,
    createdAt: existing?.createdAt || new Date().toISOString(),
  }
  await store.putJSON(`cases/${cs.id}.json`, cs)
  const idx = (await store.index<any>('cases')).filter((x: any) => x.id !== cs.id)
  idx.unshift({ id: cs.id, slug: cs.slug, title: cs.title, createdAt: cs.createdAt, published: cs.published })
  await store.setIndex('cases', idx)
  // 발행된 케이스(비포애프터)는 구글에 자동 색인 요청
  if (cs.published) fireIndexNotify(c, `/cases/${cs.slug}`)
}

admin.post('/cases/new', async (c) => { await saveCase(c); return c.redirect('/admin/cases') })
admin.post('/cases/:id', async (c) => {
  const store = new Store(c.env.R2)
  const existing = await store.getJSON<CaseItem>(`cases/${c.req.param('id')}.json`)
  await saveCase(c, existing || undefined)
  return c.redirect('/admin/cases')
})
admin.post('/cases/:id/delete', async (c) => {
  const id = c.req.param('id')
  const store = new Store(c.env.R2)
  const cs = await store.getJSON<CaseItem>(`cases/${id}.json`)
  await store.delete(`cases/${id}.json`)
  await store.setIndex('cases', (await store.index<any>('cases')).filter((x: any) => x.id !== id))
  if (cs?.slug) fireIndexNotify(c, `/cases/${cs.slug}`, 'URL_DELETED')
  return c.redirect('/admin/cases')
})

// ============================================================================
// 칼럼 관리
// ============================================================================
admin.get('/columns', async (c) => {
  const store = new Store(c.env.R2)
  const idx = await store.index<{ id: string; title: string; createdAt: string; published: boolean }>('columns')
  const views = await viewCounts(c, 'column', idx.map((x) => x.id))
  const body = `
  <div class="toolbar"><h1 style="margin:0">칼럼 관리</h1><a class="btn" href="/admin/columns/new"><i class="fas fa-plus"></i> 새 칼럼</a></div>
  ${idx.length ? `<table><thead><tr><th>제목</th><th>작성일</th><th>조회수</th><th>상태</th><th></th></tr></thead><tbody>
    ${idx.map((x) => `<tr><td>${x.title}</td><td class="muted">${(x.createdAt || '').slice(0, 10)}</td>
      <td class="muted"><i class="far fa-eye" style="font-size:.75rem"></i> ${views[x.id] || 0}</td>
      <td>${x.published ? '<span class="badge confirmed">게시</span>' : '<span class="badge">비공개</span>'}</td>
      <td><a class="btn sm ghost" href="/admin/columns/${x.id}">수정</a>
      <form method="POST" action="/admin/columns/${x.id}/delete" style="display:inline" onsubmit="return confirm('삭제할까요?')"><button class="btn sm danger">삭제</button></form></td></tr>`).join('')}
  </tbody></table>` : '<div class="panel">작성된 칼럼이 없습니다.</div>'}`
  return c.html(shell('칼럼', body, '/admin/columns'))
})

function columnForm(col?: Column) {
  const docOpts = doctors.map((d) => `<option value="${d.slug}" ${col?.authorSlug === d.slug ? 'selected' : ''}>${d.name} ${d.role}</option>`).join('')
  const txOpts = treatments.map((t) => `<option value="${t.slug}" ${col?.relatedTreatments?.includes(t.slug) ? 'selected' : ''}>${esc(t.name)}</option>`).join('')
  const initial = col?.contentHtml || '<h2>소제목을 입력하세요</h2><p>본문을 입력하세요. 사진은 본문 안으로 끌어다 놓거나 붙여넣으면 바로 삽입됩니다.</p>'
  return `
  <form class="col-layout" method="POST" id="colForm" onsubmit="return syncEditor()">
    <div>
    <div class="panel" style="margin-bottom:1.2rem">
      <label style="margin-top:0">제목 *</label><input name="title" id="f-title" required value="${esc(col?.title || '')}" oninput="updateSeo()">
      <div class="charcount" id="cc-title"></div>
      <label>요약 / 목록 설명 * <small class="muted">(검색결과 본문에 노출 — 1~2문장)</small></label>
      <textarea name="excerpt" id="f-excerpt" required maxlength="200" style="min-height:64px" oninput="updateSeo()">${esc(col?.excerpt || '')}</textarea>
      <div class="charcount" id="cc-excerpt"></div>
    </div>

    <div class="panel" style="margin-bottom:1.2rem">
      <label style="margin-top:0">본문 <small class="muted">— 툴바로 서식 지정 · 사진은 드래그&드롭 또는 붙여넣기(Ctrl+V)로 삽입</small></label>
      <div class="rte-wrap">
        <div class="rte-toolbar" id="rteToolbar">
          <select onchange="rteBlock(this.value);this.selectedIndex=0" title="문단 형식" style="width:auto;height:32px;border:1px solid var(--line);border-radius:6px;font-size:.82rem;padding:0 .4rem">
            <option value="">형식</option>
            <option value="p">본문</option>
            <option value="h2">제목 H2</option>
            <option value="h3">소제목 H3</option>
            <option value="blockquote">인용구</option>
          </select>
          <span class="sep"></span>
          <button type="button" data-cmd="bold" title="굵게 (Ctrl+B)"><i class="fas fa-bold"></i></button>
          <button type="button" data-cmd="italic" title="기울임 (Ctrl+I)"><i class="fas fa-italic"></i></button>
          <button type="button" data-cmd="underline" title="밑줄 (Ctrl+U)"><i class="fas fa-underline"></i></button>
          <span class="sep"></span>
          <button type="button" data-cmd="insertUnorderedList" title="글머리 목록"><i class="fas fa-list-ul"></i></button>
          <button type="button" data-cmd="insertOrderedList" title="번호 목록"><i class="fas fa-list-ol"></i></button>
          <span class="sep"></span>
          <button type="button" onclick="rteLink()" title="링크"><i class="fas fa-link"></i></button>
          <button type="button" onclick="rteHr()" title="구분선"><i class="fas fa-minus"></i></button>
          <button type="button" onclick="document.getElementById('rteImgInput').click()" title="사진 삽입"><i class="fas fa-image"></i></button>
          <input type="file" id="rteImgInput" accept="image/*" multiple style="display:none" onchange="rteFiles(this.files);this.value=''">
          <span class="sep"></span>
          <button type="button" onclick="rteToggleSource()" id="srcBtn" title="HTML 소스 보기" class="lbl" style="width:auto"><i class="fas fa-code"></i> 소스</button>
        </div>
        <div class="rte-editor" id="rteEditor" contenteditable="true" data-ph="여기에 본문을 작성하세요…">${initial}</div>
        <textarea id="rteSource" name="_rte_source" style="display:none;min-height:380px;font-family:monospace;font-size:.84rem;border:0;border-radius:0"></textarea>
        <div class="rte-status">
          <span>글자수 <b id="st-chars">0</b></span>
          <span>단어 <b id="st-words">0</b></span>
          <span>이미지 <b id="st-imgs">0</b></span>
          <span>예상 읽기 <b id="st-read">0분</b></span>
        </div>
      </div>
      <input type="hidden" name="contentHtml" id="contentHtml">
    </div>

    <div class="panel" style="margin-bottom:1.2rem">
      <div class="row2">
        <div><label style="margin-top:0">작성 원장 <small class="muted">(E-E-A-T 저자)</small></label><select name="authorSlug" id="f-author">${docOpts}</select></div>
        <div><label style="margin-top:0">관련 진료 (다중 선택 — 내부링크)</label><select name="relatedTreatments" id="f-related" multiple size="4" onchange="updateSeo()">${txOpts}</select></div>
      </div>
      <label>대표 이미지 (썸네일·OG)</label>
      <input type="text" id="thumbnail" name="thumbnail" value="${esc(col?.thumbnail || '')}" placeholder="/api/images/..." oninput="updateSeo()">
      <input type="file" accept="image/*" onchange="upload(this,'thumbnail')" style="margin-top:.3rem"><small class="muted"></small>
    </div>

    <div class="panel">
      <strong style="font-size:.95rem">검색엔진(SEO) 설정 <small class="muted">— 비우면 제목·요약을 자동 사용</small></strong>
      <label>메타 타이틀 (선택)</label>
      <input name="metaTitle" id="f-metatitle" value="${esc(col?.metaTitle || '')}" maxlength="70" oninput="updateSeo()" placeholder="${esc(col?.title || '검색결과 제목')}">
      <div class="charcount" id="cc-metatitle"></div>
      <label>메타 설명 (선택)</label>
      <textarea name="metaDescription" id="f-metadesc" maxlength="170" style="min-height:60px" oninput="updateSeo()" placeholder="검색결과에 노출될 설명">${esc(col?.metaDescription || '')}</textarea>
      <div class="charcount" id="cc-metadesc"></div>
      <label class="switch" style="margin-top:1rem"><input type="checkbox" name="published" ${col?.published !== false ? 'checked' : ''}><span class="track"></span>
        <span class="sw-text"><b>게시</b><small>체크 해제 시 사이트에 노출되지 않습니다 (임시 저장)</small></span></label>
    </div>

    <button class="btn" style="margin-top:1.4rem"><i class="fas fa-floppy-disk"></i> 저장하기</button>
    </div>

    <aside>
      <div class="seo-panel">
        <strong style="font-size:.9rem;display:block;margin-bottom:.9rem">SEO 진단</strong>
        <div class="seo-score">
          <div class="seo-ring" id="seoRing"><span id="seoNum">0</span></div>
          <div><div id="seoGrade" style="font-weight:700">작성을 시작하세요</div><div class="muted" style="font-size:.78rem">항목을 채울수록 점수가 올라갑니다</div></div>
        </div>
        <ul class="seo-checks" id="seoChecks"></ul>
        <div style="margin-top:1.1rem"><strong style="font-size:.82rem;color:#5a6478">구글 검색결과 미리보기</strong>
          <div class="gpreview"><div class="g-u" id="gp-u">${esc(clinic.domain)}/column/…</div><div class="g-t" id="gp-t">제목</div><div class="g-d" id="gp-d">설명</div></div>
        </div>
      </div>
    </aside>
  </form>${uploadScript}${rteScript}`
}

admin.get('/columns/new', (c) => c.html(shell('칼럼 작성', `<h1>새 칼럼</h1>${columnForm()}`, '/admin/columns')))
admin.get('/columns/:id', async (c) => {
  const store = new Store(c.env.R2)
  const col = await store.getJSON<Column>(`columns/${c.req.param('id')}.json`)
  if (!col) return c.redirect('/admin/columns')
  return c.html(shell('칼럼 수정', `<h1>칼럼 수정</h1>${columnForm(col)}`, '/admin/columns'))
})

async function saveColumn(c: any, existing?: Column) {
  const f = await c.req.parseBody({ all: true })
  const store = new Store(c.env.R2)
  const title = String(f.title || '').trim()
  const rel = Array.isArray(f.relatedTreatments) ? f.relatedTreatments.map(String) : (f.relatedTreatments ? [String(f.relatedTreatments)] : [])
  const col: Column = {
    id: existing?.id || newId('col_'),
    slug: existing?.slug || slugify(title) || newId('column-'),
    title,
    excerpt: String(f.excerpt || ''),
    contentHtml: String(f.contentHtml || ''),
    thumbnail: String(f.thumbnail || '') || undefined,
    images: existing?.images || [],
    authorSlug: String(f.authorSlug || doctors[0].slug),
    relatedTreatments: rel,
    metaTitle: String(f.metaTitle || '') || undefined,
    metaDescription: String(f.metaDescription || '') || undefined,
    published: !!f.published,
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  await store.putJSON(`columns/${col.id}.json`, col)
  const idx = (await store.index<any>('columns')).filter((x: any) => x.id !== col.id)
  idx.unshift({ id: col.id, slug: col.slug, title: col.title, createdAt: col.createdAt, published: col.published })
  await store.setIndex('columns', idx)
  // 발행된 칼럼은 구글에 자동 색인 요청
  if (col.published) fireIndexNotify(c, `/column/${col.slug}`)
}

admin.post('/columns/new', async (c) => { await saveColumn(c); return c.redirect('/admin/columns') })
admin.post('/columns/:id', async (c) => {
  const store = new Store(c.env.R2)
  const existing = await store.getJSON<Column>(`columns/${c.req.param('id')}.json`)
  await saveColumn(c, existing || undefined)
  return c.redirect('/admin/columns')
})
admin.post('/columns/:id/delete', async (c) => {
  const id = c.req.param('id')
  const store = new Store(c.env.R2)
  const col = await store.getJSON<Column>(`columns/${id}.json`)
  await store.delete(`columns/${id}.json`)
  await store.setIndex('columns', (await store.index<any>('columns')).filter((x: any) => x.id !== id))
  if (col?.slug) fireIndexNotify(c, `/column/${col.slug}`, 'URL_DELETED')
  return c.redirect('/admin/columns')
})

// ============================================================================
// 공지 관리
// ============================================================================
admin.get('/notices', async (c) => {
  const store = new Store(c.env.R2)
  const idx = await store.index<{ id: string; title: string; createdAt: string; published: boolean; pinned?: boolean; popup?: boolean; popupUntil?: string }>('notices')
  const views = await viewCounts(c, 'notice', idx.map((x) => x.id))
  const today = new Date().toISOString().slice(0, 10)
  const popupActive = (x: any) => x.popup && x.published && (!x.popupUntil || x.popupUntil >= today)
  const activeCount = idx.filter(popupActive).length
  const body = `
  <div class="toolbar"><h1 style="margin:0">공지 관리</h1><a class="btn" href="/admin/notices/new"><i class="fas fa-plus"></i> 새 공지</a></div>
  ${activeCount ? `<div class="panel" style="background:#FCF7EA;border-color:#E4D9BC;display:flex;align-items:center;gap:.6rem;padding:.9rem 1.2rem"><i class="fas fa-bullhorn" style="color:#AE8A4C"></i> 현재 메인 화면에 <b>${activeCount}건</b>의 공지가 팝업으로 노출 중입니다.</div>` : ''}
  ${idx.length ? `<table><thead><tr><th>제목</th><th>작성일</th><th>조회수</th><th>상태</th><th></th></tr></thead><tbody>
    ${idx.map((x) => `<tr><td>${esc(x.title)}</td><td class="muted">${(x.createdAt || '').slice(0, 10)}</td>
      <td class="muted"><i class="far fa-eye" style="font-size:.75rem"></i> ${views[x.id] || 0}</td>
      <td style="white-space:nowrap">${x.published ? '<span class="badge confirmed">게시</span>' : '<span class="badge off">비공개</span>'}${x.pinned ? ' <span class="badge pin">고정</span>' : ''}${popupActive(x) ? ' <span class="badge popup"><i class="fas fa-bullhorn" style="font-size:.65rem"></i> 팝업</span>' : (x.popup ? ' <span class="badge off">팝업 대기</span>' : '')}</td>
      <td><a class="btn sm ghost" href="/admin/notices/${x.id}">수정</a>
      <form method="POST" action="/admin/notices/${x.id}/delete" style="display:inline" onsubmit="return confirm('삭제할까요?')"><button class="btn sm danger">삭제</button></form></td></tr>`).join('')}
  </tbody></table>` : '<div class="panel">작성된 공지가 없습니다.</div>'}`
  return c.html(shell('공지', body, '/admin/notices'))
})

function noticeForm(n?: Notice) {
  return `
  <form class="panel" method="POST">
    <label>제목 *</label><input name="title" required value="${esc(n?.title || '')}">
    <label>본문 HTML *</label>
    <textarea name="contentHtml" required style="min-height:220px">${esc(n?.contentHtml || '<p>내용…</p>')}</textarea>
    <label>이미지 (선택)</label>
    <input type="text" id="image" name="image" value="${esc(n?.image || '')}" placeholder="/api/images/...">
    <input type="file" accept="image/*" onchange="upload(this,'image')" style="margin-top:.3rem"><small class="muted"></small>

    <div style="margin-top:1.6rem;border-top:1px solid var(--line);padding-top:1.2rem">
      <strong style="font-size:.95rem">노출 설정</strong>

      <label class="switch"><input type="checkbox" name="published" ${n?.published !== false ? 'checked' : ''}><span class="track"></span>
        <span class="sw-text"><b>게시</b><small>체크 해제 시 사이트에 노출되지 않습니다 (임시 저장)</small></span></label>

      <label class="switch"><input type="checkbox" name="pinned" ${n?.pinned ? 'checked' : ''}><span class="track"></span>
        <span class="sw-text"><b>상단 고정</b><small>공지 목록 맨 위에 대표 공지로 고정합니다</small></span></label>

      <label class="switch accent"><input type="checkbox" name="popup" id="popupToggle" ${n?.popup ? 'checked' : ''} onchange="document.getElementById('popupFields').style.display=this.checked?'block':'none'"><span class="track"></span>
        <span class="sw-text"><b><i class="fas fa-bullhorn" style="color:#AE8A4C;margin-right:.3rem"></i>메인 페이지 팝업으로 띄우기</b><small>홈 화면 접속 시 팝업 창으로 이 공지를 노출합니다</small></span></label>

      <div class="sub-fields" id="popupFields" style="display:${n?.popup ? 'block' : 'none'}">
        <div class="row2">
          <div>
            <label style="margin-top:0">팝업 노출 종료일 (선택)</label>
            <input type="date" name="popupUntil" value="${esc(n?.popupUntil || '')}">
            <small class="muted">이 날짜까지만 팝업이 뜹니다. 비우면 계속 노출.</small>
          </div>
          <div>
            <label style="margin-top:0">팝업 클릭 시 이동 링크 (선택)</label>
            <input type="text" name="link" value="${esc(n?.link || '')}" placeholder="예: /reservation 또는 https://...">
            <small class="muted">비우면 공지 상세 페이지로 이동합니다.</small>
          </div>
        </div>
      </div>
    </div>

    <button class="btn" style="margin-top:1.2rem"><i class="fas fa-floppy-disk"></i> 저장</button>
  </form>${uploadScript}`
}

admin.get('/notices/new', (c) => c.html(shell('공지 작성', `<h1>새 공지</h1>${noticeForm()}`, '/admin/notices')))
admin.get('/notices/:id', async (c) => {
  const store = new Store(c.env.R2)
  const n = await store.getJSON<Notice>(`notices/${c.req.param('id')}.json`)
  if (!n) return c.redirect('/admin/notices')
  return c.html(shell('공지 수정', `<h1>공지 수정</h1>${noticeForm(n)}`, '/admin/notices'))
})

async function saveNotice(c: any, existing?: Notice) {
  const f = await c.req.parseBody()
  const store = new Store(c.env.R2)
  const n: Notice = {
    id: existing?.id || newId('ntc_'),
    title: String(f.title || '').trim(),
    contentHtml: String(f.contentHtml || ''),
    image: String(f.image || '') || undefined,
    pinned: !!f.pinned,
    published: !!f.published,
    popup: !!f.popup,
    popupUntil: String(f.popupUntil || '') || undefined,
    link: String(f.link || '').trim() || undefined,
    createdAt: existing?.createdAt || new Date().toISOString(),
  }
  await store.putJSON(`notices/${n.id}.json`, n)
  const idx = (await store.index<any>('notices')).filter((x: any) => x.id !== n.id)
  idx.unshift({ id: n.id, title: n.title, createdAt: n.createdAt, published: n.published, pinned: n.pinned, popup: n.popup, popupUntil: n.popupUntil })
  await store.setIndex('notices', idx)
  // 발행된 공지는 구글에 자동 색인 요청
  if (n.published) fireIndexNotify(c, `/notice/${n.id}`)
}

admin.post('/notices/new', async (c) => { await saveNotice(c); return c.redirect('/admin/notices') })
admin.post('/notices/:id', async (c) => {
  const store = new Store(c.env.R2)
  const existing = await store.getJSON<Notice>(`notices/${c.req.param('id')}.json`)
  await saveNotice(c, existing || undefined)
  return c.redirect('/admin/notices')
})
admin.post('/notices/:id/delete', async (c) => {
  const id = c.req.param('id')
  const store = new Store(c.env.R2)
  await store.delete(`notices/${id}.json`)
  await store.setIndex('notices', (await store.index<any>('notices')).filter((x: any) => x.id !== id))
  fireIndexNotify(c, `/notice/${id}`, 'URL_DELETED')
  return c.redirect('/admin/notices')
})
