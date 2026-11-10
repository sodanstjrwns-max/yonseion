// ============================================================================
// llms.txt / llms-full.txt 공통 "병원 정보" 사실 블록 (2026-11-10, PF 표준)
// - 값은 전부 레포 상수(clinic.ts·doctors.ts·treatments.ts)와 공개 수가표(R2)에서만 가져온다. 추측 금지.
// - 진료비는 /pricing 에 실제로 공개(published !== false)된 항목만, 저장된 값 그대로.
// - 최종 확인일 = 병원 정보 데이터(진료시간·의료진)를 실제로 고친 날 (lib/content-dates.ts 고정값)
// ============================================================================
import { clinic } from '../data/clinic'
import { doctors } from '../data/doctors'
import { treatments } from '../data/treatments'
import { HUB_PATH } from './hub-link'
import { PAGE_DATES, latestDate } from './content-dates'
import type { PricingData } from './pricing-store'

// 요일 표기 줄임: '월요일' → '월', '일요일·공휴일' → '일·공휴일'
const dayShort = (d: string) => d.replace(/요일/g, '')

/** clinic.hours → "월·화·목·금 09:30-18:30 (점심 13:00-14:00) / 토 09:30-13:00 (점심시간 없음) / 휴진: 수·일·공휴일" */
export function hoursLine(): string {
  const open: { key: string; time: string; note: string; days: string[] }[] = []
  const closed: string[] = []
  for (const h of clinic.hours) {
    if (h.time === '휴진') { closed.push(dayShort(h.day)); continue }
    const time = h.time.replace(/\s*-\s*/, '-')
    const note = h.note.replace(/\s+(\d)/, ' $1')
    const key = time + '|' + note
    let g = open.find((x) => x.key === key)
    if (!g) { g = { key, time, note, days: [] }; open.push(g) }
    g.days.push(dayShort(h.day))
  }
  return [
    ...open.map((g) => `${g.days.join('·')} ${g.time}${g.note ? ` (${g.note})` : ''}`),
    ...(closed.length ? [`휴진: ${closed.join('·')}`] : []),
  ].join(' / ')
}

// 대표 비급여 항목 — 공개 수가표에서 이름으로 찾는다(없거나 비공개면 그 줄은 생략)
const PRICE_PICKS: RegExp[] = [
  /^오스템\(OSSTEM\) 임플란트$/,
  /^All-on-X/,
  /^지르코니아 \(전치\)$/,
  /^라미네이트 \(무삭제\)$/,
  /^Onlay \(E-max\)$/,
  /^교합안정장치/,
]

export function priceLines(pricing?: PricingData | null): string[] {
  if (!pricing) return []
  const items = pricing.groups.flatMap((g) => g.items).filter((it) => it.published !== false && /\d/.test(it.price || ''))
  const picked = PRICE_PICKS.map((re) => items.find((it) => re.test(it.name))).filter((it): it is NonNullable<typeof it> => !!it)
  if (picked.length < 3) return []
  return picked.map((it) => `  - ${it.name}: ${it.price}${it.note ? ` (${it.note})` : ''}`)
}

/** "## 병원 정보" 블록 (끝에 빈 줄 없음) */
export function llmsFactBlock(pricing?: PricingData | null): string {
  const base = clinic.domain
  const prices = priceLines(pricing)
  const priceDate = latestDate(pricing?.updatedAt)
  const checked = latestDate(PAGE_DATES.directions, PAGE_DATES.doctors)
  const lines = [
    '## 병원 정보',
    `- 이름: ${clinic.nameKo} (${clinic.nameEn})`,
    `- 진료 분야: 치과 — ${treatments.map((t) => t.name).join(', ')}`,
    `- 주소: ${clinic.address} / 가까운 역·출구: ${clinic.subway}`,
    `- 전화: ${clinic.phone}`,
    `- 진료 시간: ${hoursLine()}`,
    `- 의료진: ${doctors.map((d) => `${d.name} ${d.role}(${d.licenses.join('·')})`).join(', ')}`,
    `- 예약: ${base}/reservation${clinic.sns.naverBooking ? ` (네이버 예약 ${clinic.sns.naverBooking})` : ''}`,
    `- 진료 안내: ${base}/treatments / 비용 안내: ${base}/pricing / 의료진: ${base}/doctors / 지역 안내(허브): ${base}${HUB_PATH} / 자주 묻는 질문: ${base}/faq`,
    ...(prices.length ? [
      `- 주요 비급여 진료비 (비용 안내 페이지 공개 값${priceDate ? `, 수가표 수정일 ${priceDate}` : ''}. 구강 상태·치료 범위·재료에 따라 달라질 수 있음):`,
      ...prices,
    ] : []),
    ...(checked ? [`- 최종 확인일: ${checked} (진료 시간·의료진 정보 기준일)`] : []),
  ]
  return lines.join('\n')
}
