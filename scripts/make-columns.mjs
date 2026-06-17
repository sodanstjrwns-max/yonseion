import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

const read = (p) => readFileSync(new URL(p, import.meta.url), 'utf-8')

const now = new Date()
const iso = (daysAgo) => new Date(now.getTime() - daysAgo * 86400000).toISOString()

const columns = [
  {
    id: 'col_biomimetic-3-misunderstandings',
    slug: '생체모방치의학-접착수복-오해',
    title: '"보존적이라면서 왜 더 비싸죠?" — 생체모방 접착수복의 세 가지 오해',
    excerpt: '치아를 덜 깎는 접착수복(온레이·오버레이)을 두고 환자분들이 흔히 하시는 세 가지 오해를, 보철과 전문의가 진료실 경험으로 풀어드립니다.',
    contentHtml: read('./col1.html'),
    thumbnail: '/static/img/photos/treatment_03.jpg',
    images: [],
    authorSlug: 'kim-kyunghee',
    relatedTreatments: ['adhesive-restoration', 'esthetic-prosthetics'],
    metaTitle: '생체모방 접착수복의 세 가지 오해 | 연세온치과의원',
    metaDescription: '오버레이는 크라운의 일종일까? 보존적 치료는 쌀까? 보철과 전문의가 생체모방치의학 접착수복에 대한 흔한 오해 3가지를 바로잡습니다.',
    published: true,
    createdAt: iso(5),
    updatedAt: iso(5),
  },
  {
    id: 'col_all-on-x-confidence',
    slug: 'all-on-x-전체임플란트-자신감',
    title: '무치악에서 다시 찾은 미소 — All-on-X 전체임플란트 이야기',
    excerpt: '온라인으로 찾아오신 60대 남성 환자분이 상·하악 전체임플란트로 자신감 있는 미소를 되찾고, 가족까지 함께하게 된 진료 경험을 나눕니다.',
    contentHtml: read('./col2.html'),
    thumbnail: '/static/img/photos/clinic_13.jpg',
    images: [],
    authorSlug: 'kim-kyunghee',
    relatedTreatments: ['all-on-x', 'implant-guide'],
    metaTitle: 'All-on-X 전체임플란트로 되찾은 자신감 | 연세온치과의원',
    metaDescription: '무치악 상태에서 상·하악 All-on-X 전체임플란트로 씹는 기능과 미소의 자신감을 회복한 환자 사례. 부산 동래 연세온치과의원.',
    published: true,
    createdAt: iso(3),
    updatedAt: iso(3),
  },
  {
    id: 'col_esthetic-midlife',
    slug: '중장년-심미보철-앞니',
    title: '앞니 하나가 바꾸는 것 — 중장년 심미보철에 대하여',
    excerpt: '"앞니가 신경 쓰인다"며 오신 분의 미소가 바뀌던 날의 이야기. 자신도 보철 치아를 가진 보철과 전문의가, 같은 눈높이에서 중장년 심미 치료를 말합니다.',
    contentHtml: read('./col3.html'),
    thumbnail: '/static/img/photos/consult_04.jpg',
    images: [],
    authorSlug: 'kim-kyunghee',
    relatedTreatments: ['esthetic-prosthetics', 'adhesive-restoration'],
    metaTitle: '중장년 심미보철, 앞니 하나가 바꾸는 것 | 연세온치과의원',
    metaDescription: '연조직 이식술로 자연스러운 앞니 심미보철을 완성한 경험과, 보철과 전문의가 중장년 심미 치료에 임하는 진심을 담은 원장 칼럼.',
    published: true,
    createdAt: iso(1),
    updatedAt: iso(1),
  },
]

mkdirSync(new URL('./out/columns', import.meta.url), { recursive: true })
for (const col of columns) {
  writeFileSync(new URL(`./out/columns/${col.id}.json`, import.meta.url), JSON.stringify(col))
}
const index = columns.map((c) => ({ id: c.id, slug: c.slug, title: c.title, createdAt: c.createdAt, published: c.published }))
writeFileSync(new URL('./out/columns/_index.json', import.meta.url), JSON.stringify(index))
console.log('Wrote', columns.length, 'columns + index')
console.log(index.map((c) => `  ${c.id} -> ${c.slug}`).join('\n'))
