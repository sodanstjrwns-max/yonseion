# 연세온치과의원 — 공식 웹사이트

## Project Overview
- **Name**: 연세온치과의원 (Yeonseon On Dental Clinic) 홈페이지
- **Goal**: "미소의 젊음을 켜는 치과" — 생체모방치의학 기반 페이션트 퍼널형 병원 웹사이트
- **Tagline**: 인지(SEO/AEO) → 신뢰(콘텐츠·의료진·케이스) → 전환(예약 상담) 퍼널 구조

## URLs
- **Production**: https://yonseion.kr ✅ 커스텀 도메인 라이브 (원장님 Cloudflare 계정)
- **Pages**: https://yeonseon-dental.pages.dev
- **Sandbox Dev**: https://3000-innan00lwvne2dmwc9mql-0e616f0a.sandbox.novita.ai
- **Admin**: `/admin` (비밀번호 = `ADMIN_PASSWORD` secret 으로 설정됨 — 기본값 무력화 완료)
- **Custom Domain**: `yonseion.kr` ✅ 연결 완료

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
| AEO | `/encyclopedia` `/encyclopedia/:slug` | 치과 백과사전 200용어 (직답형 + FAQPage·DefinedTerm·MedicalWebPage·Speakable) |
| 지역 SEO | `/area` `/area/:region-:treatment` | **19지역 × 4진료 = 76 랜딩** (지도임베드·hasMap·MedicalBusiness/Dentist+areaServed+openingHours·지역 인링크 메시). 부산 동래·금정·연제·부산진·해운대·수영·남·북·동구 + 양산·김해·울산 |
| 법적 | `/privacy` `/terms` | 개인정보처리방침 · 이용약관 |
| 시스템 | `/sitemap.xml`(인덱스 5분할) `/robots.txt` `/llms.txt` `/llms-full.txt` `/site.webmanifest` `404` | sitemap index + 5분할 / PWA manifest / robots(검색봇+AI크롤러 22종) / llms.txt(llmstxt.org 규격) + llms-full.txt(진료·의료진·FAQ 전문 평문) |

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

## SEO/AEO 점검 결과 (2026-06-14)
✅ **충족**: 캐노니컬·OG·Twitter Card 전 페이지 / JSON-LD 풀스택(Dentist·LocalBusiness·Person·MedicalProcedure·FAQPage·Breadcrumb·Article·City·WebSite·Speakable·DefinedTerm·MedicalWebPage·areaServed·hasMap) / H1 1개 규칙 / 이미지 alt 100% / robots+sitemap / 파비콘·OG이미지 / FAQ 100문항(진료당 20) / 백과사전 200용어 / 자동 인링크 / 회원·예약·케이스 퍼널
🔧 **이번 개선**:
1. sitemap `lastmod`(YYYY-MM-DD)·`changefreq` 추가 — 동적 콘텐츠는 실제 작성/수정일 반영
2. 폰트 `preload`(Pretendard·app.css) + preconnect crossorigin + FontAwesome 비동기 로드 → LCP/렌더차단 개선
3. `og:image:width/height/alt`, geo.region/position·ICBM·author·format-detection 메타 보강 (로컬 SEO)

## Deployment
- **Platform**: Cloudflare Pages (project: `yeonseon-dental`, 계정: sodanstjrwns@gmail.com)
- **Tech Stack**: Hono + TypeScript + Vite + R2 + D1 / 프론트: 순수 CSS 디자인시스템 + Lenis
- **Status**: ✅ **프로덕션 배포 완료** — https://yeonseon-dental.pages.dev
- **리소스**:
  - D1: `yeonseon-dental-production` (id `51924b34-d150-4acc-a947-d269e1d0d889`) — 마이그레이션 적용 완료
  - R2: `yeonseon-dental-bucket` — 예약·콘텐츠·이미지 저장
  - Secrets: `ADMIN_PASSWORD`, `SESSION_SECRET` 설정 완료 (암호화)
- **검증**: 홈/진료/예약/sitemap 200, 예약 API(R2 저장) 작동, 관리자 로그인 보안 확인
- **다음**: ① 사업자등록번호·비급여 수가 실데이터 ② Google Search Console / Naver Search Advisor 등록+사이트맵 제출 ③ 50대 여성 환자 케이스 처리 방향 확정

## 2026-06-17 업데이트 — 원장님 제공 자료 반영
- **구글 드라이브 자료 자동 수집**: 원장 인터뷰 문서 + 사진 50장 다운로드 → 웹용 최적화(508MB→5MB), `public/static/img/photos/`
- **실사진 적용**: 홈(리셉션 풀블리드 + 원장 프로필) / 의료진 페이지(스튜디오 프로필) / 미션 페이지(상담·디지털진단·루페진료 3컷 밴드 신규)
- **누끼 로고 확정**: 검은 배경 제거한 투명 로고(`logo-horizontal-color-t.png`) 헤더·푸터 적용, 파비콘/OG/터치아이콘 네이비+골드 재생성
- **원장 칼럼 5편 발행** (R2, Article+MedicalWebPage 스키마, 저자 E-E-A-T, 사이트맵 자동 포함):
  - 생체모방치의학 환자 오해 시리즈 3편 — `/column/biomimetic-myth-conservative-is-easy`, `/column/biomimetic-myth-overlay-is-not-a-crown-type`, `/column/biomimetic-myth-conservative-is-not-cheaper`
  - 인터뷰 기반 케이스 칼럼 2편 — `/column/all-on-x-전체임플란트-자신감` (무치악 All-on-X, 환자 동의 케이스), `/column/중장년-심미보철-앞니` (중장년 심미보철 CTG)
  - **케이스 칼럼은 동의받은 사례만 사용**, 미동의 케이스(50대 여성 무치악)는 익명·비식별 처리하거나 미사용 (원장님 확정 대기)
- **운영 채널 확인**: 인스타·유튜브·블로그·네이버플레이스·카카오톡 채널 모두 푸터 노출 (원장님 원문과 일치)
- **커스텀 도메인**: `yonseion.kr` 라이브 (구 `ysondent.com`/`연세온치과.com`은 신규 사이트로 대체 예정)
- **Last Updated**: 2026-06-17 (칼럼 5편 — 한글 케이스 2편 R2 검증 완료, `/column` 리스트 5편 정상 노출)

## 2026-06-21 업데이트 — 사이트 전체 SEO/AEO 슈퍼 업그레이드
- **robots.txt 강화**: 검색봇(Googlebot/Yeti/Daumoa/bingbot) + AI 크롤러 22종(GPTBot·OAI-SearchBot·ClaudeBot·anthropic-ai·PerplexityBot·Google-Extended·Applebot·Amazonbot·Bytespider·CCBot·cohere-ai·Meta-ExternalAgent 등) 명시 허용, 24h 캐시
- **llms.txt 재작성(llmstxt.org 규격)** + **llms-full.txt 신규**: 진료별 Q&A·의료진 자격·진료시간·내원지역을 LLM 인용용 평문으로 동적 생성(R2 칼럼 포함), 출처 표기 안내
- **지역 SEO 확장**: 13→**19지역**(수영·남·북·동구 + 울산 추가) × 4진료 = **76 랜딩**, `areaServed` 12개 행정구역, 지역 인덱스 그룹 갱신
- **로컬 스키마 강화**: 전역 `organizationSchema`에 **GeoCircle**(반경 25km 서비스권) + publicAccess/smokingAllowed, 지역 페이지 `areaServiceSchema`에 **openingHoursSpecification** + sameAs 추가
- **홈 FAQPage**: 검색 의도 높은 6문항 FAQ를 **스키마 + 화면 섹션 동시** 추가(가이드라인 일치), 아코디언 동작
- **검증**: 홈/지역/진료/의료진 JSON-LD 100% 유효 파싱, 전 페이지 200, JS 에러 0
- **Last Updated**: 2026-06-21 (SEO/AEO 슈퍼 업그레이드 배포 완료)

## 2026-06-21 업데이트 — 납품 품질 프리미엄 업그레이드
- **집중 진료 시그니처 카드**: 홈 '세 가지 중심 진료'를 텍스트 리스트 → 비주얼 카드(core-grid/core-feature)로 개편. 진료 이미지 3종 신규 생성(tx-esthetic-prosthetics/all-on-x/adhesive-restoration)으로 **이미지 404 버그 해결**, 호버 줌·번호 배지·태그 포함
- **신뢰 지표 띠(trust-band)**: 마퀴 하단에 네이비+골드 글로우 통계 밴드 추가 — **6개 과목 / 더블보더(보철·통합치의학과 전문의) / 도보 3분 / 12개 지역**, 스크롤 카운트업, 모바일 2×2 반응형
- **마이크로 인터랙션**: 버튼 그림자·골드 글로우·active 상태, `focus-visible` 접근성 아웃라인(키보드 내비), 이미지 페이드인(initImgFade)
- **성능/CLS**: lenis 스크립트 `defer`, 진료 이미지 `loading=lazy` + `width/height` 명시로 레이아웃 시프트 방지, 이미지 1200×900/62~120KB 압축
- **여백 정리**: 인덱스 페이지 상단 page-hero/breadcrumb 과도한 공백 축소
- **캐시버스팅**: ASSET_VER `20260619a` → `20260621a` (CSS/JS 변경 반영)
- **검증**: 전 페이지 200, JS 에러 0, 404 0, 데스크톱+모바일 풀페이지 스크린샷 확인
- **Last Updated**: 2026-06-21 (납품 프리미엄 업그레이드 배포 완료 — https://yonseion.kr)

## 2026-06-21 업데이트 — 3000만원급 프리미엄 전환·신뢰·디테일 업그레이드
### A. 전환(Conversion) 강화
- **A1 플로팅 상담 바**: 모바일 하단 고정 3버튼(전화·카카오 노랑·예약 골드) 원터치 상담. `initStickyCta()` 스마트 스크롤(아래로 내릴 때 숨김, 멈추면 0.7s 후 재등장), `body padding-bottom`으로 컨텐츠 가림 방지
- **A2 예약 폼 UX**: 상단 **3단계 퍼널 시각화**(신청서 작성→담당자 연락·일정 확정→내원·정밀 상담, 입력 진행 시 다음 단계 활성), **희망 시간대 칩**(평일 오전/오후·화 야간·토 오전, 다중 선택), 선택값을 `preferredDate`로 병합해 기존 API 무변경 호환
### B. 신뢰(Trust) 밀도 — '팬' 만들기
- **B3 환자 후기(Patient Voices)**: 골드 명조 카드 3종(상담·설명/진료 태도/사후 관리). **의료광고법 준수** — 치료효과 단정 대신 일반화 문구 + 면책 안내 + 실제 검증 후기는 네이버플레이스 링크로 유도. 호버 시 골드 상단 라인
- **B4 진료 여정(Patient Journey)**: 페이션트 퍼널 철학을 5단계(상담 접수→정밀 진단→치료 계획 설명→치료 진행→사후 관리)로 시각화. 골드 번호 원형+연결선, 진입 시 골드 펄스, 모바일 세로 타임라인
- **B5 Before/After 슬라이더**: 동의받은 실제 환자 전·후 사진 부재 + 의료광고법 리스크로 **보류**(initCompare 코드 유지, 원장님 동의 케이스 확보 시 즉시 적용 가능)
### C. 디테일 마감 — '비싼 티'
- **C6 마이크로 인터랙션 고도화**: voice-card 골드 라인 드로잉, journey-num 글로우 펄스, sticky-cta/버튼 active 눌림 피드백, 전역 `scroll-behavior:smooth` 폴백, 이미지 드래그 방지, `prefers-reduced-motion` 모두 존중
- **C7 OG·파비콘·소셜 카드 점검**: og-default.jpg **1200×630** 정상, favicon.svg/apple-touch-icon/site.webmanifest 정상, Twitter summary_large_image 완비 — **변경 불필요 확인**
- **C8 브랜드 404 페이지**: 골드 라인 "404"+"ON" 오버레이 마크, 명조 헤드라인("찾으시는 페이지를 켤 수 없습니다"), 홈/예약 골드 버튼, 진료안내·의료진·오시는 길·전화 퀵링크
- **검증**: 로컬+프로덕션(yonseion.kr) 전 기능 라이브 확인, 홈/예약 200·404 정상, JS 에러 0(의도된 404 리소스 제외), 모바일 플로팅바·예약 퍼널·404 스크린샷 확인
- **Last Updated**: 2026-06-21 (3000만원급 프리미엄 업그레이드 배포 완료 — commit 0e9d81f, https://yonseion.kr)
