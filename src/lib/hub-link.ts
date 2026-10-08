/**
 * "온천장 치과" 허브(/area/oncheonjang)로 보내는 내부 링크 (2026-10-08 허브 내부 링크 몰아주기)
 *
 * - 앵커 텍스트는 대표 키워드 "온천장 치과" 그대로, nofollow 없음.
 * - 한 페이지에 허브 링크는 최대 2개(전역 푸터 1 + 본문 1). 허브 자신에는 넣지 않는다.
 * - 칼럼 끝 문장은 slug 해시로 4개 문형 중 하나를 고정 선택 (글마다 같은 문장 반복 방지).
 * - 문장 속 사실(온천장역 1·5번 출구, 수·일 휴진, 토요일 오전 진료)은 data/clinic.ts 값만.
 */
export const HUB_PATH = '/area/oncheonjang'
export const HUB_ANCHOR = '온천장 치과'

export const hubA = (style = '') => `<a href="${HUB_PATH}"${style ? ` style="${style}"` : ''}>${HUB_ANCHOR}</a>`

export function slugHash(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0
  return h
}

const COLUMN_LINES: [string, string][] = [
  ['연세온치과의원은 ', '를 찾는 동래구 온천동·명륜동 이웃분들께 진료시간과 오시는 길을 한곳에 모아 안내합니다.'],
  ['이 글을 읽고 상담을 고민 중이시라면, ', ' 안내에서 온천장역 1·5번 출구 기준 찾아오는 길을 먼저 확인해 보세요.'],
  ['수요일·일요일 휴진과 토요일 오전 진료 등 요일별 진료시간은 ', ' 안내 페이지에 정리되어 있습니다.'],
  ['동래에서 가까운 ', '를 알아보고 계신다면 연세온치과의원의 의료진과 진료 범위를 함께 살펴보세요.'],
]

/** 칼럼 본문 끝(작성자 박스 위) 지역 안내 1문장 HTML */
export function columnHubLine(slug: string): string {
  const [pre, post] = COLUMN_LINES[slugHash(slug || '') % COLUMN_LINES.length]
  return `<p class="hub-local-line" style="margin-top:3rem;padding:1rem 1.2rem;border-left:3px solid var(--gold,#C59F66);background:var(--paper-2,#f7f5f0);border-radius:6px;line-height:1.8">${pre}${hubA()}${post}</p>`
}

/** 본문 HTML 에 이미 허브 링크가 있는지 (있으면 문장 블록 생략 → 페이지당 2개 이하) */
export function htmlHasHubLink(html: string): boolean {
  return /href=["'](?:https?:\/\/(?:www\.)?yonseion\.kr)?\/area\/oncheonjang\/?["'#?]/i.test(html || '')
}
