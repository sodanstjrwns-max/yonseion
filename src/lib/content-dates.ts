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
  /** 백과사전 용어 보강본 — src/data/encyclopedia-enrich/* (얇은 용어 본문·FAQ 보강, 2026-10-08) */
  encyclopediaEnrich: '2026-10-08',
} as const

/**
 * 리치 해설(encyclopedia.ts) 중 최초 13용어 커밋(0476bfe, 2026-06-12) 이후 본문을 고치지 않은 항목.
 * 나머지 리치 해설은 945614a(2026-06-14). git blame 기준 (2026-10-08 산출).
 */
const ENCYCLO_0612 = new Set(['biomimetic-dentistry', 'rubber-dam', 'ids', 'all-on-x', 'navigation-implant', 'laminate', 'zirconia-crown', 'diastema', 'onlay-overlay', 'splint', 'sinus-lift'])

/** 백과사전 항목별 실제 최종 수정일 — 보강본이 있으면 보강일, 없으면 원 데이터 커밋일 */
export function encycloEntryDate(slug: string, layer: 'encyclopedia' | 'glossary', enriched: boolean): string {
  if (enriched) return CONTENT_DATES.encyclopediaEnrich
  if (layer === 'glossary') return CONTENT_DATES.glossary
  return ENCYCLO_0612.has(slug) ? '2026-06-12' : CONTENT_DATES.encyclopedia
}

/** 진료별 개별 검토일 — 해당 진료 본문만 고친 경우 (없으면 CONTENT_DATES.treatments) */
export const TREATMENT_DATES: Record<string, string> = {
  /** All-on-X — 원장 자료(인사말·학회 발표 증례·감사장·옛 전용 페이지 설계서) 반영, 사례 링크 (2026-10-07) */
  'all-on-x': '2026-10-07',
}
export function treatmentReviewed(slug: string): string {
  return latestDate(CONTENT_DATES.treatments, TREATMENT_DATES[slug])
}

// ============================================================================
// 사이트맵 lastmod 용 페이지별 콘텐츠 수정일 (2026-09-29 산출, 같은 원칙)
// 값 = 해당 페이지 본문/데이터를 실제로 고친 커밋 날짜 — WebP 전환·스키마·레이아웃·버그 수정 커밋은 제외.
// 동적 콘텐츠(칼럼·케이스·공지·수가 R2)는 R2 의 updatedAt/createdAt 을 쓰고, 여기 값은 폴백.
// ============================================================================
export const PAGE_DATES = {
  /** 홈 — src/pages/home.tsx 콘텐츠 확충 (75ea339) */
  home: '2026-10-08', // 온천장 치과 대표 키워드 title·eyebrow·허브 링크 (이전: 75ea339 2026-09-04)
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
  /** 지역 안내 목록(/area) — 온천장 치과 허브 링크 문단 추가 (2026-10-08) */
  areaIndex: '2026-10-08',
} as const

/** YYYY-MM-DD 목록 중 가장 최근 날짜 (없으면 '') */
/** 지역별 데이터를 실제로 고친 날 — facilities.ts seoRegions (동래: 정거장 수 정정 2026-10-08)
 *  울주: /area/ulju-* 4페이지 원거리 내원 안내로 본문 재작성 (src/pages/area-ulju.tsx ULJU_DATE, 2026-10-08) */
export const AREA_REGION_DATES: Record<string, string> = {
  dongnae: '2026-10-08',
  ulju: '2026-10-08',
}

export function latestDate(...dates: (string | undefined | null)[]): string {
  return dates
    .map((d) => (d || '').slice(0, 10))
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
    .sort()
    .pop() || ''
}
