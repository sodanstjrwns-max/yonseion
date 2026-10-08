// ============================================================================
// 백과사전 용어 보강(enrichment) 타입 — 2026-10-08 지역 SEO 웨이브
// 한 문장 정의뿐이라 noindex 되던 경량 용어(glossary)와 300자 미만 리치 해설(encyclopedia)을
// 용어별 고유 본문(섹션 3~5 + FAQ 2~3)으로 보강한다. 본문은 평문(렌더 시 이스케이프).
// ============================================================================
export type EnrichKind = '질환' | '증상' | '시술' | '검사' | '재료' | '장비' | '해부' | '제도' | '관리' | '개념'

export interface Enrichment {
  kind: EnrichKind
  sections: { h: string; p: string }[]
  faqs: { q: string; a: string }[]
  /** 관련 용어 slug (백과사전 내부 링크) */
  relatedTerms: string[]
  /** 관련 진료 slug (src/data/treatments.ts) */
  relatedTreatments?: string[]
}
