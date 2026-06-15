import { html, raw } from 'hono/html'
import { Layout, Breadcrumb } from '../components/layout'
import { clinic } from '../data/clinic'
import { seoRegions, seoTreatments, areaCombos } from '../data/facilities'
import { getTreatment } from '../data/treatments'
import { doctorsBySpecialty } from '../data/doctors'
import { faqGroups } from '../data/faqs'
import { breadcrumbSchema, faqSchema, placeSchema, areaServiceSchema, localServiceSchema, speakableSchema } from '../lib/schema'

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
    { label: '부산 인접 자치구', regions: seoRegions.filter((r) => ['부산광역시 금정구', '부산광역시 연제구', '부산광역시 부산진구', '부산광역시 해운대구'].includes(r.admin)) },
    { label: '경남 인근 도시', regions: seoRegions.filter((r) => r.admin.startsWith('경상남도')) },
  ]
  const body = html`
  <section class="page-hero">
    <div class="container">
      <p class="eyebrow">Area Guide</p>
      <h1>지역별 진료 안내</h1>
      <p class="lead" id="area-answer">부산 동래구 온천장에 위치한 ${clinic.nameKo}는 ${clinic.subway} 거리로,
      동래·금정·연제·부산진구는 물론 양산·김해까지 폭넓게 내원하시는 환자분들을 진료합니다.</p>
    </div>
  </section>
  ${Breadcrumb(crumb)}
  <section class="section--tight">
    <div class="container">
      <p class="muted" data-reveal style="max-width:62ch;margin-bottom:2.4rem;line-height:1.8">
        아래에서 거주 지역과 진료를 선택하시면, 해당 지역에서 ${clinic.nameShort}까지 오시는 길과
        진료별 핵심 안내를 확인하실 수 있습니다. 총 <strong>${seoRegions.length}개 지역 × ${seoTreatments.length}개 진료</strong> 안내가 준비되어 있습니다.
      </p>
      ${raw(groups.map((g) => `
        <div data-reveal style="margin-bottom:3rem">
          <h2 style="font-family:var(--serif-kr);font-size:1.25rem;margin-bottom:1.4rem;color:var(--gold)">${g.label}</h2>
          ${g.regions.map((r) => `
            <div style="margin-bottom:1.6rem">
              <h3 style="font-size:1rem;font-weight:600;color:var(--ink);margin-bottom:.7rem">${r.full} <span style="font-weight:400;color:var(--mist);font-size:.85rem">· ${r.transit.length > 28 ? r.distance : r.distance}</span></h3>
              <div style="display:flex;gap:.6rem;flex-wrap:wrap">
                ${seoTreatments.map((t) => `<a href="/area/${r.slug}-${t.slug}" class="faq-tab">${r.name} ${t.name}</a>`).join('')}
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
      <p class="lead">${region.full}에서 ${treatment.keyword}를 알아보고 계신가요?
      ${clinic.nameKo}는 ${region.name}에서 ${region.distance} 거리(${region.transit})에 있어 가깝게 내원하실 수 있습니다.</p>
    </div>
  </section>
  ${Breadcrumb(crumb)}

  <section class="section--tight">
    <div class="container">
      <div class="detail-grid">
        <div>
          <article class="prose" data-reveal>
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
      placeSchema(region.full),
      faqSchema(faqs),
    ],
  }, body)
}
