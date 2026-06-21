// ============================================================
// 구글 Indexing API — 콘텐츠 발행 시 자동 색인 요청
// Cloudflare Workers(Web Crypto) 환경에서 서비스 계정 JWT 직접 서명
//
// 필요한 시크릿 (wrangler secret put):
//   GOOGLE_INDEXING_CLIENT_EMAIL  — 서비스 계정 이메일
//   GOOGLE_INDEXING_PRIVATE_KEY   — 서비스 계정 private_key (PEM, \n 포함)
//
// 시크릿이 없으면 조용히 skip → 색인 자동화는 비활성, 사이트 동작엔 영향 없음
// ============================================================

const SCOPE = 'https://www.googleapis.com/auth/indexing'
const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const INDEXING_URL = 'https://indexing.googleapis.com/v3/urlNotifications:publish'

// base64url 인코딩
function b64url(input: ArrayBuffer | string): string {
  let bytes: Uint8Array
  if (typeof input === 'string') {
    bytes = new TextEncoder().encode(input)
  } else {
    bytes = new Uint8Array(input)
  }
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// PEM(private_key) → CryptoKey (RS256 서명용)
async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const clean = pem
    .replace(/\\n/g, '\n')
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s+/g, '')
  const der = Uint8Array.from(atob(clean), (ch) => ch.charCodeAt(0))
  return crypto.subtle.importKey(
    'pkcs8',
    der.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  )
}

// 서비스 계정 JWT 생성 → OAuth2 access_token 발급
async function getAccessToken(clientEmail: string, privateKeyPem: string): Promise<string | null> {
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const claim = {
    iss: clientEmail,
    scope: SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  }
  const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claim))}`
  const key = await importPrivateKey(privateKeyPem)
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(signingInput))
  const jwt = `${signingInput}.${b64url(sig)}`

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })
  if (!res.ok) return null
  const data = (await res.json()) as { access_token?: string }
  return data.access_token || null
}

type IndexEnv = {
  GOOGLE_INDEXING_CLIENT_EMAIL?: string
  GOOGLE_INDEXING_PRIVATE_KEY?: string
}

/**
 * 구글에 URL 색인(또는 갱신) 알림을 보냅니다.
 * @param env   Cloudflare 바인딩 (시크릿 포함)
 * @param url   색인 요청할 절대 URL (예: https://yonseion.kr/column/abc)
 * @param type  'URL_UPDATED'(발행/수정) | 'URL_DELETED'(삭제)
 * @returns     { ok, status, skipped?, error? }
 */
export async function notifyGoogleIndex(
  env: IndexEnv,
  url: string,
  type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED',
): Promise<{ ok: boolean; status?: number; skipped?: boolean; error?: string }> {
  const clientEmail = env.GOOGLE_INDEXING_CLIENT_EMAIL
  const privateKey = env.GOOGLE_INDEXING_PRIVATE_KEY
  // 시크릿 미설정 시 조용히 skip
  if (!clientEmail || !privateKey) return { ok: false, skipped: true }

  try {
    const token = await getAccessToken(clientEmail, privateKey)
    if (!token) return { ok: false, error: 'token_failed' }

    const res = await fetch(INDEXING_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, type }),
    })
    return { ok: res.ok, status: res.status }
  } catch (e: any) {
    return { ok: false, error: String(e?.message || e) }
  }
}

/**
 * 발행 핸들러에서 호출 — 색인 요청을 비동기로 던지고 에러는 무시(발행 흐름 방해 X).
 * Cloudflare Workers의 waitUntil이 있으면 그걸로, 없으면 fire-and-forget.
 */
export function fireIndexNotify(c: any, path: string, type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED') {
  try {
    const base = 'https://yonseion.kr'
    const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? '' : '/'}${path}`
    const p = notifyGoogleIndex(c.env, url, type).catch(() => {})
    // 응답을 막지 않도록 백그라운드 처리
    if (c.executionCtx && typeof c.executionCtx.waitUntil === 'function') {
      c.executionCtx.waitUntil(p)
    }
  } catch {
    /* noop */
  }
}
