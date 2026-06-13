// ============================================================================
// 회원 — 가입(개인정보활용동의·마케팅수신동의 / 이메일+전화) / 로그인 / 로그아웃
// 저장: R2 users/<email>.json + users/_index.json
// ============================================================================
import { Hono } from 'hono'
import { html, raw } from 'hono/html'
import type { Bindings } from '../lib/bindings'
import { Store } from '../lib/store'
import {
  getSession, setSessionCookie, clearSession, sessionSecret,
  hashPassword, verifyPassword,
} from '../lib/auth'
import type { User } from '../data/types'
import { Layout } from '../components/layout'
import { clinic } from '../data/clinic'

export const member = new Hono<{ Bindings: Bindings }>()

// ---------- 공통 폼 셸 ----------
function authShell(opts: { title: string; eyebrow: string; lead: string; formHtml: string; path: string; error?: string; notice?: string }) {
  const body = html`
  <section class="page-hero">
    <div class="container">
      <p class="eyebrow">${opts.eyebrow}</p>
      <h1 style="font-size:var(--t-h2)">${opts.title}</h1>
      <p class="lead">${opts.lead}</p>
    </div>
  </section>
  <section class="section--tight">
    <div class="container" style="max-width:560px">
      ${raw(opts.error ? `<div role="alert" style="background:#FBEDEA;border:1px solid #E5B8AE;color:#8C3A2B;border-radius:4px;padding:.9rem 1.1rem;margin-bottom:1.4rem;font-size:.9rem"><i class="fas fa-circle-exclamation" style="margin-right:.5rem"></i>${opts.error}</div>` : '')}
      ${raw(opts.notice ? `<div role="status" style="background:#EFF5EE;border:1px solid #BCD4BA;color:#2E5E3A;border-radius:4px;padding:.9rem 1.1rem;margin-bottom:1.4rem;font-size:.9rem"><i class="fas fa-circle-check" style="margin-right:.5rem"></i>${opts.notice}</div>` : '')}
      ${raw(opts.formHtml)}
    </div>
  </section>`
  return Layout({
    title: `${opts.title} | ${clinic.nameKo}`,
    description: `${clinic.nameKo} ${opts.title} — 치료 전후 사진 열람 등 회원 전용 콘텐츠를 이용하실 수 있습니다.`,
    path: opts.path,
  }, body)
}

const fieldCss = `style="margin-bottom:1.1rem"`
const inputCss = `style="width:100%;padding:.85rem 1rem;border:1px solid var(--line);border-radius:4px;font:inherit;background:#fff;color:var(--ink)"`
const labelCss = `style="display:block;font-size:.82rem;font-weight:600;letter-spacing:.02em;margin-bottom:.4rem;color:var(--ink)"`

// ---------- 회원가입 ----------
function signupForm(v: Record<string, string> = {}) {
  return `
  <form method="POST" action="/signup" class="auth-form" style="background:#fff;border:1px solid var(--line);border-radius:6px;padding:2.2rem">
    <div ${fieldCss}><label ${labelCss} for="su-name">이름 *</label>
      <input ${inputCss} id="su-name" name="name" required maxlength="30" value="${v.name || ''}" autocomplete="name"></div>
    <div ${fieldCss}><label ${labelCss} for="su-email">이메일 *</label>
      <input ${inputCss} id="su-email" name="email" type="email" required maxlength="80" value="${v.email || ''}" autocomplete="email" placeholder="example@email.com"></div>
    <div ${fieldCss}><label ${labelCss} for="su-phone">휴대전화 *</label>
      <input ${inputCss} id="su-phone" name="phone" type="tel" required pattern="[\\d\\-+() ]{8,20}" maxlength="20" value="${v.phone || ''}" autocomplete="tel" placeholder="010-0000-0000"></div>
    <div ${fieldCss}><label ${labelCss} for="su-pw">비밀번호 * <small style="font-weight:400;color:var(--mist)">(8자 이상)</small></label>
      <input ${inputCss} id="su-pw" name="password" type="password" required minlength="8" maxlength="64" autocomplete="new-password"></div>

    <div style="border:1px solid var(--line);border-radius:4px;padding:1.1rem 1.2rem;margin:1.6rem 0 1.2rem;background:var(--paper)">
      <label style="display:flex;gap:.6rem;align-items:flex-start;font-size:.88rem;cursor:pointer;margin-bottom:.7rem">
        <input type="checkbox" name="agreePrivacy" required style="margin-top:.25rem">
        <span><strong>[필수]</strong> 개인정보 수집·이용에 동의합니다.
          <a href="/privacy" target="_blank" style="color:var(--gold-2);text-decoration:underline">자세히 보기</a><br>
          <small style="color:var(--mist)">수집 항목: 이름·이메일·휴대전화 / 이용 목적: 회원제 콘텐츠 제공, 예약 상담 / 보유 기간: 회원 탈퇴 시까지</small></span>
      </label>
      <label style="display:flex;gap:.6rem;align-items:flex-start;font-size:.88rem;cursor:pointer">
        <input type="checkbox" name="agreeMarketing" style="margin-top:.25rem">
        <span><strong>[선택]</strong> 마케팅 정보 수신에 동의합니다.<br>
          <small style="color:var(--mist)">진료 안내·이벤트 소식을 이메일·문자로 받아보실 수 있으며, 언제든 철회할 수 있습니다.</small></span>
      </label>
    </div>

    <button class="btn-primary" style="width:100%;justify-content:center">회원가입 <i class="fas fa-arrow-right"></i></button>
    <p style="text-align:center;font-size:.85rem;margin-top:1.2rem;color:var(--mist)">이미 회원이신가요? <a href="/login" style="color:var(--gold-2);text-decoration:underline">로그인</a></p>
  </form>`
}

member.get('/signup', async (c) => {
  const sess = await getSession(c, sessionSecret(c.env), 'member')
  if (sess) return c.redirect('/')
  return c.html(authShell({
    title: '회원가입', eyebrow: 'Membership', path: '/signup',
    lead: '회원이 되시면 치료 전후 사진 등 회원 전용 콘텐츠를 열람하실 수 있습니다.',
    formHtml: signupForm(),
    error: c.req.query('error') || undefined,
  }))
})

member.post('/signup', async (c) => {
  const f = await c.req.parseBody()
  const name = String(f.name || '').trim().slice(0, 30)
  const email = String(f.email || '').trim().toLowerCase().slice(0, 80)
  const phone = String(f.phone || '').trim().slice(0, 20)
  const password = String(f.password || '')
  const agreePrivacy = !!f.agreePrivacy
  const agreeMarketing = !!f.agreeMarketing

  const fail = (msg: string) => c.html(authShell({
    title: '회원가입', eyebrow: 'Membership', path: '/signup',
    lead: '회원이 되시면 치료 전후 사진 등 회원 전용 콘텐츠를 열람하실 수 있습니다.',
    formHtml: signupForm({ name, email, phone }), error: msg,
  }), 400)

  if (!name || !email || !phone || !password) return fail('모든 필수 항목을 입력해 주세요.')
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail('이메일 형식을 확인해 주세요.')
  if (!/^[\d\-+() ]{8,20}$/.test(phone)) return fail('휴대전화 형식을 확인해 주세요.')
  if (password.length < 8) return fail('비밀번호는 8자 이상이어야 합니다.')
  if (!agreePrivacy) return fail('개인정보 수집·이용 동의(필수)가 필요합니다.')

  const store = new Store(c.env.R2)
  const key = `users/${encodeURIComponent(email)}.json`
  if (await store.getJSON<User>(key)) return fail('이미 가입된 이메일입니다. 로그인해 주세요.')

  const user: User = {
    email, name, phone,
    passwordHash: await hashPassword(password),
    agreePrivacy, agreeMarketing,
    provider: 'local',
    createdAt: new Date().toISOString(),
  }
  await store.putJSON(key, user)
  const idx = (await store.index<{ email: string }>('users')).filter((x) => x.email !== email)
  idx.unshift({ email, name, phone, agreeMarketing, createdAt: user.createdAt } as any)
  await store.setIndex('users', idx.slice(0, 5000))

  await setSessionCookie(c, { sub: email, role: 'member', name, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 }, sessionSecret(c.env))
  const back = String(f.back || c.req.query('back') || '/')
  return c.redirect(back.startsWith('/') ? back : '/')
})

// ---------- 로그인 ----------
function loginForm(back = '/') {
  return `
  <form method="POST" action="/login" class="auth-form" style="background:#fff;border:1px solid var(--line);border-radius:6px;padding:2.2rem">
    <input type="hidden" name="back" value="${back}">
    <div ${fieldCss}><label ${labelCss} for="li-email">이메일</label>
      <input ${inputCss} id="li-email" name="email" type="email" required autocomplete="email"></div>
    <div ${fieldCss}><label ${labelCss} for="li-pw">비밀번호</label>
      <input ${inputCss} id="li-pw" name="password" type="password" required autocomplete="current-password"></div>
    <button class="btn-primary" style="width:100%;justify-content:center;margin-top:.6rem">로그인 <i class="fas fa-arrow-right"></i></button>
    <p style="text-align:center;font-size:.85rem;margin-top:1.2rem;color:var(--mist)">아직 회원이 아니신가요? <a href="/signup" style="color:var(--gold-2);text-decoration:underline">회원가입</a></p>
  </form>`
}

member.get('/login', async (c) => {
  const sess = await getSession(c, sessionSecret(c.env), 'member')
  if (sess) return c.redirect('/')
  const back = c.req.query('back') || '/'
  return c.html(authShell({
    title: '로그인', eyebrow: 'Membership', path: '/login',
    lead: '회원 전용 콘텐츠 열람을 위해 로그인해 주세요.',
    formHtml: loginForm(back.startsWith('/') ? back : '/'),
    notice: c.req.query('joined') ? '가입이 완료되었습니다. 로그인해 주세요.' : undefined,
  }))
})

member.post('/login', async (c) => {
  const f = await c.req.parseBody()
  const email = String(f.email || '').trim().toLowerCase()
  const password = String(f.password || '')
  const back = String(f.back || '/')

  const store = new Store(c.env.R2)
  const user = await store.getJSON<User>(`users/${encodeURIComponent(email)}.json`)
  const ok = user && await verifyPassword(password, user.passwordHash)
  if (!ok) {
    return c.html(authShell({
      title: '로그인', eyebrow: 'Membership', path: '/login',
      lead: '회원 전용 콘텐츠 열람을 위해 로그인해 주세요.',
      formHtml: loginForm(back.startsWith('/') ? back : '/'),
      error: '이메일 또는 비밀번호가 올바르지 않습니다.',
    }), 401)
  }
  await setSessionCookie(c, { sub: email, role: 'member', name: user!.name, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 }, sessionSecret(c.env))
  return c.redirect(back.startsWith('/') ? back : '/')
})

// ---------- 로그아웃 ----------
member.get('/logout', (c) => {
  clearSession(c, 'member')
  const back = c.req.query('back') || '/'
  return c.redirect(back.startsWith('/') ? back : '/')
})
