// ============================================================================
// 수가(비급여 진료비용) 저장소
// - 관리자가 수정하면 R2(pricing/data.json)에 저장됩니다.
// - R2에 저장된 값이 없으면 src/data/pricing.ts 의 기본값을 사용합니다.
// - 프론트(비용 안내)·관리자 페이지가 모두 이 함수를 통해 데이터를 읽습니다.
// ============================================================================
import { Store } from './store'
import { priceGroups as defaultGroups, pricingNotes as defaultNotes } from '../data/pricing'
import type { PriceItem } from '../data/pricing'

export interface PriceGroup {
  label: string
  desc?: string
  items: PriceItem[]
}

export interface PricingData {
  groups: PriceGroup[]
  notes: string[]
  updatedAt?: string
}

const KEY = 'pricing/data.json'

// 기본값(코드에 하드코딩된 수가표)을 깊은 복사로 반환
export function defaultPricing(): PricingData {
  return {
    groups: JSON.parse(JSON.stringify(defaultGroups)) as PriceGroup[],
    notes: [...defaultNotes],
  }
}

// R2에서 수가 읽기 — 없으면 기본값 폴백
export async function getPricing(r2: R2Bucket): Promise<PricingData> {
  try {
    const store = new Store(r2)
    const data = await store.getJSON<PricingData>(KEY)
    if (data && Array.isArray(data.groups) && data.groups.length) {
      return {
        groups: data.groups,
        notes: Array.isArray(data.notes) && data.notes.length ? data.notes : defaultNotes,
        updatedAt: data.updatedAt,
      }
    }
  } catch { /* R2 미연결 등 — 기본값 폴백 */ }
  return defaultPricing()
}

// R2에 수가 저장
export async function savePricing(r2: R2Bucket, data: PricingData): Promise<void> {
  const store = new Store(r2)
  await store.putJSON(KEY, { ...data, updatedAt: new Date().toISOString() })
}

// 관리자에서 "기본값으로 초기화" 시 R2 값을 지웁니다.
export async function resetPricing(r2: R2Bucket): Promise<void> {
  const store = new Store(r2)
  await store.delete(KEY)
}
