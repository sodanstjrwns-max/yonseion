import { html, raw } from 'hono/html'
import { Layout, Breadcrumb } from '../components/layout'
import { clinic } from '../data/clinic'
import { seoRegions, seoTreatments, areaCombos } from '../data/facilities'
import { getTreatment } from '../data/treatments'
import { doctors, doctorsBySpecialty } from '../data/doctors'
import { faqGroups } from '../data/faqs'
import { breadcrumbSchema, faqSchema, placeSchema, areaServiceSchema, localServiceSchema, speakableSchema } from '../lib/schema'
import { UljuAreaPage, ULJU_SLUG } from './area-ulju'

// ============================================================================
// 지역 SEO 페이지 — /area/[region]-[treatment] (14지역 × 4진료 = 56페이지)
// 각 페이지: 지역 키워드 H1 + 진료 핵심 답변 + 교통 + FAQ + CTA
// ============================================================================

const faqKeyByTreatment: Record<string, string> = {
  'all-on-x': 'implant',
  'esthetic-prosthetics': 'esthetic',
  'adhesive-restoration': 'adhesive',
  'implant-guide': 'implant',
}

export function AreaIndexPage() {
  const crumb = [{ name: '홈', url: '/' }, { name: '지역별 진료 안내', url: '/area' }]
  // 행정구역별 그룹핑 (로컬 SEO 클러스터 + 가독성)
  const groups: { label: string; regions: typeof seoRegions }[] = [
    { label: '부산 동래구 (병원 소재지)', regions: seoRegions.filter((r) => r.admin === '부산광역시 동래구') },
    { label: '부산 인접 자치구', regions: seoRegions.filter((r) => ['부산광역시 금정구', '부산광역시 연제구', '부산광역시 부산진구', '부산광역시 해운대구', '부산광역시 수영구', '부산광역시 남구', '부산광역시 북구', '부산광역시 동구'].includes(r.admin)) },
    { label: '경남·울산 인근 도시', regions: seoRegions.filter((r) => r.admin.startsWith('경상남도') || r.admin.startsWith('울산')) },
  ]
  const body = html`
  <section class="page-hero">
    <div class="container">
      <p class="eyebrow">Area Guide</p>
      <h1>지역별 진료 안내</h1>
      <p class="lead" id="area-answer">부산 동래구 온천장에 위치한 ${clinic.nameKo}는 ${clinic.subway} 거리로,<br>동래·금정·연제·부산진구는 물론 양산·김해까지<br>폭넓게 내원하시는 환자분들을 진료합니다.</p>
    </div>
  </section>
  ${Breadcrumb(crumb)}
  <section class="section--tight">
    <div class="container">
      <p data-reveal style="max-width:62ch;margin-bottom:1.4rem;line-height:1.8">병원 위치·진료시간·의료진·진료 범위를 한 번에 보시려면 <a href="/area/oncheonjang" class="link-arrow">온천장 치과</a> 안내를 확인하세요.</p>
      <p class="muted" data-reveal style="max-width:62ch;margin-bottom:2.4rem;line-height:1.8">
        아래에서 거주 지역과 진료를 선택하시면, 해당 지역에서 ${clinic.nameShort}까지 오시는 길과
        진료별 핵심 안내를 확인하실 수 있습니다. 총 <strong>${seoRegions.length}개 지역 × ${seoTreatments.length}개 진료</strong> 안내가 준비되어 있습니다.
      </p>
      ${raw(groups.map((g) => `
        <div data-reveal style="margin-bottom:3rem">
          <h2 style="font-family:var(--serif-kr);font-size:1.25rem;margin-bottom:1.4rem;color:var(--gold)">${g.label}</h2>
          ${g.regions.map((r) => `
            <div style="margin-bottom:1.6rem">
              <h3 style="font-size:1rem;font-weight:600;color:var(--ink);margin-bottom:.7rem">${r.slug === ULJU_SLUG ? '울산 울주' : r.full} <span style="font-weight:400;color:var(--mist);font-size:.85rem">· ${r.slug === ULJU_SLUG ? '원거리 — 상담·내원 일정 안내' : r.distance}</span></h3>
              <div style="display:flex;gap:.6rem;flex-wrap:wrap">
                ${seoTreatments.map((t) => `<a href="/area/${r.slug}-${t.slug}" class="faq-tab">${r.slug === ULJU_SLUG ? `울주에서 ${t.name} 상담` : `${r.name} ${t.name}`}</a>`).join('')}
              </div>
            </div>`).join('')}
        </div>`).join(''))}
    </div>
  </section>
  `
  return Layout({
    title: `지역별 진료 안내 | ${clinic.nameKo} — 부산 동래·금정·연제`,
    description: `부산 동래·금정·연제·부산진구·해운대 + 양산·김해 — 지역별 임플란트·심미보철·충치치료 안내. ${clinic.nameKo}, ${clinic.subway}.`,
    path: '/area',
    jsonLd: [breadcrumbSchema(crumb), speakableSchema(['#area-answer'])],
  }, body)
}

export function AreaPage(comboSlug: string) {
  const combo = areaCombos().find((c) => c.slug === comboSlug)
  if (!combo) return null
  const { region, treatment } = combo
  const tx = getTreatment(treatment.slug)
  if (!tx) return null
  // 울산 울주(원거리) — 현지 병원처럼 보이는 템플릿 대신 정직한 원거리 내원 안내 (2026-10-08)
  if (region.slug === ULJU_SLUG) return UljuAreaPage(treatment.slug, treatment.name)

  const docs = doctorsBySpecialty(treatment.slug)
  const doc = docs[0]
  const faqKey = faqKeyByTreatment[treatment.slug] || 'general'
  const faqs = (faqGroups[faqKey]?.faqs || []).slice(0, 4)
  const title = `${region.name} ${treatment.keyword}`
  const crumb = [{ name: '홈', url: '/' }, { name: '지역별 안내', url: '/area' }, { name: title, url: `/area/${comboSlug}` }]

  // 지도 임베드 — 병원 주소 기준 (로컬 SEO: hasMap + 사용자 신뢰)
  const mapQuery = encodeURIComponent(clinic.address)
  // 같은 지역 내 다른 진료 (인링크 메시 — 지역 클러스터 강화)
  const sameRegionTx = seoTreatments.filter((t) => t.slug !== treatment.slug)

  const body = html`
  <section class="page-hero">
    <div class="container">
      <p class="eyebrow">${region.full}</p>
      <h1 style="font-size:var(--t-h2)">${title},<br>연세온치과에서</h1>
      <p class="lead">${region.full}에서 ${treatment.keyword}를 알아보고 계신가요?<br>${clinic.nameKo}는 ${region.name}에서 ${region.distance} 거리(${region.transit})에 있어<br>가깝게 내원하실 수 있습니다.</p>
    </div>
  </section>
  ${Breadcrumb(crumb)}

  <section class="section--tight">
    <div class="container">
      <div class="detail-grid">
        <div>
          <article class="prose" data-reveal>
            <p class="hub-local-line muted" style="font-size:.9rem;line-height:1.75;margin-bottom:1.6rem"><i class="fas fa-location-dot" style="color:var(--gold);margin-right:.4rem"></i>병원 위치·진료시간·의료진 종합 안내: <a href="/area/oncheonjang" style="color:var(--navy);font-weight:600;text-decoration:underline">온천장 치과</a></p>
            <h2>${region.name}에서 ${treatment.keyword}, 어디서 받아야 할까요?</h2>
            <p>${tx.hero}</p>
            <h2>연세온치과의 ${tx.name}</h2>
            ${raw(tx.sections.slice(0, 2).map((s) => `<h3>${s.q}</h3><p>${s.a}</p>`).join(''))}
            <p><a href="/treatments/${tx.slug}" class="link-arrow">${tx.name} 자세히 보기 <i class="fas fa-arrow-right"></i></a></p>

            <h2>${region.name}에서 오시는 길</h2>
            <p>${clinic.nameKo}는 <strong>${clinic.address}</strong>에 있습니다. ${clinic.directions}</p>
            <p><strong>${region.name}에서 출발</strong>하실 경우, ${region.transit}로 이동하시면 약 <strong>${region.distance}</strong> 거리입니다. ${region.landmark} 인근에 계시다면 더욱 가깝게 방문하실 수 있습니다.</p>
            <p class="muted" style="font-size:.86rem">차량 방문 시 건물 주차가 가능하며, 자세한 주차 안내는 <a href="/directions">오시는 길</a> 페이지에서 확인하실 수 있습니다.</p>
          </article>

          <div class="map-embed" data-reveal style="margin-top:2rem;border-radius:14px;overflow:hidden;box-shadow:0 8px 30px rgba(20,36,62,.08)">
            <iframe src="https://maps.google.com/maps?q=${mapQuery}&z=16&output=embed"
              width="100%" height="380" style="border:0;display:block;filter:grayscale(.12)"
              loading="lazy" referrerpolicy="no-referrer-when-downgrade"
              title="${region.name}에서 ${clinic.nameKo} 위치 — ${clinic.address}"></iframe>
          </div>
          <div data-reveal style="display:flex;gap:.6rem;flex-wrap:wrap;margin-top:.9rem">
            <a href="https://map.naver.com/v5/search/${mapQuery}" target="_blank" rel="noopener" class="faq-tab"><i class="fas fa-map-marker-alt"></i> 네이버지도</a>
            <a href="https://map.kakao.com/?q=${mapQuery}" target="_blank" rel="noopener" class="faq-tab"><i class="fas fa-map"></i> 카카오맵</a>
            <a href="${clinic.mapUrl}" target="_blank" rel="noopener" class="faq-tab"><i class="fas fa-location-dot"></i> 네이버플레이스</a>
          </div>

          <div class="prose" data-reveal style="margin-top:2.5rem">
            <h2>${region.name} 거주민을 위한 다른 진료</h2>
            <p>연세온치과는 ${region.full} 지역 환자분들께 ${treatment.keyword} 외에도 다양한 진료를 제공합니다.</p>
            <div style="display:flex;gap:.6rem;flex-wrap:wrap;margin-top:.4rem">
              ${raw(sameRegionTx.map((t) => `<a href="/area/${region.slug}-${t.slug}" class="faq-tab">${region.name} ${t.name}</a>`).join(''))}
            </div>
          </div>

          <div style="margin-top:3.5rem" data-reveal>
            <h2 style="font-family:var(--serif-kr);font-size:var(--t-h3);margin-bottom:1rem">자주 묻는 질문</h2>
            <div class="faq-list">
              ${raw(faqs.map((f) => `
                <div class="faq-item">
                  <button class="faq-q"><span>${f.q}</span><i class="fas fa-plus"></i></button>
                  <div class="faq-a"><div class="faq-a-inner"><p>${f.a}</p></div></div>
                </div>`).join(''))}
            </div>
          </div>
        </div>
        <aside class="sidebar">
          ${raw(doc ? `
          <div class="sidebar-box">
            <h4>담당 의료진</h4>
            <p style="font-weight:600;color:var(--ink)">${doc.name} ${doc.role}</p>
            <p class="muted" style="font-size:.85rem;margin:.4rem 0 .8rem">${doc.title}</p>
            <a href="/doctors/${doc.slug}" class="link-arrow" style="font-size:.88rem">소개 보기 <i class="fas fa-arrow-right"></i></a>
          </div>` : '')}
          <div class="sidebar-box">
            <h4>${region.name} → 병원 교통</h4>
            <p style="font-size:.86rem;line-height:1.7">${region.transit}</p>
            <p style="font-size:.86rem;font-weight:600;color:var(--ink);margin-top:.4rem"><i class="fas fa-location-arrow" style="font-size:.78rem;color:var(--gold)"></i> 약 ${region.distance}</p>
            <p class="muted" style="font-size:.8rem;margin-top:.4rem">인근: ${region.landmark}</p>
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
            <a href="/directions">오시는 길</a>
          </div>
          <!-- 병원 종합 안내(허브) 링크는 본문 첫 줄로 이동 — 페이지당 허브 링크 2개(본문 1 + 푸터 1) -->
          <div class="sidebar-box">
            <h4>인근 지역 안내</h4>
            ${raw(seoRegions.filter((r) => r.slug !== region.slug).slice(0, 4).map((r) => `<a href="/area/${r.slug}-${treatment.slug}">${r.name} ${treatment.name}</a>`).join(''))}
          </div>
        </aside>
      </div>
    </div>
  </section>

  <section class="section cta-band">
    <div class="container">
      <h2 data-reveal>${region.name}에서 가까운 정밀 진료,<br>상담부터 시작하세요.</h2>
      <a href="/reservation" class="btn btn-primary" data-reveal data-reveal-delay="1" style="margin-top:2rem">예약 상담 신청 <i class="fas fa-arrow-right"></i></a>
    </div>
  </section>
  `
  return Layout({
    title: `${title} | ${clinic.nameKo} — ${clinic.subway}`,
    description: `${region.full} ${treatment.keyword} — ${clinic.nameKo}. ${tx.short}. ${clinic.subway}, ${clinic.hoursSummary}.`,
    path: `/area/${comboSlug}`,
    jsonLd: [
      breadcrumbSchema(crumb),
      areaServiceSchema({
        regionName: region.name, regionFull: region.full, regionAdmin: region.admin,
        treatmentName: treatment.name, treatmentSlug: treatment.slug, treatmentKeyword: treatment.keyword,
        path: `/area/${comboSlug}`,
      }),
      localServiceSchema({
        treatmentName: treatment.name, treatmentSlug: treatment.slug,
        regionAdmin: region.admin, regionName: region.name,
      }),
      placeSchema(region.full, region.admin),
      faqSchema(faqs),
    ],
  }, body)
}

// ============================================================================
// 대표 키워드 허브 — "온천장 치과" (/area/oncheonjang) · 2026-10-08 지역 SEO 웨이브
// 지역×진료 조합 페이지(/area/oncheonjang-*)와 별개로, 온천장·동래 주민이 "온천장 치과"로
// 찾을 때 병원 위치·교통·진료시간·의료진·진료 범위·FAQ를 한 페이지에서 답한다.
// 사실 정보는 clinic.ts·doctors.ts·treatments.ts·facilities.ts 값만 사용.
// ============================================================================
export const HUB_SLUG = 'oncheonjang'
export const HUB_DATE = '2026-10-08'

export function OncheonjangHubPage() {
  const path = `/area/${HUB_SLUG}`
  const crumb = [{ name: '홈', url: '/' }, { name: '지역별 안내', url: '/area' }, { name: '온천장 치과', url: path }]
  const doc = doctors[0]
  const mapQuery = encodeURIComponent(clinic.address)
  const txOrder = ['adhesive-restoration', 'esthetic-prosthetics', 'all-on-x', 'implant-guide', 'conservative', 'tmj-occlusion']
  const txs = txOrder.map((s) => getTreatment(s)).filter(Boolean)
  const nearRegions = ['oncheon', 'dongnae', 'myeongnyun', 'geumjeong']
    .map((s) => seoRegions.find((r) => r.slug === s)).filter(Boolean) as typeof seoRegions

  const faqs = [
    { q: '온천장역 몇 번 출구로 나오면 되나요?', a: `도시철도 1호선 온천장역 1번 또는 5번 출구로 나오시면 걸어서 3분 거리입니다. 1층에 베스킨라빈스가 있는 허브메디컬타워 901호가 ${clinic.nameShort}입니다.` },
    { q: '수요일이나 일요일에도 진료하나요?', a: '수요일과 일요일·공휴일은 휴진입니다. 월·화·목·금요일은 09:30~18:30(점심 13:00~14:00), 토요일은 09:30~13:00까지 점심시간 없이 진료합니다.' },
    { q: '차를 가지고 가도 주차할 수 있나요?', a: `건물 주차장을 이용하실 수 있습니다. 주차 가능 시간 등 세부 사항은 방문 전 전화(${clinic.phone})로 확인해 주시면 안내해 드립니다.` },
    { q: '동래역이나 명륜역 근처에 사는데 가기 편한가요?', a: '1호선 한 노선으로 이어져 명륜역에서는 한 정거장, 동래역에서는 두 정거장이면 온천장역에 도착합니다. 사직동·안락동 쪽에서는 버스나 차량으로 10분 안팎 걸립니다.' },
    { q: '스케일링이나 충치 치료 같은 건강보험 진료도 하나요?', a: '네. 충치치료부터 잇몸치료, 스케일링까지 건강보험이 적용되는 보존·치주치료를 진료합니다. 보험 적용 여부는 항목과 조건에 따라 달라 진료 전에 미리 안내해 드립니다.' },
    { q: '예약은 어떻게 하나요?', a: `홈페이지 예약 상담 신청, 전화(${clinic.phone}), 네이버 예약으로 하실 수 있습니다. 예약 후 내원하시면 대기 시간을 줄이는 데 도움이 됩니다.` },
  ]

  const body = html`
  <section class="page-hero">
    <div class="container">
      <p class="eyebrow">부산 동래구 온천동 · 온천장역 1·5번 출구 도보 3분</p>
      <h1 style="font-size:var(--t-h2)">온천장 치과, ${clinic.nameKo}</h1>
      <p class="lead" id="hub-answer">온천장 치과를 찾고 계신다면, ${clinic.nameKo}는 1호선 온천장역 1·5번 출구에서 걸어서 3분 거리인 ${clinic.address}에 있습니다. ${doc.title.replace(' (더블보더)', '')}인 ${doc.name} ${doc.role}이 충치·잇몸 같은 일상 진료부터 심미보철, All-on-X 전체임플란트까지 직접 진료합니다.</p>
    </div>
  </section>
  ${Breadcrumb(crumb)}

  <section class="section--tight">
    <div class="container">
      <div class="detail-grid">
        <div>
          <article class="prose" data-reveal>
            <h2>온천장역에서 연세온치과까지</h2>
            <p>${clinic.nameShort}는 온천장역 1·5번 출구에서 도보 3분, 1층에 베스킨라빈스가 있는 허브메디컬타워 901호에 있습니다. 동래온천·허심청이 있는 온천장 일대에서는 걸어서 오시는 분이 많고, 금강공원 입구 쪽 온천동에서도 도보 5~10분이면 도착합니다.</p>
            <p>지하철은 1호선 한 노선으로 연결됩니다. 명륜역에서는 한 정거장, 동래역에서는 두 정거장이며, 부산대역·장전역 등 금정구 방면에서도 몇 정거장이면 온천장역에 닿습니다. 서면역에서도 환승 없이 15분 안팎입니다. 자가용으로 오시면 건물 주차장을 이용하실 수 있고, 주차 세부 사항은 방문 전 전화(<a href="tel:${clinic.phoneRaw}">${clinic.phone}</a>)로 확인해 주세요.</p>

            <h2>진료시간 — 수요일은 휴진합니다</h2>
            <table class="hub-hours">
              <tbody>
                ${raw(clinic.hours.map((h) => `<tr><th scope="row">${h.day}</th><td>${h.time}${h.note ? ` <span class="muted">(${h.note})</span>` : ''}</td></tr>`).join(''))}
              </tbody>
            </table>
            <p>토요일은 오후 1시까지 점심시간 없이 진료합니다. 진료 내용에 따라 걸리는 시간이 달라, 예약하고 오시면 기다리는 시간을 줄이는 데 도움이 됩니다.</p>

            <h2>진료하는 의료진</h2>
            <p><a href="/doctors/${doc.slug}">${doc.name} ${doc.role}</a>은 ${doc.licenses.join('·')}입니다. ${doc.career.slice(0, 3).join(', ')} 경력을 바탕으로, 진단과 치료계획을 직접 설명하고 처음 안내한 계획대로 치료가 이어지도록 진료합니다.</p>

            <h2>온천장 연세온치과에서 받을 수 있는 진료</h2>
            <p>자연치아를 최대한 살리는 생체모방치의학을 진료의 중심에 두고, 아래 진료를 하고 있습니다. 각 항목을 누르면 진료 과정과 비용 안내를 보실 수 있습니다.</p>
            <ul class="hub-tx">
              ${raw(txs.map((t) => `<li><a href="/treatments/${t!.slug}"><strong>${t!.name}</strong></a> — ${t!.short}</li>`).join(''))}
            </ul>
            <p>동래 치과를 찾는 분들이 많이 묻는 비용은 <a href="/pricing">비급여 수가 안내</a>에서, 실제 진료 사례는 <a href="/cases/gallery">치료 케이스</a>에서 확인하실 수 있습니다.</p>
          </article>

          <div class="map-embed" data-reveal style="margin-top:2rem;border-radius:14px;overflow:hidden;box-shadow:0 8px 30px rgba(20,36,62,.08)">
            <iframe src="https://maps.google.com/maps?q=${mapQuery}&z=17&output=embed"
              width="100%" height="380" style="border:0;display:block;filter:grayscale(.12)"
              loading="lazy" referrerpolicy="no-referrer-when-downgrade"
              title="온천장 치과 ${clinic.nameKo} 위치 — ${clinic.address}"></iframe>
          </div>
          <div data-reveal style="display:flex;gap:.6rem;flex-wrap:wrap;margin-top:.9rem">
            <a href="${clinic.mapUrl}" target="_blank" rel="noopener" class="faq-tab"><i class="fas fa-location-dot"></i> 네이버플레이스</a>
            <a href="https://map.naver.com/v5/search/${mapQuery}" target="_blank" rel="noopener" class="faq-tab"><i class="fas fa-map-marker-alt"></i> 네이버지도</a>
            <a href="https://map.kakao.com/?q=${mapQuery}" target="_blank" rel="noopener" class="faq-tab"><i class="fas fa-map"></i> 카카오맵</a>
            <a href="/reservation" class="faq-tab"><i class="fas fa-calendar-check"></i> 예약 상담 신청</a>
          </div>

          <div class="prose" data-reveal style="margin-top:3rem">
            <h2>동래 이웃이 자주 묻는 질문</h2>
            <div class="enc-faq">
              ${raw(faqs.map((f) => `<details><summary>${f.q}</summary><p>${f.a}</p></details>`).join(''))}
            </div>
          </div>

          <div class="prose" data-reveal style="margin-top:2.5rem">
            <h2>온천장 주변 지역에서 오시는 분께</h2>
            <p>온천동·명륜동·동래역 일대와 부산대가 있는 금정구에서 오시는 분들을 위해 진료별 안내를 따로 정리했습니다.</p>
            <div style="display:flex;gap:.6rem;flex-wrap:wrap;margin-top:.4rem">
              ${raw(seoTreatments.map((t) => `<a href="/area/oncheonjang-${t.slug}" class="faq-tab">온천장 ${t.name}</a>`).join(''))}
              ${raw(nearRegions.map((r) => `<a href="/area/${r.slug}-implant-guide" class="faq-tab">${r.name} 임플란트</a>`).join(''))}
              <a href="/area" class="faq-tab">지역별 안내 전체</a>
            </div>
          </div>
        </div>
        <aside class="sidebar">
          <div class="sidebar-box">
            <h4>${clinic.nameKo}</h4>
            <p style="font-size:.86rem;line-height:1.7">${clinic.address}</p>
            <p style="font-size:.86rem;font-weight:600;color:var(--ink);margin-top:.4rem">${clinic.subway}</p>
          </div>
          <div class="sidebar-box">
            <h4>진료시간</h4>
            <p style="font-size:.88rem;line-height:1.8">${clinic.hoursSummary}</p>
            <p class="muted" style="font-size:.82rem">${clinic.closedDays}</p>
          </div>
          <div class="sidebar-box">
            <h4>상담·예약</h4>
            <a href="/reservation">예약 상담 신청</a>
            <a href="tel:${clinic.phoneRaw}">${clinic.phone}</a>
            <a href="${clinic.sns.naverBooking}" target="_blank" rel="noopener">네이버 예약</a>
            <a href="/directions">오시는 길 상세</a>
          </div>
        </aside>
      </div>
    </div>
  </section>
  <style>
    .hub-hours{width:100%;max-width:30rem;border-collapse:collapse;margin:0 0 1.2rem;font-size:.95rem}
    .hub-hours th,.hub-hours td{border-bottom:1px solid var(--line);padding:.55rem .4rem;text-align:left}
    .hub-hours th{font-weight:600;color:var(--ink);width:9rem}
    .hub-tx{list-style:none;margin:0 0 1.4rem;padding:0}
    .hub-tx li{border-bottom:1px solid var(--line);padding:.7rem 0;margin:0}
    .enc-faq details{border-bottom:1px solid var(--line);padding:.2rem 0}
    .enc-faq summary{cursor:pointer;font-weight:600;color:var(--ink);padding:1rem 0;list-style:none}
    .enc-faq summary::-webkit-details-marker{display:none}
    .enc-faq summary::before{content:'Q. ';color:var(--gold-2)}
    .enc-faq details p{margin:0 0 1rem}
  </style>

  <section class="section cta-band">
    <div class="container">
      <h2 data-reveal>온천장역 3분 거리,<br>상담부터 편하게 시작하세요.</h2>
      <a href="/reservation" class="btn btn-primary" data-reveal data-reveal-delay="1" style="margin-top:2rem">예약 상담 신청 <i class="fas fa-arrow-right"></i></a>
    </div>
  </section>
  `
  const title = '온천장 치과 · 동래 치과 | 연세온치과'
  const description = `온천장 치과 ${clinic.nameKo} — 1호선 온천장역 1·5번 출구 도보 3분(${clinic.address}). 치과보철과·통합치의학과 전문의 진료, ${clinic.hoursSummary}, ${clinic.closedDays}.`
  return Layout({
    title,
    description,
    path,
    jsonLd: [
      breadcrumbSchema(crumb),
      {
        '@context': 'https://schema.org',
        '@type': 'MedicalWebPage',
        '@id': `${clinic.domain}${path}#webpage`,
        url: `${clinic.domain}${path}`,
        name: title,
        description,
        inLanguage: 'ko',
        isPartOf: { '@id': `${clinic.domain}/#website` },
        about: { '@id': `${clinic.domain}/#clinic` },
        mainEntity: { '@id': `${clinic.domain}/#clinic` },
        dateModified: HUB_DATE,
        publisher: { '@id': `${clinic.domain}/#clinic` },
        speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '#hub-answer'] },
      },
      {
        '@context': 'https://schema.org',
        '@type': ['Dentist', 'LocalBusiness', 'MedicalBusiness'],
        '@id': `${clinic.domain}/#clinic`,
        name: clinic.nameKo,
        url: clinic.domain,
        telephone: clinic.phone,
        address: { '@type': 'PostalAddress', streetAddress: clinic.address, addressLocality: clinic.addressLocality, addressRegion: clinic.addressRegion, postalCode: clinic.postalCode, addressCountry: 'KR' },
        areaServed: [
          { '@type': 'Place', name: '부산 동래구 온천장' },
          { '@type': 'AdministrativeArea', name: '부산광역시 동래구 온천동' },
          { '@type': 'AdministrativeArea', name: '부산광역시 동래구' },
          { '@type': 'AdministrativeArea', name: '부산광역시 금정구' },
          { '@type': 'AdministrativeArea', name: '부산광역시 연제구' },
        ],
      },
      faqSchema(faqs),
    ],
  }, body)
}
