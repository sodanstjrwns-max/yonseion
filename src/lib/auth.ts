// ============================================================================
// HMAC 서명 세션 토큰 (Web Crypto API — Workers 호환) + 쿠키 헬퍼
// ============================================================================
import type { Context } from 'hono'
import { setCookie, getCookie, deleteCookie } from 'hono/cookie'

const enc = new TextEncoder()

function b64url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function b64urlDecode(s: string): Uint8Array {
  s = s.replace(/-/g, '+').replace(/_/g, '/')
  while (s.length % 4) s += '='
  const bin = atob(s)
  return Uint8Array.from(bin, (c) => c.charCodeAt(0))
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'])
}

export interface SessionPayload {
  sub: string          // user email or 'admin'
  role: 'admin' | 'member'
  name?: string
  exp: number          // unix seconds
}

export async function signSession(payload: SessionPayload, secret: string): Promise<string> {
  const body = b64url(enc.encode(JSON.stringify(payload)).buffer as ArrayBuffer)
  const key = await hmacKey(secret)
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(body))
  return `${body}.${b64url(sig)}`
}

export async function verifySession(token: string, secret: string): Promise<SessionPayload | null> {
  const [body, sig] = token.split('.')
  if (!body || !sig) return null
  const key = await hmacKey(secret)
  const ok = await crypto.subtle.verify('HMAC', key, b64urlDecode(sig), enc.encode(body))
  if (!ok) return null
  try {
    const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(body))) as SessionPayload
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch { return null }
}

// --- 비밀번호 해시 (회원) ---
export async function hashPassword(pw: string, salt?: string): Promise<string> {
  const s = salt || b64url(crypto.getRandomValues(new Uint8Array(16)).buffer as ArrayBuffer)
  const data = enc.encode(s + ':' + pw)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return `${s}$${b64url(digest)}`
}
export async function verifyPassword(pw: string, stored: string): Promise<boolean> {
  const [salt] = stored.split('$')
  if (!salt) return false
  const recomputed = await hashPassword(pw, salt)
  return recomputed === stored
}

// --- 쿠키 세션 ---
const MEMBER_COOKIE = 'ys_session'
const ADMIN_COOKIE = 'ys_admin'

export async function setSessionCookie(c: Context, payload: SessionPayload, secret: string) {
  const token = await signSession(payload, secret)
  const cookieName = payload.role === 'admin' ? ADMIN_COOKIE : MEMBER_COOKIE
  const maxAge = payload.role === 'admin' ? 60 * 60 * 24 : 60 * 60 * 24 * 30
  setCookie(c, cookieName, token, {
    httpOnly: true, secure: true, sameSite: 'Lax', path: '/', maxAge,
  })
}

export async function getSession(c: Context, secret: string, role: 'admin' | 'member' = 'member'): Promise<SessionPayload | null> {
  const cookieName = role === 'admin' ? ADMIN_COOKIE : MEMBER_COOKIE
  const token = getCookie(c, cookieName)
  if (!token) return null
  return await verifySession(token, secret)
}

export function clearSession(c: Context, role: 'admin' | 'member' = 'member') {
  deleteCookie(c, role === 'admin' ? ADMIN_COOKIE : MEMBER_COOKIE, { path: '/' })
}

// 개발용 기본 시크릿 (배포 시 wrangler secret 으로 교체)
export function sessionSecret(env: { ADMIN_SESSION_SECRET?: string; SESSION_SECRET?: string }): string {
  return env.SESSION_SECRET || env.ADMIN_SESSION_SECRET || 'yeonseon-dev-secret-change-in-production-2026'
}
export function adminPassword(env: { ADMIN_PASSWORD?: string }): string {
  return env.ADMIN_PASSWORD || 'yeonseon2026!' // 배포 시 반드시 secret 으로 교체
}

// 봇 판별 (조회수 실측용)
export function isBot(ua: string): boolean {
  return /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|gptbot|claudebot|perplexity|googlebot|yeti|daum/i.test(ua || '')
}
