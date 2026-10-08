// ============================================================================
// JSON-LD 구조화 데이터 빌더 (§G-2 전종)
// ============================================================================
import { clinic } from '../data/clinic'
import type { Doctor } from '../data/doctors'
import type { Treatment } from '../data/treatments'

const BASE = clinic.domain

// --- Dentist / LocalBusiness / Organization (전역) ---
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['Dentist', 'LocalBusiness', 'MedicalBusiness'],
    '@id': BASE + '/#clinic',
    name: clinic.nameKo,
    alternateName: clinic.nameEn,
    url: BASE,
    // 로고 — 헤더·푸터에 쓰는 실제 로고 자산(흰 배경 가로형)
    logo: {
      '@type': 'ImageObject',
      '@id': BASE + '/#logo',
      url: BASE + '/static/img/logo-horizontal-color.png',
      contentUrl: BASE + '/static/img/logo-horizontal-color.png',
      width: 1024,
      height: 352,
      caption: clinic.nameKo,
    },
    telephone: clinic.phone,
    email: clinic.email,
    slogan: clinic.tagline,
    description: clinic.mission,
    foundingDate: String(clinic.openedYear),
    image: BASE + '/static/img/og-default.jpg',
    priceRange: '₩₩',
    medicalSpecialty: ['Dentistry', 'CosmeticDentistry', 'Prosthodontics'],
    address: {
      '@type': 'PostalAddress',
      streetAddress: clinic.address,
      addressLocality: clinic.addressLocality,
      addressRegion: clinic.addressRegion,
      postalCode: clinic.postalCode,
      addressCountry: 'KR',
    },
    geo: { '@type': 'GeoCoordinates', latitude: clinic.geo.lat, longitude: clinic.geo.lng },
    hasMap: clinic.mapUrl,
    // 서비스 제공 지역 — 로컬팩(지도) 진입 핵심 시그널
    areaServed: [
      ...clinic.areaServed.map((a) => ({ '@type': 'AdministrativeArea', name: a })),
      // 서비스 반경(GeoCircle) — 병원 중심 도달 범위 명시
      {
        '@type': 'GeoCircle',
        geoMidpoint: { '@type': 'GeoCoordinates', latitude: clinic.geo.lat, longitude: clinic.geo.lng },
        geoRadius: String(clinic.serviceRadiusKm * 1000),
      },
    ],
    // 대중교통 접근 — 로컬 SEO 보조
    publicAccess: true,
    isAccessibleForFree: false,
    smokingAllowed: false,
    // 진료 시설 — 휠체어 접근 등 (가능 시 확장)
    availableLanguage: { '@type': 'Language', name: 'Korean' },
    currenciesAccepted: 'KRW',
    paymentAccepted: '현금, 카드',
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Thursday', 'Friday'], opens: '09:30', closes: '18:30' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '09:30', closes: '13:00' },
    ],
    // 핵심 진료 서비스 — makesOffer (검색 의도 매칭)
    makesOffer: [
      { '@type': 'Offer', itemOffered: { '@type': 'MedicalProcedure', name: '임플란트', url: BASE + '/treatments/implant-guide' } },
      { '@type': 'Offer', itemOffered: { '@type': 'MedicalProcedure', name: 'All-on-X 전체임플란트', url: BASE + '/treatments/all-on-x' } },
      { '@type': 'Offer', itemOffered: { '@type': 'MedicalProcedure', name: '심미보철', url: BASE + '/treatments/esthetic-prosthetics' } },
      { '@type': 'Offer', itemOffered: { '@type': 'MedicalProcedure', name: '충치치료(접착수복)', url: BASE + '/treatments/adhesive-restoration' } },
    ],
    sameAs: [clinic.sns.instagram, clinic.sns.youtube, clinic.sns.blog, clinic.sns.naverPlace].filter(Boolean),
  }
}

// --- Person (의료진) ---
export function personSchema(doc: Doctor) {
  return {
    '@context': 'https://schema.org',
    // 의료진 = Physician (PFWE-SPEC §3.3 — Person 속성(jobTitle·hasCredential 등) 유지 위해 병기)
    '@type': ['Person', 'Physician'],
    '@id': BASE + '/doctors/' + doc.slug + '#person',
    name: doc.name,
    jobTitle: doc.role + ' · ' + doc.title,
    medicalSpecialty: 'https://schema.org/Dentistry',
    worksFor: { '@id': BASE + '/#clinic' },
    image: BASE + doc.photo,
    url: BASE + '/doctors/' + doc.slug,
    hasCredential: [...doc.licenses, ...doc.career].map((c) => ({
      '@type': 'EducationalOccupationalCredential',
      name: c,
    })),
    memberOf: doc.memberships.map((m) => ({ '@type': 'Organization', name: m })),
  }
}

// --- MedicalProcedure (시술별) ---
export function procedureSchema(t: Treatment) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    '@id': BASE + '/treatments/' + t.slug + '#procedure',
    name: t.name,
    url: BASE + '/treatments/' + t.slug,
    description: t.hero,
    procedureType: 'https://schema.org/SurgicalProcedure',
    relevantSpecialty: { '@type': 'MedicalSpecialty', name: 'Dentistry' },
    provider: { '@id': BASE + '/#clinic' },
  }
  // 진료 단계 → howPerformed (구글 리치 결과 + AEO 신호)
  if (t.process?.length) {
    schema.howPerformed = t.process.map((p) => `${p.step}: ${p.desc}`).join(' / ')
  }
  // 대상 증상 → indication (이런 분께 권합니다)
  if (t.symptoms?.length) {
    schema.indication = t.symptoms.map((s) => ({ '@type': 'MedicalIndication', name: s }))
  }
  if (t.caution) schema.followup = t.caution
  // 회복·관리 단계 → preparation/recovery 보조 신호
  if (t.aftercare?.length) {
    schema.followup = [t.caution, t.aftercare.map((a) => `${a.phase}: ${a.desc}`).join(' / ')]
      .filter(Boolean)
      .join(' ')
  }
  // 세부 시술 → subjectOf (허브-스포크 연결)
  if (t.procedures?.length) {
    schema.subjectOf = t.procedures.map((p) => ({
      '@type': 'MedicalProcedure',
      name: p.name,
      description: p.desc,
    }))
  }
  // 연관 백과 용어 → relatedLink (내부 링크 메시 + 토픽 클러스터)
  if (t.encyclopediaRefs?.length) {
    schema.relatedLink = t.encyclopediaRefs.map((slug) => BASE + '/encyclopedia/' + slug)
  }
  return schema
}

// --- DataFeed/Table 대체: 비교표를 Q&A 형태로(AEO에 더 잘 잡힘) ---
// 비교표 제목을 질문으로, 표 내용을 답변 텍스트로 직렬화
export function compareQaSchema(opts: {
  title: string
  cols: string[]
  rows: string[][]
}) {
  const answer = opts.rows
    .map((r) => `${r[0]} — ${opts.cols.slice(1).map((c, i) => `${c}: ${r[i + 1]}`).join(', ')}`)
    .join(' / ')
  return {
    '@context': 'https://schema.org',
    '@type': 'Question',
    name: opts.title,
    acceptedAnswer: { '@type': 'Answer', text: answer },
  }
}

// --- HowTo (진료 단계 — 구글 단계별 리치 결과) ---
export function howToSchema(opts: {
  name: string
  description: string
  steps: { step: string; desc: string }[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: opts.name,
    description: opts.description,
    step: opts.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.step,
      text: s.desc,
    })),
  }
}

// --- FAQPage ---
export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
}

// --- BreadcrumbList ---
export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: BASE + it.url,
    })),
  }
}

// --- Article / MedicalWebPage (칼럼) ---
export function articleSchema(opts: {
  title: string; description: string; path: string; image?: string;
  datePublished: string; dateModified?: string; authorSlug?: string; authorName?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': ['Article', 'MedicalWebPage'],
    headline: opts.title,
    description: opts.description,
    url: BASE + opts.path,
    image: opts.image ? BASE + opts.image : undefined,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified || opts.datePublished,
    author: opts.authorName ? { '@type': 'Person', name: opts.authorName, url: opts.authorSlug ? BASE + '/doctors/' + opts.authorSlug : undefined } : { '@id': BASE + '/#clinic' },
    reviewedBy: opts.authorName
      ? { '@type': ['Person', 'Physician'], ...(opts.authorSlug ? { '@id': BASE + '/doctors/' + opts.authorSlug + '#person' } : {}), name: opts.authorName }
      : undefined,
    publisher: { '@id': BASE + '/#clinic' },
  }
}

// --- City / Place (지역 SEO) ---
export function placeSchema(regionFull: string, regionAdmin?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'City',
    name: regionFull,
    // 상위 광역 행정구역 — 지역명 첫 단어(경상남도·울산광역시 등). 부산 외 지역이 '부산광역시'에 속한 것으로 나오던 오류 수정
    containedInPlace: { '@type': 'AdministrativeArea', name: regionAdmin ? regionAdmin.split(' ')[0] : clinic.addressRegion },
  }
}

// --- 지역 페이지용 MedicalBusiness + areaServed + Service (로컬 SEO 강화) ---
// "이 병원이 [지역]에서 [진료]를 제공한다"를 구글에 명시 → 로컬팩 진입
export function areaServiceSchema(opts: {
  regionName: string; regionFull: string; regionAdmin: string;
  treatmentName: string; treatmentSlug: string; treatmentKeyword: string;
  path: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': ['MedicalBusiness', 'Dentist'],
    '@id': BASE + opts.path + '#localbusiness',
    name: `${clinic.nameKo} — ${opts.regionName} ${opts.treatmentName}`,
    description: `${opts.regionFull} ${opts.treatmentKeyword} — ${clinic.nameKo}. ${clinic.subway}.`,
    url: BASE + opts.path,
    telephone: clinic.phone,
    image: BASE + '/static/img/og-default.jpg',
    priceRange: '₩₩',
    parentOrganization: { '@id': BASE + '/#clinic' },
    address: {
      '@type': 'PostalAddress',
      streetAddress: clinic.address,
      addressLocality: clinic.addressLocality,
      addressRegion: clinic.addressRegion,
      postalCode: clinic.postalCode,
      addressCountry: 'KR',
    },
    geo: { '@type': 'GeoCoordinates', latitude: clinic.geo.lat, longitude: clinic.geo.lng },
    hasMap: clinic.mapUrl,
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Thursday', 'Friday'], opens: '09:30', closes: '18:30' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '09:30', closes: '13:00' },
    ],
    areaServed: { '@type': 'AdministrativeArea', name: opts.regionAdmin },
    makesOffer: {
      '@type': 'Offer',
      itemOffered: {
        '@type': 'MedicalProcedure',
        name: opts.treatmentName,
        url: BASE + '/treatments/' + opts.treatmentSlug,
      },
      areaServed: { '@type': 'AdministrativeArea', name: opts.regionAdmin },
    },
    sameAs: [clinic.sns.naverPlace, clinic.sns.instagram].filter(Boolean),
  }
}

// --- Service (진료를 특정 지역에 제공) ---
export function localServiceSchema(opts: {
  treatmentName: string; treatmentSlug: string; regionAdmin: string; regionName: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: opts.treatmentName,
    name: `${opts.regionName} ${opts.treatmentName}`,
    provider: { '@id': BASE + '/#clinic' },
    areaServed: { '@type': 'AdministrativeArea', name: opts.regionAdmin },
    url: BASE + '/treatments/' + opts.treatmentSlug,
  }
}

// --- WebSite (SearchAction) ---
export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': BASE + '/#website',
    url: BASE,
    name: clinic.nameKo,
    inLanguage: 'ko',
    publisher: { '@id': BASE + '/#clinic' },
  }
}

// --- ItemList (진료 목록 — 구조화된 컬렉션) ---
export function itemListSchema(opts: {
  name: string; items: { name: string; url: string; description?: string }[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: opts.name,
    numberOfItems: opts.items.length,
    itemListElement: opts.items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      url: BASE + it.url,
      ...(it.description ? { description: it.description } : {}),
    })),
  }
}

// --- DefinedTerm (백과사전 용어) ---
export function definedTermSchema(opts: {
  term: string; termEn: string; description: string; slug: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    '@id': BASE + '/encyclopedia/' + opts.slug + '#term',
    name: opts.term,
    alternateName: opts.termEn,
    description: opts.description,
    url: BASE + '/encyclopedia/' + opts.slug,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      '@id': BASE + '/encyclopedia/#termset',
      name: clinic.nameKo + ' 치과 백과사전',
      url: BASE + '/encyclopedia',
    },
  }
}

// --- MedicalWebPage (의료 콘텐츠 페이지 — E-E-A-T: 전문의 감수) ---
export function medicalWebPageSchema(opts: {
  title: string; description: string; path: string;
  reviewerName?: string; reviewerSlug?: string;
  /** 고정 검토일(YYYY-MM-DD) — lib/content-dates.ts. 없으면 lastReviewed 생략(오늘 날짜 자동 생성 금지) */
  lastReviewed?: string;
  /** 페이지 주제 엔티티 — 진료 상세는 MedicalProcedure @id, 백과는 DefinedTerm @id */
  about?: { type: string; id: string; name: string };
  /** 근거 학술 문헌 (원장 학회지 게재 증례 등) → ScholarlyArticle citation */
  citation?: { headline: string; alternativeHeadline?: string; authors: string[]; datePublished: string; journal: string; issn?: string; volume?: string; issue?: string; pagination?: string; doi?: string };
}) {
  const ct = opts.citation
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    ...(ct ? {
      citation: {
        '@type': 'ScholarlyArticle',
        headline: ct.headline,
        ...(ct.alternativeHeadline ? { alternativeHeadline: ct.alternativeHeadline } : {}),
        author: ct.authors.map((name) => ({ '@type': 'Person', name })),
        datePublished: ct.datePublished,
        ...(ct.pagination ? { pagination: ct.pagination } : {}),
        isPartOf: {
          '@type': 'PublicationIssue',
          ...(ct.issue ? { issueNumber: ct.issue } : {}),
          isPartOf: { '@type': ['PublicationVolume', 'Periodical'], name: ct.journal, ...(ct.volume ? { volumeNumber: ct.volume } : {}), ...(ct.issn ? { issn: ct.issn } : {}) },
        },
        ...(ct.doi ? { identifier: { '@type': 'PropertyValue', propertyID: 'DOI', value: ct.doi }, sameAs: 'https://doi.org/' + ct.doi, url: 'https://doi.org/' + ct.doi } : {}),
      },
    } : {}),
    '@id': BASE + opts.path + '#webpage',
    name: opts.title,
    description: opts.description,
    url: BASE + opts.path,
    inLanguage: 'ko',
    isPartOf: { '@id': BASE + '/#website' },
    ...(opts.about ? { about: { '@type': opts.about.type, '@id': opts.about.id, name: opts.about.name } } : {}),
    ...(opts.lastReviewed ? { lastReviewed: opts.lastReviewed } : {}),
    reviewedBy: opts.reviewerName
      ? {
          '@type': ['Person', 'Physician'],
          ...(opts.reviewerSlug ? { '@id': BASE + '/doctors/' + opts.reviewerSlug + '#person' } : {}),
          name: opts.reviewerName,
          url: opts.reviewerSlug ? BASE + '/doctors/' + opts.reviewerSlug : undefined,
          worksFor: { '@id': BASE + '/#clinic' },
        }
      : { '@id': BASE + '/#clinic' },
    publisher: { '@id': BASE + '/#clinic' },
  }
}

// --- Speakable ---
export function speakableSchema(cssSelectors: string[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    speakable: { '@type': 'SpeakableSpecification', cssSelector: cssSelectors },
  }
}

// --- ReserveAction (AI 에이전트 예약 시대 대응 · E1 만점 조건) ---
// AI 비서/검색 에이전트가 "예약해줘"를 실행할 수 있도록 예약 진입점을 구조화합니다.
export function reserveActionSchema() {
  const targets = [BASE + '/reservation']
  if (clinic.sns?.naverBooking) targets.push(clinic.sns.naverBooking)
  return {
    '@context': 'https://schema.org',
    '@type': 'ReserveAction',
    name: `${clinic.nameKo} 진료 예약`,
    target: {
      '@type': 'EntryPoint',
      urlTemplate: BASE + '/reservation',
      inLanguage: 'ko',
      actionPlatform: [
        'https://schema.org/DesktopWebPlatform',
        'https://schema.org/MobileWebPlatform',
      ],
    },
    result: { '@type': 'Reservation', name: '치과 진료 예약' },
    provider: { '@id': BASE + '/#clinic' },
    potentialAction: targets.map((t) => ({ '@type': 'EntryPoint', urlTemplate: t })),
  }
}
