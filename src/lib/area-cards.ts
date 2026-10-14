// ============================================================================
// "온천장 {진료}" 핵심 하위 페이지 6개 — 사진 카드·대표 사진 (2026-10-14 하위 페이지 카드)
//
// 페이지마다 실사(원내·진료·상담 사진, public/static/img/photos/) 1장을 정하고, 같은 사진을 네 곳에 쓴다.
//   og:image  → /static/img/cards/<slug>-1200x630.jpg (중앙 크롭 1200×630)
//   본문 첫 사진 → /static/img/cards/<slug>-1200.webp (같은 사진 가로 1200)
//   JSON-LD image·primaryImageOfPage, sitemap image:image → og 와 같은 jpg
//   홈·허브 카드 → /static/img/cards/<slug>-600.webp (정사각 600×600)
// 전후 사진·환자 얼굴은 쓰지 않는다. 한 줄 설명은 treatments.ts 의 기존 문장 그대로.
// ============================================================================
import { clinic } from '../data/clinic'

export interface AreaCard {
  slug: string            // /area/<slug>
  name: string            // 카드 제목 = "온천장 {진료}"
  tag: string
  line: string            // 기존 진료 데이터 문장
  treatmentSlug: string   // /treatments/<slug>
  photo: string           // 원본 실사 파일 (public/static/img/photos/)
  photoDesc: string       // 사진 설명 (alt·캡션)
  bodyH: number           // 본문 사진(가로 1200) 높이
}

export const ONCHEONJANG_CARDS: AreaCard[] = [
  { slug: 'oncheonjang-implant-guide', name: '온천장 임플란트', tag: 'IMPLANT', line: '디지털 가이드로 계획된 위치에 정밀하게', treatmentSlug: 'implant-guide', photo: 'clinic_06.jpg', photoDesc: '네비게이션 가이드 출력용 3D 프린터', bodyH: 800 },
  { slug: 'oncheonjang-all-on-x', name: '온천장 전체임플란트', tag: 'ALL-ON-X', line: '무너진 전체 치열을 다시, 안모 라인까지 고려한 고정성 보철', treatmentSlug: 'all-on-x', photo: 'consult_03.jpg', photoDesc: '치료계획을 화면으로 설명하는 상담', bodyH: 799 },
  { slug: 'oncheonjang-esthetic-prosthetics', name: '온천장 심미보철', tag: 'ESTHETIC', line: '망가진 전치부를 자연스럽게, 미소에 젊음을', treatmentSlug: 'esthetic-prosthetics', photo: 'consult_06.jpg', photoDesc: '치아 모형을 보며 진행하는 보철 상담', bodyH: 799 },
  { slug: 'oncheonjang-adhesive-restoration', name: '온천장 충치치료', tag: 'ADHESIVE', line: '러버댐 방습 하 정밀 접착, 치아를 최대한 보존하는 충치치료', treatmentSlug: 'adhesive-restoration', photo: 'treatment_03.jpg', photoDesc: '확대경(루페)을 착용하고 진행하는 진료', bodyH: 799 },
  { slug: 'oncheonjang-root-canal', name: '온천장 신경치료', tag: 'ROOT CANAL', line: '치아 내부 감염 정리·보존', treatmentSlug: 'conservative', photo: 'treatment_04.jpg', photoDesc: '치아 단면 화면을 띄워 두고 진행하는 진료', bodyH: 799 },
  { slug: 'oncheonjang-tmj-occlusion', name: '온천장 턱관절·교합', tag: 'TMJ', line: '이갈이·턱관절 불편, 교합 안정장치와 물리치료로', treatmentSlug: 'tmj-occlusion', photo: 'clinic_03.jpg', photoDesc: '연세온치과의원 진료실', bodyH: 800 },
]

export const cardThumb = (c: AreaCard) => `/static/img/cards/${c.slug}-600.webp`
export const cardOg = (c: AreaCard) => `/static/img/cards/${c.slug}-1200x630.jpg`
export const cardBody = (c: AreaCard) => `/static/img/cards/${c.slug}-1200.webp`
export const cardAlt = (c: AreaCard) => `${c.name} — ${c.photoDesc}`
export const getAreaCard = (slug: string) => ONCHEONJANG_CARDS.find((c) => c.slug === slug)

// 허브(/area/oncheonjang) 대표 사진 — 원내 리셉션(clinic_13.jpg)
export const HUB_OG = '/static/img/cards/oncheonjang-hub-1200x630.jpg'

/** 본문 H1 바로 아래 대표 사진 (og 와 같은 사진) */
export function areaHeroFigure(c: AreaCard): string {
  return `<figure class="area-hero-fig"><img src="${cardBody(c)}" alt="${cardAlt(c)}" width="1200" height="${c.bodyH}" fetchpriority="high" decoding="async"><figcaption>${c.photoDesc} · ${clinic.nameKo}</figcaption></figure>`
}
export const AREA_HERO_FIG_CSS = `<style>
  .area-hero-fig{margin:2.2rem 0 0;max-width:62rem;border-radius:14px;overflow:hidden;background:var(--paper-2);box-shadow:0 10px 34px rgba(46,58,75,.10)}
  .area-hero-fig img{display:block;width:100%;height:auto}
  .area-hero-fig figcaption{font-size:.8rem;color:var(--mist);padding:.65rem 1rem;background:var(--paper);border-top:1px solid var(--line)}
</style>`

/** JSON-LD 용 ImageObject (og 와 같은 파일) */
export function cardImageObject(c: AreaCard) {
  return { '@type': 'ImageObject', url: clinic.domain + cardOg(c), width: 1200, height: 630, caption: cardAlt(c) }
}

/** 홈·허브 사진 카드 그리드 (화면 = ItemList 1:1) */
export function areaCardGrid(idPrefix: string): string {
  return `<ul class="onc-cards" role="list">${ONCHEONJANG_CARDS.map((c, i) =>
    `<li><a class="onc-card" href="/area/${c.slug}" aria-labelledby="${idPrefix}-${i}">` +
      `<span class="onc-card-img"><img src="${cardThumb(c)}" width="600" height="600" loading="lazy" decoding="async" alt="${cardAlt(c)}"></span>` +
      `<span class="onc-card-body"><span class="onc-card-tag" aria-hidden="true">0${i + 1} · ${c.tag}</span>` +
      `<strong class="onc-card-title" id="${idPrefix}-${i}">${c.name}</strong>` +
      `<span class="onc-card-line">${c.line}</span></span></a></li>`).join('')}</ul>`
}

export const AREA_CARD_CSS = `<style>
  .onc-cards{list-style:none;margin:1.8rem 0 0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1.4rem}
  .onc-card{display:flex;flex-direction:column;height:100%;text-decoration:none;color:inherit;background:var(--paper);border:1px solid var(--line);border-radius:14px;overflow:hidden;transition:transform .35s var(--ease,ease),box-shadow .35s var(--ease,ease),border-color .35s}
  .onc-card:hover{transform:translateY(-4px);border-color:var(--gold);box-shadow:0 14px 34px rgba(46,58,75,.12)}
  .onc-card-img{display:block;aspect-ratio:1/1;overflow:hidden;background:var(--paper-2)}
  .onc-card-img img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .6s var(--ease,ease)}
  .onc-card:hover .onc-card-img img{transform:scale(1.04)}
  .onc-card-body{display:flex;flex-direction:column;gap:.35rem;padding:1.05rem 1.15rem 1.3rem}
  .onc-card-tag{font-family:var(--serif);font-size:.72rem;letter-spacing:.12em;color:var(--gold-2)}
  .onc-card-title{font-family:var(--serif-kr);font-size:1.12rem;font-weight:600;color:var(--ink)}
  .onc-card-line{font-size:.86rem;line-height:1.65;color:var(--mist)}
  @media (max-width:900px){.onc-cards{grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}}
  @media (max-width:520px){.onc-card-body{padding:.8rem .85rem 1rem}.onc-card-title{font-size:1rem}.onc-card-line{font-size:.8rem}}
</style>`

/** 화면 카드와 1:1 ItemList (같은 순서·이름·URL·사진) */
export function areaCardItemList(listPath: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${clinic.domain}${listPath}#oncheonjang-care`,
    name: '온천장 치과 진료별 안내',
    numberOfItems: ONCHEONJANG_CARDS.length,
    itemListElement: ONCHEONJANG_CARDS.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      url: `${clinic.domain}/area/${c.slug}`,
      image: clinic.domain + cardThumb(c),
    })),
  }
}
