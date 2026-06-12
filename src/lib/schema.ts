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
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Thursday', 'Friday'], opens: '09:30', closes: '18:30' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Tuesday', opens: '09:30', closes: '20:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '09:30', closes: '13:00' },
    ],
    sameAs: [clinic.sns.instagram, clinic.sns.youtube, clinic.sns.blog].filter(Boolean),
  }
}

// --- Person (의료진) ---
export function personSchema(doc: Doctor) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': BASE + '/doctors/' + doc.slug + '#person',
    name: doc.name,
    jobTitle: doc.role + ' · ' + doc.title,
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
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    name: t.name,
    url: BASE + '/treatments/' + t.slug,
    description: t.hero,
    procedureType: 'https://schema.org/SurgicalProcedure',
    provider: { '@id': BASE + '/#clinic' },
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
    reviewedBy: opts.authorName ? { '@type': 'Person', name: opts.authorName } : undefined,
    publisher: { '@id': BASE + '/#clinic' },
  }
}

// --- City / Place (지역 SEO) ---
export function placeSchema(regionFull: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'City',
    name: regionFull,
    containedInPlace: { '@type': 'AdministrativeArea', name: clinic.addressRegion },
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

// --- Speakable ---
export function speakableSchema(cssSelectors: string[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    speakable: { '@type': 'SpeakableSpecification', cssSelector: cssSelectors },
  }
}
