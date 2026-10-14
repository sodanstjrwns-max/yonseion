import { html, raw } from 'hono/html'
import { Layout, Breadcrumb } from '../components/layout'
import { clinic } from '../data/clinic'
import { doctors } from '../data/doctors'
import { getTreatment } from '../data/treatments'
import { breadcrumbSchema, faqSchema, areaServiceSchema } from '../lib/schema'
import { ONCHEONJANG_CARDS, getAreaCard, areaHeroFigure, AREA_HERO_FIG_CSS, cardOg, cardAlt, cardImageObject, type AreaCard } from '../lib/area-cards'

// ============================================================================
// 온천장 핵심 하위 페이지 신설 2개 (2026-10-14) — /area/oncheonjang-root-canal · /area/oncheonjang-tmj-occlusion
// 19지역 × 4진료 템플릿(area.tsx)과 별개의 온천장 전용 본문. 지역×진료 조합을 늘리지 않는다(얇은 페이지 방지).
// 사실 정보는 clinic.ts·doctors.ts·treatments.ts·facilities.ts·faqs.ts 에 이미 있는 값만 사용.
// ============================================================================
export const ONCHEONJANG_EXTRA_DATE = '2026-10-14'

type Faq = { q: string; a: string }
interface ExtraPage {
  slug: string
  txSlug: string
  title: string
  description: string
  eyebrow: string
  h1: string
  lead: string
  body: string        // 본문 HTML (h2·p)
  faqs: Faq[]
  ctaTitle: string
}

const doc = doctors[0]
const hub = '<a href="/area/oncheonjang">온천장 치과</a>'

const PAGES: ExtraPage[] = [
  {
    slug: 'oncheonjang-root-canal',
    txSlug: 'conservative',
    title: `온천장 신경치료 | 살릴 수 있는 치아인지 먼저 보는 기준 — ${clinic.nameKo}`,
    description: `온천장 신경치료(근관치료) 안내 — 신경을 살릴 수 있는지부터 확인하고, 치료 후 치아를 어떻게 보호할지까지 설명합니다. ${clinic.nameKo}, ${clinic.subway}, ${clinic.closedDays}.`,
    eyebrow: '부산 동래구 온천동 · 온천장역 1·5번 출구 도보 3분',
    h1: '온천장 신경치료,<br>살릴 수 있는 치아인지부터',
    lead: `찬물에 시리던 이가 밤에도 욱신거리거나 잇몸이 부었다면 신경 쪽 문제일 수 있습니다. ${clinic.nameKo}는 온천장역 1·5번 출구에서 걸어서 3분 거리에서, 신경을 살릴 방법이 있는지 먼저 살피고 필요할 때 신경치료(근관치료)를 진행합니다.`,
    body: `
      <h2>온천장 가까이에서 신경치료를 받으면 좋은 이유</h2>
      <p>신경치료는 치아 내부를 충분히 소독하고 밀폐해야 해서, 치아 상태에 따라 여러 번 나누어 내원하는 경우가 많습니다. 한 번에 끝나는 치료가 아니기 때문에 집이나 직장에서 오가기 편한 곳인지가 생각보다 중요합니다. ${clinic.nameShort}는 1층에 베스킨라빈스가 있는 허브메디컬타워 901호에 있어, 온천장역에서 내려 바로 오실 수 있습니다.</p>
      <p>지하철 1호선 한 노선으로 명륜역에서는 한 정거장, 동래역에서는 두 정거장이고, 부산대역·장전역 등 금정구 방면에서도 몇 정거장이면 도착합니다. 허심청·동래온천이 있는 온천장 일대와 금강공원 입구 쪽 온천동에서는 걸어서 오시는 분도 많습니다. 차로 오시면 건물 주차장을 이용하실 수 있습니다. 수요일과 일요일·공휴일은 휴진이고, 토요일은 오전 9시 30분부터 오후 1시까지 점심시간 없이 진료하니 내원 일정을 미리 맞춰 두시면 치료 간격을 지키기 수월합니다.</p>

      <h2>신경치료가 필요한지 먼저 확인합니다</h2>
      <p>신경치료는 충치나 외상으로 치아 안쪽 신경에 염증이나 감염이 생겼을 때, 신경을 정리하고 내부를 소독·충전해 치아를 살리는 치료입니다. 심한 통증, 오래가는 시린 증상, 잇몸 부종이 신호가 될 수 있습니다.</p>
      <p>다만 아프다고 해서 모두 신경치료로 가는 것은 아닙니다. 연세온치과는 신경 노출 여부와 증상, 방사선 소견을 함께 보고 판단하며, 간접 치수 복조처럼 신경 노출 전에 신경을 살리는 보존적 접근이 가능한 경우에는 그 방법을 먼저 고려합니다. 자연치아를 최대한 보존하는 생체모방치의학이 진료의 중심이기 때문입니다.</p>

      <h2>신경치료를 받을 곳을 고를 때 보면 좋은 기준</h2>
      <p><strong>첫째, 신경을 살릴 가능성부터 설명하는지</strong> 확인해 보세요. 신경치료가 꼭 필요한 이유와, 다른 선택지가 있는지에 대한 설명이 있어야 납득하고 치료를 시작할 수 있습니다.</p>
      <p><strong>둘째, 치료 뒤 치아를 어떻게 보호할지 처음부터 함께 계획하는지</strong>입니다. 신경치료를 마친 치아는 약해질 수 있어, 남은 치아 양에 따라 크라운이나 온레이·오버레이로 덮어 보호하는 경우가 많습니다. 신경치료만 놓고 보지 않고 다음 단계까지 한 번에 안내받는 것이 좋습니다.</p>
      <p><strong>셋째, 건강보험 적용 범위를 미리 알려주는지</strong>입니다. 신경치료는 건강보험이 적용되는 보존치료에 해당하지만, 치료 후 씌우는 보철은 종류에 따라 적용이 달라집니다. 연세온치과는 진료 전에 적용 여부와 비용을 안내해 드립니다.</p>

      <h2>치료가 끝난 뒤, 치아를 오래 쓰려면</h2>
      <p>신경치료 후 보호 방법은 남은 치질의 양에 따라 달라집니다. 손상 부위만 덮는 온레이·오버레이 같은 접착수복으로 치아를 덜 깎는 방법이 가능한지도 함께 검토합니다. 자세한 내용은 <a href="/area/oncheonjang-adhesive-restoration">온천장 충치치료</a> 안내와 <a href="/treatments/adhesive-restoration">접착수복 진료 안내</a>에서 보실 수 있습니다.</p>
      <p>밤에 이를 갈거나 꽉 무는 습관이 있으면 치료한 치아에 힘이 몰려 금이 가기 쉬워, <a href="/area/oncheonjang-tmj-occlusion">온천장 턱관절·교합</a> 안내처럼 보호장치를 함께 고려하기도 합니다. 신경치료·충치치료·잇몸치료·스케일링 전반은 <a href="/treatments/conservative">보존·치주치료(건강보험) 진료 안내</a>에 정리되어 있습니다.</p>`,
    faqs: [
      { q: '수요일에 갑자기 이가 아프면 어떻게 하나요?', a: `수요일과 일요일·공휴일은 휴진입니다. 진료일(월·화·목·금 09:30~18:30, 토 09:30~13:00)에 전화(${clinic.phone})로 증상을 말씀해 주시면 예약 일정을 안내해 드립니다. 휴진일에 통증이나 붓기가 심하면 가까운 응급 진료 기관을 이용해 주세요.` },
      { q: '다른 치과에서 신경치료를 권유받았는데, 다시 확인해 볼 수 있나요?', a: '네. 상담 때 증상과 방사선 사진을 함께 보고, 신경을 살릴 수 있는 방법이 있는지와 신경치료가 필요한 이유를 설명해 드립니다. 이전에 찍은 사진이 있으면 가져오셔도 됩니다.' },
      { q: '신경치료도 건강보험이 적용되나요?', a: '신경치료(근관치료)는 건강보험이 적용되는 보존치료입니다. 치료 후 씌우는 보철은 종류에 따라 적용 여부가 달라, 진료 전에 미리 안내해 드립니다.' },
      { q: '온천장역 근처에서 일하는데, 퇴근 후에도 받을 수 있나요?', a: '평일 진료는 오후 6시 30분까지이며 점심시간은 13:00~14:00입니다. 치료 시간은 치아 상태에 따라 달라지니, 예약하실 때 원하시는 시간대를 말씀해 주시면 가능한 일정을 맞춰 드립니다.' },
    ],
    ctaTitle: '아픈 이, 살릴 수 있는지부터<br>함께 확인해 보세요.',
  },
  {
    slug: 'oncheonjang-tmj-occlusion',
    txSlug: 'tmj-occlusion',
    title: `온천장 턱관절·교합 | 이갈이·턱 소리, 보존적 관리부터 — ${clinic.nameKo}`,
    description: `온천장 턱관절·교합 치료 안내 — 이갈이·이악물기, 턱 소리·통증을 진단하고 교합 안정장치·물리치료 같은 보존적 방법부터 단계적으로 관리합니다. ${clinic.nameKo}, ${clinic.subway}.`,
    eyebrow: '부산 동래구 온천동 · 온천장역 1·5번 출구 도보 3분',
    h1: '온천장 턱관절·교합,<br>진단부터 차근차근',
    lead: `아침마다 턱이 뻐근하거나, 입을 벌릴 때 소리가 나고, 이를 간다는 말을 들으셨나요? ${clinic.nameKo}는 온천장역 가까이에서 턱관절·근육·교합을 함께 진단하고, 교합 안정장치와 물리치료 같은 보존적 방법부터 단계적으로 관리합니다.`,
    body: `
      <h2>턱관절 관리는 가까운 곳에서 꾸준히</h2>
      <p>턱관절과 교합 관리는 한 번의 치료로 끝나기보다, 장치를 맞춘 뒤 증상 변화를 보며 점검하고 조정하는 과정이 이어집니다. 그래서 출퇴근길이나 생활 동선 안에서 들르기 쉬운 곳이 유리합니다. ${clinic.nameShort}는 온천장역 1·5번 출구에서 도보 3분, 허브메디컬타워 901호에 있습니다.</p>
      <p>명륜역·동래역에서는 1호선으로 한두 정거장, 부산대역·장전역 방면에서도 몇 정거장이면 닿고, 서면역에서도 환승 없이 15분 안팎입니다. 사직동·안락동 쪽에서는 버스나 차량으로 10분 안팎 걸리며, 차로 오시면 건물 주차장을 이용하실 수 있습니다. 평일은 오후 6시 30분까지, 토요일은 오후 1시까지 진료하고 수요일·일요일·공휴일은 쉽니다.</p>

      <h2>이런 신호가 있다면 진단을 받아보세요</h2>
      <p>아침에 턱이나 관자놀이가 뻐근하고 두통이 있는 경우, 입을 벌릴 때 "딱" 소리가 나거나 아픈 경우, 입이 잘 안 벌어지거나 걸리는 느낌이 드는 경우가 대표적입니다. 이갈이나 이악물기는 본인이 잘 모르는 경우가 많아서, 치아가 유난히 닳았거나 보철이 자주 깨진다면 그 자체가 신호일 수 있습니다.</p>
      <p>턱관절 질환은 원인이 다양해 증상만으로 방법을 정하기 어렵습니다. 연세온치과는 턱관절과 교합, 근육 상태, 생활습관을 함께 보고 원인을 먼저 정리합니다.</p>

      <h2>턱관절 진료를 고를 때 보면 좋은 기준</h2>
      <p><strong>첫째, 보존적인 방법부터 시작하는지</strong>입니다. 대부분의 턱관절 불편은 장치·물리치료·습관 교정 같은 보존적 관리로 증상 완화를 기대할 수 있어, 무리한 치료를 서두르지 않는 것이 중요합니다. 보존적 치료에 반응하지 않는 제한적인 경우에는 협진을 의뢰합니다.</p>
      <p><strong>둘째, 장치를 내 교합에 맞춰 만들고 계속 조정해 주는지</strong>입니다. 교합 안정장치(스플린트)는 턱관절과 저작근에 가는 힘을 나누고 안정적인 교합 위치를 유도하는 장치로, 주로 잘 때 착용하며 착용 후에도 정기적으로 점검·조정합니다.</p>
      <p><strong>셋째, 진료 경험과 장비</strong>입니다. ${doc.name} ${doc.role}은 대한턱관절교합학회 정회원이며, 원내에 PHL 턱관절 물리치료기를 갖추고 있습니다. 교근·측두근 보톡스는 비급여이고 효과에 개인차가 있어, 진단 후 필요한 경우에만 안내합니다.</p>

      <h2>보철·임플란트를 하셨다면 더 챙겨야 하는 이유</h2>
      <p>잘 때 이를 갈거나 낮에 무의식적으로 꽉 무는 힘은 치아뿐 아니라 어렵게 완성한 보철과 임플란트에도 그대로 전해집니다. 그래서 <a href="/area/oncheonjang-implant-guide">온천장 임플란트</a>나 <a href="/area/oncheonjang-all-on-x">온천장 전체임플란트</a>, <a href="/area/oncheonjang-esthetic-prosthetics">온천장 심미보철</a> 치료를 받으신 분이 이갈이 습관이 있다면 보호장치를 함께 고려하는 것이 도움이 될 수 있습니다.</p>
      <p>진단과 일부 물리치료는 건강보험이 적용될 수 있지만, 교합 안정장치·보톡스 등은 비급여 항목이 포함됩니다. 정확한 적용은 진료 때 안내해 드리며, 진료 과정과 장치별 차이는 <a href="/treatments/tmj-occlusion">턱관절·교합 치료 안내</a>에서 더 자세히 보실 수 있습니다.</p>`,
    faqs: [
      { q: '턱관절 상담은 어떤 순서로 진행되나요?', a: '먼저 턱관절·교합·근육 상태와 생활습관을 함께 진단합니다. 이어서 교합 안정장치·물리치료·습관 교정 같은 보존적 관리부터 시작하고, 경과를 보며 장치를 조정합니다. 증상이 안정되면 재발을 막기 위한 관리와 정기 점검을 안내해 드립니다.' },
      { q: '턱이 아픈데 치과에서 보는 게 맞나요?', a: '턱관절과 교합은 치과에서 진단·관리하는 영역입니다. 치과에서는 치아 마모와 교합, 보철 상태를 함께 볼 수 있어 이갈이·이악물기와 연결된 문제를 찾는 데 도움이 됩니다. 보존적 치료로 관리가 어려운 경우에는 협진을 의뢰합니다.' },
      { q: '토요일에도 턱관절 진료를 받을 수 있나요?', a: '토요일은 09:30~13:00까지 점심시간 없이 진료합니다. 수요일과 일요일·공휴일은 휴진이니, 장치 점검처럼 정기적으로 오셔야 할 때는 토요일이나 평일 일정을 미리 예약해 두시면 편합니다.' },
      { q: '물리치료 때문에 자주 가야 한다면 주차가 되나요?', a: `건물 주차장을 이용하실 수 있습니다. 주차 가능 시간 등 세부 사항은 방문 전 전화(${clinic.phone})로 확인해 주세요. 지하철로는 1호선 온천장역 1·5번 출구에서 걸어서 3분입니다.` },
    ],
    ctaTitle: '뻐근한 턱, 원인부터<br>차근차근 확인해 보세요.',
  },
]

export const ONCHEONJANG_EXTRA_SLUGS = PAGES.map((p) => p.slug)

export function OncheonjangExtraPage(slug: string) {
  const p = PAGES.find((x) => x.slug === slug)
  const card = getAreaCard(slug) as AreaCard | undefined
  const tx = p ? getTreatment(p.txSlug) : undefined
  if (!p || !card || !tx) return null
  const path = `/area/${slug}`
  const url = clinic.domain + path
  const crumb = [{ name: '홈', url: '/' }, { name: '지역별 안내', url: '/area' }, { name: '온천장 치과', url: '/area/oncheonjang' }, { name: card.name, url: path }]
  const siblings = ONCHEONJANG_CARDS.filter((c) => c.slug !== slug)

  const body = html`
  <section class="page-hero">
    <div class="container">
      <p class="eyebrow">${p.eyebrow}</p>
      <h1 style="font-size:var(--t-h2)">${raw(p.h1)}</h1>
      <p class="lead" id="area-answer">${p.lead}</p>
      ${raw(areaHeroFigure(card) + AREA_HERO_FIG_CSS)}
    </div>
  </section>
  ${Breadcrumb(crumb)}

  <section class="section--tight">
    <div class="container">
      <div class="detail-grid">
        <div>
          <article class="prose" data-reveal>
            <p class="hub-local-line muted" style="font-size:.9rem;line-height:1.75;margin-bottom:1.6rem"><i class="fas fa-location-dot" style="color:var(--gold);margin-right:.4rem"></i>병원 위치·진료시간·의료진 종합 안내: ${raw(hub)}</p>
            ${raw(p.body)}
          </article>

          <div class="prose" data-reveal style="margin-top:2.5rem">
            <h2>온천장에서 받으실 수 있는 다른 진료</h2>
            <div style="display:flex;gap:.6rem;flex-wrap:wrap;margin-top:.4rem">
              ${raw(siblings.map((c) => `<a href="/area/${c.slug}" class="faq-tab">${c.name}</a>`).join(''))}
              <a href="/treatments/${tx.slug}" class="faq-tab">${tx.name} 진료 안내</a>
            </div>
          </div>

          <div style="margin-top:3.5rem" data-reveal>
            <h2 style="font-family:var(--serif-kr);font-size:var(--t-h3);margin-bottom:1rem">자주 묻는 질문</h2>
            <div class="faq-list">
              ${raw(p.faqs.map((f) => `
                <div class="faq-item">
                  <button class="faq-q"><span>${f.q}</span><i class="fas fa-plus"></i></button>
                  <div class="faq-a"><div class="faq-a-inner"><p>${f.a}</p></div></div>
                </div>`).join(''))}
            </div>
          </div>
        </div>
        <aside class="sidebar">
          <div class="sidebar-box">
            <h4>진료 의료진</h4>
            <p style="font-weight:600;color:var(--ink)">${doc.name} ${doc.role}</p>
            <p class="muted" style="font-size:.85rem;margin:.4rem 0 .8rem">${doc.title}</p>
            <a href="/doctors/${doc.slug}" class="link-arrow" style="font-size:.88rem">소개 보기 <i class="fas fa-arrow-right"></i></a>
          </div>
          <div class="sidebar-box">
            <h4>오시는 길</h4>
            <p style="font-size:.86rem;line-height:1.7">${clinic.address}</p>
            <p style="font-size:.86rem;font-weight:600;color:var(--ink);margin-top:.4rem">${clinic.subway}</p>
          </div>
          <div class="sidebar-box">
            <h4>진료시간</h4>
            <p style="font-size:.88rem;line-height:1.8">${clinic.hoursSummary}</p>
            <p class="muted" style="font-size:.82rem">${clinic.closedDays}</p>
          </div>
          <div class="sidebar-box">
            <h4>상담</h4>
            <a href="/reservation">예약 상담 신청</a>
            <a href="tel:${clinic.phoneRaw}">${clinic.phone}</a>
            <a href="${clinic.sns.naverBooking}" target="_blank" rel="noopener">네이버 예약</a>
            <a href="/directions">오시는 길 상세</a>
          </div>
        </aside>
      </div>
    </div>
  </section>

  <section class="section cta-band">
    <div class="container">
      <h2 data-reveal>${raw(p.ctaTitle)}</h2>
      <a href="/reservation" class="btn btn-primary" data-reveal data-reveal-delay="1" style="margin-top:2rem">예약 상담 신청 <i class="fas fa-arrow-right"></i></a>
    </div>
  </section>
  `
  return Layout({
    title: p.title,
    description: p.description,
    path,
    ogImage: clinic.domain + cardOg(card),
    ogImageAlt: cardAlt(card),
    jsonLd: [
      breadcrumbSchema(crumb),
      {
        '@context': 'https://schema.org',
        '@type': 'MedicalWebPage',
        '@id': `${url}#webpage`,
        url,
        name: p.title,
        description: p.description,
        inLanguage: 'ko',
        isPartOf: { '@id': `${clinic.domain}/#website` },
        about: { '@id': `${clinic.domain}/treatments/${tx.slug}#procedure` },
        publisher: { '@id': `${clinic.domain}/#clinic` },
        dateModified: ONCHEONJANG_EXTRA_DATE,
        image: cardImageObject(card),
        primaryImageOfPage: cardImageObject(card),
        medicalAudience: { '@type': 'MedicalAudience', audienceType: 'Patient' },
        speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '#area-answer'] },
      },
      areaServiceSchema({
        regionName: '온천장', regionFull: '부산 동래구 온천장', regionAdmin: '부산광역시 동래구',
        treatmentName: card.name.replace('온천장 ', ''), treatmentSlug: tx.slug, treatmentKeyword: card.name.replace('온천장 ', ''),
        path, image: clinic.domain + cardOg(card),
      }),
      faqSchema(p.faqs),
    ],
  }, body)
}
