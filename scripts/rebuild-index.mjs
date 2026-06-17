import { writeFileSync } from 'node:fs'

// 최종 칼럼 구성 (최신순)
// 영문 3편(생체모방 오해 시리즈, 이전 세션 발행·정상작동) + 한글 2편(케이스)
const index = [
  // 한글 케이스 칼럼 (최신)
  { id: 'col_esthetic-midlife', slug: '중장년-심미보철-앞니', title: '앞니 하나가 바꾸는 것 — 중장년 심미보철에 대하여', createdAt: '2026-06-16T02:42:53.793Z', published: true },
  { id: 'col_all-on-x-confidence', slug: 'all-on-x-전체임플란트-자신감', title: '무치악에서 다시 찾은 미소 — All-on-X 전체임플란트 이야기', createdAt: '2026-06-14T02:42:53.793Z', published: true },
  // 영문 생체모방 오해 시리즈 3편 (이전 세션 발행)
  { id: 'col_2efb0d25cd', slug: 'biomimetic-myth-conservative-is-easy', title: '보존적 치료가 더 쉽다는 오해 — 접착수복이 까다로운 이유', createdAt: '2026-06-17T01:30:00.000Z', published: true },
  { id: 'col_cd6d85a270', slug: 'biomimetic-myth-overlay-is-not-a-crown-type', title: '오버레이와 크라운의 차이 — 오버레이는 크라운의 종류가 아닙니다', createdAt: '2026-06-17T01:30:00.000Z', published: true },
  { id: 'col_4910a7da30', slug: 'biomimetic-myth-conservative-is-not-cheaper', title: '보존적 치료가 더 비싼 이유 — 접착수복의 공임에 대하여', createdAt: '2026-06-17T01:30:00.000Z', published: true },
]

writeFileSync(new URL('./out/columns/_index.json', import.meta.url), JSON.stringify(index))
console.log('Rebuilt index with', index.length, 'columns')
index.forEach((c) => console.log(' ', c.id, '->', c.slug))
