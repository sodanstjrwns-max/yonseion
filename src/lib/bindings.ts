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
}
