# 연세온치과의원 — 공식 웹사이트

## Project Overview
- **Name**: 연세온치과의원 (Yeonseon On Dental Clinic) 홈페이지
- **Goal**: "미소의 젊음을 켜는 치과" — 생체모방치의학 기반 페이션트 퍼널형 병원 웹사이트
- **Tagline**: 인지(SEO/AEO) → 신뢰(콘텐츠·의료진·케이스) → 전환(예약 상담) 퍼널 구조

## URLs
- **Sandbox Dev**: https://3000-innan00lwvne2dmwc9mql-0e616f0a.sandbox.novita.ai
- **Production**: (Cloudflare Pages 배포 시 갱신)
- **Admin**: `/admin` (기본 비밀번호 `yeonseon2026!` — 배포 시 `ADMIN_PASSWORD` secret 으로 교체 필수)

## 완성된 기능
### 공개 페이지 (66 URL, sitemap 자동 생성)
| 분류 | 경로 | 설명 |
|---|---|---|
| 홈 | `/` | 초미니멀 에디토리얼 홈 (키네틱 타이포 + 핵심 진료 + CTA) |
| 브랜드 | `/mission` `/biomimetic` | 병원 미션 · 생체모방치의학 |
| 진료 | `/treatments` `/treatments/:slug` | 6개 진료 (핵심 TOP3 상세) |
| 의료진 | `/doctors` `/doctors/:slug` | E-E-A-T 의료진 소개 + Person 스키마 |
| **예약** | `/reservation` | 예약 상담 폼 → `POST /api/reservations` (R2 + D1 저장) |
| 신뢰 | `/faq` `/pricing` `/directions` | FAQ 28건(FAQPage 스키마) · 비급여 고지 · 지도 3종 연동 |
| 콘텐츠 | `/cases/gallery` `/cases/:slug` | 비포/애프터 (드래그 비교 슬라이더, 의료법 §56 고지) |
| 콘텐츠 | `/column` `/column/:slug` | 원장 칼럼 (Article 스키마, 작성자 E-E-A-T) |
| 콘텐츠 | `/notice` `/notice/:id` `/video` | 공지 · 영상 |
| AEO | `/encyclopedia` `/encyclopedia/:slug` | 치과 백과사전 13용어 (직답형 + Speakable) |
| 지역 SEO | `/area` `/area/:region-:treatment` | 8지역 × 4진료 = 32 랜딩 페이지 |
| 법적 | `/privacy` `/terms` | 개인정보처리방침 · 이용약관 |
| 시스템 | `/sitemap.xml` `/robots.txt` `404` | 동적 sitemap (R2 콘텐츠 포함) |

### 관리자 (`/admin` — 쿠키 세션 HMAC 서명)
- 대시보드(통계) · 예약 관리(상태 변경: 신규→확정→완료/취소)
- 케이스/칼럼/공지 작성·수정·삭제 + R2 이미지 업로드 (8MB 제한)
- 케이스 등록 시 의료법 §56 환자동의 체크 강제

### API
- `POST /api/reservations` — 예약 접수 (검증 + R2 주저장 + D1 인덱스)
- `POST|GET /api/views/:type/:id` — 조회수 집계 (봇 UA 제외 실측)
- `GET /api/images/:key` — R2 이미지 서빙 (1일 캐시)

## Data Architecture
- **Storage**: Cloudflare R2 (JSON 문서 + 이미지) + D1 (page_views, reservation_index)
- **R2 키 구조**: `reservations/<id>.json`, `cases|columns|notices/<id>.json` + `_index.json`, `images/<key>`
- **정적 SoT**: `src/data/clinic.ts` 한 파일에서 병원 정보 전체 관리
- **마이그레이션**: `migrations/0001_initial.sql`

## 미구현 / 다음 단계
1. **실사진 교체** — 현재 `.ph` 플레이스홀더 (병원·원장 사진 제공 시 교체)
2. **사업자등록번호 / SNS URL / 정밀 좌표** — `src/data/clinic.ts` 교체
3. **비급여 실제 금액** — `src/data/pricing.ts` (현재 '내원 상담 시 안내')
4. **Cloudflare Pages 프로덕션 배포** — D1/R2 실리소스 생성 + `ADMIN_PASSWORD`·`SESSION_SECRET` secret 설정
5. (선택) 예약 접수 이메일 알림 (Resend), 회원 기능, 네이버/카카오 지도 API 키 연동

## 로컬 개발
```bash
npm run build
pm2 start ecosystem.config.cjs   # wrangler pages dev (--local, wrangler.jsonc 바인딩 자동)
curl http://localhost:3000
```
※ 참고: 글로벌 wrangler 바이너리 호환성 문제로 `--d1=` CLI 플래그 대신 `wrangler.jsonc` 바인딩을 사용. 로컬 D1 스키마는 `npx wrangler d1 migrations apply yeonseon-dental-production --local` 적용.

## Deployment
- **Platform**: Cloudflare Pages (project: `yeonseon-dental`)
- **Tech Stack**: Hono + TypeScript + Vite + R2 + D1 / 프론트: 순수 CSS 디자인시스템 + Lenis
- **Status**: ✅ 샌드박스 가동 중 / 프로덕션 미배포
- **Last Updated**: 2026-06-12
