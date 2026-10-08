// ============================================================================
// 백과사전 용어 보강본 모음 — slug → Enrichment (2026-10-08)
// 경량 용어(glossary)와 리치 해설(encyclopedia) 공용. 화면·FAQPage·글자수 판정에 사용.
// ============================================================================
import type { Enrichment } from './types'
import { part01 } from './part-01'
import { part02 } from './part-02'
import { part03 } from './part-03'
import { part04 } from './part-04'
import { part05 } from './part-05'
import { part06 } from './part-06'
import { part07 } from './part-07'
import { part08 } from './part-08'
import { part09 } from './part-09'
import { part10 } from './part-10'
import { part11 } from './part-11'
import { part12 } from './part-12'
import { part13 } from './part-13'
import { part14 } from './part-14'
import { part15 } from './part-15'

export const ENRICH: Record<string, Enrichment> = {
  ...part01,
  ...part02,
  ...part03,
  ...part04,
  ...part05,
  ...part06,
  ...part07,
  ...part08,
  ...part09,
  ...part10,
  ...part11,
  ...part12,
  ...part13,
  ...part14,
  ...part15,
}

export const getEnrichment = (slug: string): Enrichment | undefined => ENRICH[slug]
