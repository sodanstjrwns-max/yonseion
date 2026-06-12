// 동적 콘텐츠 타입 (R2 저장)

export interface CaseItem {
  id: string
  slug: string
  title: string                 // 케이스 설명
  ageGroup: string              // 환자 나이대 (예: '50대')
  gender: string                // 성별
  treatmentSlug: string         // 진료 카테고리
  regionLabel: string           // 지역 카테고리 (예: '부산 동래구 온천동')
  doctorSlug: string            // 담당 원장
  duration: string              // 치료 기간
  description: string           // 상세 설명 (SEO)
  images: {
    panoBefore?: string         // 파노라마 전
    panoAfter?: string          // 파노라마 후
    intraBefore?: string        // 구내 전
    intraAfter?: string         // 구내 후
  }
  published: boolean
  createdAt: string
}

export interface Column {
  id: string
  slug: string
  title: string
  excerpt: string
  contentHtml: string           // SEO 에디터 HTML (H태그 포함)
  thumbnail?: string
  images: string[]
  authorSlug: string            // 작성자(원장) → E-E-A-T
  relatedTreatments: string[]   // 인링크
  metaTitle?: string
  metaDescription?: string
  published: boolean
  createdAt: string
  updatedAt: string
}

export interface Notice {
  id: string
  title: string
  contentHtml: string
  image?: string
  pinned: boolean               // 대표(상단고정)
  published: boolean
  createdAt: string
}

export interface User {
  email: string
  name: string
  phone: string
  passwordHash: string
  agreePrivacy: boolean
  agreeMarketing: boolean
  provider: 'local' | 'google'
  createdAt: string
}

export interface Reservation {
  id: string
  name: string
  phone: string
  email?: string
  treatment: string
  preferredDate?: string
  message?: string
  status: 'new' | 'confirmed' | 'done' | 'cancel'
  createdAt: string
}
