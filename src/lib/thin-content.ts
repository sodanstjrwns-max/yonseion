/**
 * 얇은(thin) 백과사전 페이지 판정 — GSC "크롤링됨-미색인" 정리용 (2026-09-29)
 *
 * 원칙 (PF Web Engine 공통, eumdc 79fab5b 동일):
 *  - 항목 고유 본문(태그 제거·공백 제외 글자 수)이 기준 미만이면
 *    <meta name="robots" content="noindex, follow"> + X-Robots-Tag + 사이트맵 제외.
 *  - 페이지·목록 링크는 그대로 유지 → 본문을 보강해 기준을 넘으면 자동으로 색인·사이트맵 복귀.
 *
 * 2026-09-29 실측(데이터 기준):
 *  - 리치 레이어(encyclopedia.ts) 200개: 한 줄 정의 + Q&A 본문 136~530자 (중앙 299)
 *  - 경량 레이어(glossary.ts, 리치와 slug 겹치지 않는 것) 379개: 한 문장 정의 17~49자
 *  → 49자와 136자 사이 빈 구간의 100자를 기준으로 경량 용어 전부 thin, 리치 해설은 색인 유지
 *
 * 2026-10-08 보강: 경량 용어 331개 전부 + 300자 미만 리치 해설·중복 통합 대상 125개에
 *  용어별 본문 섹션·FAQ(src/data/encyclopedia-enrich)를 더해 700~1,200자로 보강 → 보강본 글자수를
 *  합산하므로 기준(100자)을 넘어 자동으로 index·사이트맵 복귀. 기준값 자체는 유지(새 한 줄 용어 방어).
 */
import type { EncycloEntry } from '../data/encyclopedia'
import type { GlossaryEntry } from '../data/glossary'
import { getEnrichment } from '../data/encyclopedia-enrich'
import type { Enrichment } from '../data/encyclopedia-enrich/types'

export const THIN_ENCYCLO_MIN_CHARS = 100
export const NOINDEX_FOLLOW = 'noindex, follow'

/** HTML → 화면에 보이는 글자 수 (태그·엔티티·공백 제외) */
export function visibleTextLength(s?: string | null): number {
  if (!s) return 0
  return String(s)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, '')
    .length
}

/** 보강본(섹션 + FAQ) 글자 수 */
export function enrichTextLength(x?: Enrichment): number {
  if (!x) return 0
  return x.sections.reduce((n, s) => n + visibleTextLength(s.h) + visibleTextLength(s.p), 0)
    + x.faqs.reduce((n, f) => n + visibleTextLength(f.q) + visibleTextLength(f.a), 0)
}

/** 리치 해설: 한 줄 정의 + 본문 Q&A + 보강본 */
export function encycloTextLength(e: Pick<EncycloEntry, 'slug' | 'oneLiner' | 'body'>): number {
  return visibleTextLength(e.oneLiner) + e.body.reduce((n, b) => n + visibleTextLength(b.h) + visibleTextLength(b.p), 0)
    + enrichTextLength(getEnrichment(e.slug))
}

/** 경량 용어: 한 문장 정의 + 보강본 */
export function glossaryTextLength(g: Pick<GlossaryEntry, 'slug' | 'def'>): number {
  return visibleTextLength(g.def) + enrichTextLength(getEnrichment(g.slug))
}

export const isThinEncyclo = (e: Pick<EncycloEntry, 'slug' | 'oneLiner' | 'body'>) => encycloTextLength(e) < THIN_ENCYCLO_MIN_CHARS
export const isThinGlossary = (g: Pick<GlossaryEntry, 'slug' | 'def'>) => glossaryTextLength(g) < THIN_ENCYCLO_MIN_CHARS
