// ============================================================================
// 관리자 — 로그인 / 대시보드 / 예약 관리 / 케이스·칼럼·공지 작성 / 이미지 업로드
// ============================================================================
import { Hono } from 'hono'
import { html, raw } from 'hono/html'
import type { Bindings } from '../lib/bindings'
import { Store, newId, slugify } from '../lib/store'
import {
  getSession, setSessionCookie, clearSession, sessionSecret, adminPassword,
} from '../lib/auth'
import type { CaseItem, Column, Notice, Reservation } from '../data/types'
import { treatments } from '../data/treatments'
import { doctors } from '../data/doctors'
import { clinic } from '../data/clinic'

export const admin = new Hono<{ Bindings: Bindings }>()

// ---------- 공통 셸 ----------
function shell(title: string, body: string, active = '') {
  const nav = [
    ['/admin', '대시보드', 'gauge'],
    ['/admin/reservations', '예약 관리', 'calendar-check'],
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
.stat{background:#fff;border:1px solid var(--line);border-radius:10px;padding:1.3rem}
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
  const [rsvIdx, caseIdx, colIdx, ntcIdx] = await Promise.all([
    store.index<{ id: string }>('reservations'),
    store.index<{ id: string }>('cases'),
    store.index<{ id: string }>('columns'),
    store.index<{ id: string }>('notices'),
  ])
  let newCount = 0
  try {
    const row = await c.env.DB.prepare("SELECT COUNT(*) AS n FROM reservation_index WHERE status = 'new'").first<{ n: number }>()
    newCount = row?.n || 0
  } catch { /* noop */ }

  const body = `
  <h1>대시보드</h1>
  <div class="cards">
    <div class="stat"><div class="n">${rsvIdx.length}</div><div class="l">누적 예약 신청${newCount ? ` · 신규 ${newCount}건` : ''}</div></div>
    <div class="stat"><div class="n">${caseIdx.length}</div><div class="l">케이스</div></div>
    <div class="stat"><div class="n">${colIdx.length}</div><div class="l">칼럼</div></div>
    <div class="stat"><div class="n">${ntcIdx.length}</div><div class="l">공지</div></div>
  </div>
  <div class="panel">
    <strong>빠른 작업</strong>
    <div style="display:flex;gap:.7rem;margin-top:1rem;flex-wrap:wrap">
      <a class="btn" href="/admin/cases/new"><i class="fas fa-plus"></i> 케이스 등록</a>
      <a class="btn" href="/admin/columns/new"><i class="fas fa-plus"></i> 칼럼 작성</a>
      <a class="btn" href="/admin/notices/new"><i class="fas fa-plus"></i> 공지 작성</a>
      <a class="btn ghost" href="/admin/reservations"><i class="fas fa-calendar-check"></i> 예약 확인</a>
    </div>
  </div>
  <p class="muted">병원 기본정보(전화·주소·진료시간)는 <code>src/data/clinic.ts</code> 한 파일에서 관리됩니다.</p>`
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
</script>`

// ============================================================================
// 케이스 관리
// ============================================================================
admin.get('/cases', async (c) => {
  const store = new Store(c.env.R2)
  const idx = await store.index<{ id: string; title: string; createdAt: string; published: boolean }>('cases')
  const body = `
  <div class="toolbar"><h1 style="margin:0">케이스 관리</h1><a class="btn" href="/admin/cases/new"><i class="fas fa-plus"></i> 새 케이스</a></div>
  ${idx.length ? `<table><thead><tr><th>제목</th><th>등록일</th><th>상태</th><th></th></tr></thead><tbody>
    ${idx.map((x) => `<tr><td>${x.title}</td><td class="muted">${(x.createdAt || '').slice(0, 10)}</td>
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
    <label>지역 라벨</label><input name="regionLabel" value="${cs?.regionLabel || ''}" placeholder="부산 동래구 온천동">
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
  await store.delete(`cases/${id}.json`)
  await store.setIndex('cases', (await store.index<any>('cases')).filter((x: any) => x.id !== id))
  return c.redirect('/admin/cases')
})

// ============================================================================
// 칼럼 관리
// ============================================================================
admin.get('/columns', async (c) => {
  const store = new Store(c.env.R2)
  const idx = await store.index<{ id: string; title: string; createdAt: string; published: boolean }>('columns')
  const body = `
  <div class="toolbar"><h1 style="margin:0">칼럼 관리</h1><a class="btn" href="/admin/columns/new"><i class="fas fa-plus"></i> 새 칼럼</a></div>
  ${idx.length ? `<table><thead><tr><th>제목</th><th>작성일</th><th>상태</th><th></th></tr></thead><tbody>
    ${idx.map((x) => `<tr><td>${x.title}</td><td class="muted">${(x.createdAt || '').slice(0, 10)}</td>
      <td>${x.published ? '<span class="badge confirmed">게시</span>' : '<span class="badge">비공개</span>'}</td>
      <td><a class="btn sm ghost" href="/admin/columns/${x.id}">수정</a>
      <form method="POST" action="/admin/columns/${x.id}/delete" style="display:inline" onsubmit="return confirm('삭제할까요?')"><button class="btn sm danger">삭제</button></form></td></tr>`).join('')}
  </tbody></table>` : '<div class="panel">작성된 칼럼이 없습니다.</div>'}`
  return c.html(shell('칼럼', body, '/admin/columns'))
})

function columnForm(col?: Column) {
  const docOpts = doctors.map((d) => `<option value="${d.slug}" ${col?.authorSlug === d.slug ? 'selected' : ''}>${d.name} ${d.role}</option>`).join('')
  const txOpts = treatments.map((t) => `<option value="${t.slug}" ${col?.relatedTreatments?.includes(t.slug) ? 'selected' : ''}>${t.name}</option>`).join('')
  return `
  <form class="panel" method="POST">
    <label>제목 *</label><input name="title" required value="${col?.title || ''}">
    <label>요약 (목록·메타 설명) *</label><input name="excerpt" required value="${col?.excerpt || ''}" maxlength="160">
    <label>본문 HTML * <small class="muted">(h2/h3/p/ul 태그 사용 — SEO 구조 유지)</small></label>
    <textarea name="contentHtml" required style="min-height:320px;font-family:monospace;font-size:.85rem">${col?.contentHtml || '<h2>소제목</h2>\n<p>본문…</p>'}</textarea>
    <div class="row2">
      <div><label>작성 원장</label><select name="authorSlug">${docOpts}</select></div>
      <div><label>관련 진료 (다중 선택)</label><select name="relatedTreatments" multiple size="4">${txOpts}</select></div>
    </div>
    <label>대표 이미지</label>
    <input type="text" id="thumbnail" name="thumbnail" value="${col?.thumbnail || ''}" placeholder="/api/images/...">
    <input type="file" accept="image/*" onchange="upload(this,'thumbnail')" style="margin-top:.3rem"><small class="muted"></small>
    <div class="row2">
      <div><label>메타 타이틀 (선택)</label><input name="metaTitle" value="${col?.metaTitle || ''}"></div>
      <div><label>메타 설명 (선택)</label><input name="metaDescription" value="${col?.metaDescription || ''}"></div>
    </div>
    <label><input type="checkbox" name="published" style="width:auto;margin-right:.5rem" ${col?.published !== false ? 'checked' : ''}>게시</label>
    <button class="btn" style="margin-top:1.2rem"><i class="fas fa-floppy-disk"></i> 저장</button>
  </form>${uploadScript}`
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
  await store.delete(`columns/${id}.json`)
  await store.setIndex('columns', (await store.index<any>('columns')).filter((x: any) => x.id !== id))
  return c.redirect('/admin/columns')
})

// ============================================================================
// 공지 관리
// ============================================================================
admin.get('/notices', async (c) => {
  const store = new Store(c.env.R2)
  const idx = await store.index<{ id: string; title: string; createdAt: string; published: boolean; pinned?: boolean }>('notices')
  const body = `
  <div class="toolbar"><h1 style="margin:0">공지 관리</h1><a class="btn" href="/admin/notices/new"><i class="fas fa-plus"></i> 새 공지</a></div>
  ${idx.length ? `<table><thead><tr><th>제목</th><th>작성일</th><th>상태</th><th></th></tr></thead><tbody>
    ${idx.map((x) => `<tr><td>${x.pinned ? '📌 ' : ''}${x.title}</td><td class="muted">${(x.createdAt || '').slice(0, 10)}</td>
      <td>${x.published ? '<span class="badge confirmed">게시</span>' : '<span class="badge">비공개</span>'}</td>
      <td><a class="btn sm ghost" href="/admin/notices/${x.id}">수정</a>
      <form method="POST" action="/admin/notices/${x.id}/delete" style="display:inline" onsubmit="return confirm('삭제할까요?')"><button class="btn sm danger">삭제</button></form></td></tr>`).join('')}
  </tbody></table>` : '<div class="panel">작성된 공지가 없습니다.</div>'}`
  return c.html(shell('공지', body, '/admin/notices'))
})

function noticeForm(n?: Notice) {
  return `
  <form class="panel" method="POST">
    <label>제목 *</label><input name="title" required value="${n?.title || ''}">
    <label>본문 HTML *</label>
    <textarea name="contentHtml" required style="min-height:220px">${n?.contentHtml || '<p>내용…</p>'}</textarea>
    <label>이미지 (선택)</label>
    <input type="text" id="image" name="image" value="${n?.image || ''}" placeholder="/api/images/...">
    <input type="file" accept="image/*" onchange="upload(this,'image')" style="margin-top:.3rem"><small class="muted"></small>
    <label><input type="checkbox" name="pinned" style="width:auto;margin-right:.5rem" ${n?.pinned ? 'checked' : ''}>상단 고정 (대표 공지)</label>
    <label><input type="checkbox" name="published" style="width:auto;margin-right:.5rem" ${n?.published !== false ? 'checked' : ''}>게시</label>
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
    createdAt: existing?.createdAt || new Date().toISOString(),
  }
  await store.putJSON(`notices/${n.id}.json`, n)
  const idx = (await store.index<any>('notices')).filter((x: any) => x.id !== n.id)
  idx.unshift({ id: n.id, title: n.title, createdAt: n.createdAt, published: n.published, pinned: n.pinned })
  await store.setIndex('notices', idx)
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
  return c.redirect('/admin/notices')
})
