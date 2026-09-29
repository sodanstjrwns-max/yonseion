// ============================================================================
// 콘텐츠 최종 검토일 — 고정값 (단일 출처)
// MedicalWebPage.lastReviewed 와 화면 감수 줄('최종 검토 YYYY-MM-DD')이 모두 이 값을 쓴다.
// "오늘 날짜" 자동 생성 금지 — 해당 콘텐츠를 실제로 고친 날에만 갱신한다.
// (값 = 해당 데이터 파일의 실제 최종 콘텐츠 수정 커밋 날짜)
// ============================================================================
export const CONTENT_DATES = {
  /** 진료 상세 — src/data/treatments.ts (5740135 공식 케이스 사진 반영) */
  treatments: '2026-06-27',
  /** 백과사전 심층 해설 200개 — src/data/encyclopedia.ts (945614a) */
  encyclopedia: '2026-06-14',
  /** 백과사전 경량 용어 — src/data/glossary.ts 정의 본문 (bfaf02f, 이후 커밋은 중복 slug 301 정리만) */
  glossary: '2026-06-13',
} as const

// ============================================================================
// 사이트맵 lastmod 용 페이지별 콘텐츠 수정일 (2026-09-29 산출, 같은 원칙)
// 값 = 해당 페이지 본문/데이터를 실제로 고친 커밋 날짜 — WebP 전환·스키마·레이아웃·버그 수정 커밋은 제외.
// 동적 콘텐츠(칼럼·케이스·공지·수가 R2)는 R2 의 updatedAt/createdAt 을 쓰고, 여기 값은 폴백.
// ============================================================================
export const PAGE_DATES = {
  /** 홈 — src/pages/home.tsx 콘텐츠 확충 (75ea339) */
  home: '2026-09-04',
  /** 미션 — 원장님 수정요청 반영 (d03f279) */
  mission: '2026-06-24',
  /** 생체모방치의학 — 원장님 수정요청 반영 (d03f279) */
  biomimetic: '2026-06-24',
  /** 의료진 — src/data/doctors.ts (d03f279) */
  doctors: '2026-06-24',
  /** 예약 — 진료시간 변경 (7b06c4d) */
  reservation: '2026-07-01',
  /** 오시는 길 — clinic.ts 진료시간 변경 (7b06c4d) */
  directions: '2026-07-01',
  /** 자주 묻는 질문 — src/data/faqs.ts (6c90696) */
  faq: '2026-06-13',
  /** 비용 안내 기본값 — src/data/pricing.ts 수가 갱신 (c45b2b5). R2 저장본이 있으면 그 updatedAt */
  pricing: '2026-07-09',
  /** 지역 안내 데이터 — src/data/facilities.ts (ce41fbd). 지역 페이지는 진료·의료진·FAQ 데이터도 쓰므로 최댓값 사용 */
  area: '2026-06-21',
} as const

/** YYYY-MM-DD 목록 중 가장 최근 날짜 (없으면 '') */
export function latestDate(...dates: (string | undefined | null)[]): string {
  return dates
    .map((d) => (d || '').slice(0, 10))
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
    .sort()
    .pop() || ''
}
