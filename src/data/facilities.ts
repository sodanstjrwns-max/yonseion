// ============================================================================
// 특수 장비 (Q15) + 지역 SEO 데이터 (Q6 부산 동래 기반)
// ============================================================================

export interface Equipment {
  name: string
  desc: string
  icon: string // Font Awesome
}

export const equipment: Equipment[] = [
  { name: 'CT (3D 진단)', desc: '골 상태·신경 위치를 3차원으로 정밀 진단', icon: 'fa-cube' },
  { name: '트리오스5 구강스캐너', desc: '본뜨기 없이 정밀한 디지털 인상 채득', icon: 'fa-wand-magic-sparkles' },
  { name: '3D 프린터 (가이드 출력)', desc: '네비게이션 가이드 출력 + 세척·경화 시스템', icon: 'fa-print' },
  { name: '저스트스캔 서비스', desc: 'temp.cr 제작용 3D 프린터·세척·경화', icon: 'fa-layer-group' },
  { name: 'Qray pen C', desc: '충치·세균막을 형광으로 시각화하는 진단 장비', icon: 'fa-lightbulb' },
  { name: '임플란트 플라즈마 처리기 (Plasma X)', desc: '임플란트 표면 처리로 친수성 향상', icon: 'fa-atom' },
  { name: 'Acteon P5 XS (Satelec)', desc: '정밀 초음파 치주·보존 치료 장비', icon: 'fa-wave-square' },
  { name: 'PHL 턱관절 물리치료기', desc: '턱관절 물리치료를 위한 전문 장비', icon: 'fa-hand-holding-medical' },
]

// --- 지역 SEO: 부산 동래구 + 인근 유입 지역 × 핵심진료 ---
export const seoRegions = [
  { slug: 'oncheonjang', name: '온천장', full: '부산 동래구 온천장' },
  { slug: 'dongnae', name: '동래', full: '부산 동래구' },
  { slug: 'myeongnyun', name: '명륜동', full: '부산 동래구 명륜동' },
  { slug: 'oncheon', name: '온천동', full: '부산 동래구 온천동' },
  { slug: 'sajik', name: '사직동', full: '부산 동래구 사직동' },
  { slug: 'geumjeong', name: '금정구', full: '부산 금정구' },
  { slug: 'yeonje', name: '연제구', full: '부산 연제구' },
  { slug: 'busanjin', name: '부산진구', full: '부산진구' },
]

// 지역 SEO 대상 진료 (TOP3 중심)
export const seoTreatments = [
  { slug: 'all-on-x', name: '전체임플란트', keyword: '전체임플란트' },
  { slug: 'esthetic-prosthetics', name: '심미보철', keyword: '심미보철' },
  { slug: 'adhesive-restoration', name: '충치치료', keyword: '레진 충치치료' },
  { slug: 'implant-guide', name: '임플란트', keyword: '임플란트' },
]

// 지역 × 진료 조합 생성 (/area/[region]-[treatment])
export function areaCombos() {
  const combos: { region: typeof seoRegions[0]; treatment: typeof seoTreatments[0]; slug: string }[] = []
  for (const region of seoRegions) {
    for (const treatment of seoTreatments) {
      combos.push({ region, treatment, slug: `${region.slug}-${treatment.slug}` })
    }
  }
  return combos
}
