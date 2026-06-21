// Cloudflare 바인딩 + 환경변수 타입
export type Bindings = {
  R2: R2Bucket
  DB: D1Database
  // Secrets
  ADMIN_PASSWORD?: string
  ADMIN_SESSION_SECRET?: string
  SESSION_SECRET?: string
  GOOGLE_CLIENT_ID?: string
  GOOGLE_CLIENT_SECRET?: string
  RESEND_API_KEY?: string
  NOTIFICATION_EMAIL?: string
  // 구글 Indexing API (콘텐츠 자동 색인)
  GOOGLE_INDEXING_CLIENT_EMAIL?: string
  GOOGLE_INDEXING_PRIVATE_KEY?: string
}
