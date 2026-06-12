// ============================================================================
// 의료진 데이터 — ★ 사실관계(자격·경력·학위)는 신청서 Q17·18 원문만 사용. 창작 금지.
// ============================================================================

export interface Doctor {
  slug: string
  name: string
  role: string          // 직책
  title: string         // 한 줄 소개 (E-E-A-T)
  photo: string         // 사진 경로 (제공 시 교체)
  specialties: string[] // 전문 분야 (진료 페이지와 인링크)
  // 사실관계 — 원문만
  licenses: string[]    // 면허·전문의 (보건복지부 인증사항)
  career: string[]      // 경력·전공의
  memberships: string[] // 학회
  // 철학 (Q5·Q20~23 기반, 효과 단정 없음)
  philosophy: string[]
  intro: string
}

export const doctors: Doctor[] = [
  {
    slug: 'kim-kyunghee',
    name: '김경희',
    role: '대표원장',
    title: '치과보철과 전문의 · 통합치의학과 전문의',
    photo: '/static/img/doctor-kim.jpg', // 프로필 사진 제공 시 교체
    specialties: ['biomimetic', 'esthetic-prosthetics', 'all-on-x', 'adhesive-restoration'],
    licenses: [
      '치과보철과 전문의',
      '통합치의학과 전문의',
    ],
    career: [
      '연세대학교 원주 세브란스 치과보철과 전공의',
      '대한치과보철학회 인증 우수치과보철의사',
    ],
    memberships: [
      '대한치과보철학회 평생회원',
      '대한턱관절교합학회 정회원',
      '대한디지털치의학회 정회원',
    ],
    philosophy: [
      '자연치아의 기능과 형태를 최대한 보존·복원하는 생체모방치의학(Biomimetic Dentistry)을 진료 철학의 중심에 둡니다.',
      '러버댐 방습 하의 접착수복, IDS 등 정밀 접착 원칙을 지켜 치아를 최대한 보존합니다.',
      '명확한 설명과 포괄적인 치료계획 수립 — 처음 설명드린 계획대로 진행되는 일관된 치료를 지향합니다.',
    ],
    intro:
      '연세온치과의원 대표원장 김경희입니다. 치과보철과·통합치의학과 두 영역의 전문의로서, 자연치아를 닮은 생체모방치의학을 바탕으로 환자분의 미소에 젊음을 더하는 진료를 추구합니다. 보이는 결과뿐 아니라 "치아를 얼마나 보존하면서 얻어낸 결과인지"를 가장 중요하게 생각합니다.',
  },
]

export function getDoctor(slug: string): Doctor | undefined {
  return doctors.find((d) => d.slug === slug)
}

// 특정 진료를 담당하는 원장 찾기 (인링크용)
export function doctorsBySpecialty(specialtySlug: string): Doctor[] {
  return doctors.filter((d) => d.specialties.includes(specialtySlug))
}
