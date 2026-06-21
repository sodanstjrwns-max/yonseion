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
  personalNote?: string // 원장 개인 경험담 (E-E-A-T) — 선택
  intro: string
}

export const doctors: Doctor[] = [
  {
    slug: 'kim-kyunghee',
    name: '김경희',
    role: '대표원장',
    title: '치과보철과 전문의 · 통합치의학과 전문의 (더블보더)',
    photo: '/static/img/doctor-kim.jpg', // 프로필 사진 제공 시 교체
    specialties: ['biomimetic', 'esthetic-prosthetics', 'all-on-x', 'adhesive-restoration'],
    licenses: [
      '치과보철과 전문의',
      '통합치의학과 전문의',
    ],
    career: [
      '연세대 원주세브란스병원 치과보철과 전공의',
      '연세대 원주세브란스병원 디지털임플란트센터 진료의사',
      '대한치과보철학회 인증 우수보철치과의사',
      '대한치과보철학회 학술대회 증례 발표 — "완전 디지털 시스템으로 기존교합을 보전한 All-on-4 임플란트수복증례"',
    ],
    memberships: [
      '연세대학교 치과보철학 연구회(세철회) 회원',
      '대한치과보철학회 평생회원',
      '대한턱관절교합학회 정회원',
      '대한심미치과학회 정회원',
      '대한디지털치의학회 정회원',
    ],
    philosophy: [
      '제가 생각하는 좋은 치과는, 환자분들께서 지금보다 더 나은 삶을 영위할 수 있도록 돕는 곳입니다.',
      '자연치아의 기능과 형태를 최대한 보존·복원하는 생체모방치의학(Biomimetic Dentistry)을 진료 철학의 중심에 둡니다.',
      '러버댐 방습 하의 접착수복, IDS 등 정밀 접착 원칙을 지켜 치아를 최대한 보존합니다.',
      '명확한 설명과 포괄적인 치료계획 수립 — 처음 설명드린 계획대로 진행되는 일관된 치료를 지향합니다.',
      '친절·공감을 앞세우기보다, 결과물·유지력·치아 보존량으로 신뢰를 드리는 진료를 지향합니다.',
    ],
    // 원장 개인 경험 — 중장년 심미보철 환자에 대한 깊은 공감의 근거 (E-E-A-T)
    personalNote:
      '저 역시 어린 시절(13세) 외상으로 앞니를 다쳐 오랜 기간 PFZ 크라운을 사용해 온 사람입니다. 앞니 하나가 인상과 자신감에 얼마나 큰 영향을 주는지, 또 보철과 오래 살아간다는 것이 어떤 의미인지 환자의 입장에서 누구보다 잘 알고 있습니다. 그래서 중장년 환자분의 심미보철을, 단순한 시술이 아니라 “삶의 질을 회복하는 일”로 대합니다.',
    intro:
      '연세온치과의원 대표원장 김경희입니다. 치과보철과·통합치의학과 두 영역의 전문의(더블보더)로서, 자연치아를 닮은 생체모방치의학을 바탕으로 환자분의 미소에 젊음을 더하는 진료를 추구합니다. 제가 생각하는 좋은 치과는 환자분들께서 지금보다 더 나은 삶을 영위할 수 있도록 돕는 곳입니다. 한 단계 업그레이드된 삶의 시작을 연세온치과에서 함께하시길 바랍니다.',
  },
]

export function getDoctor(slug: string): Doctor | undefined {
  return doctors.find((d) => d.slug === slug)
}

// 특정 진료를 담당하는 원장 찾기 (인링크용)
export function doctorsBySpecialty(specialtySlug: string): Doctor[] {
  return doctors.filter((d) => d.specialties.includes(specialtySlug))
}
