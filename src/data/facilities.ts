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
// 지역 SEO 대상 — 각 지역 고유 교통/거리/랜드마크 데이터로 중복콘텐츠 회피
// transit: 해당 지역에서 병원(온천장)까지 실제 이동 동선 / nearby: 인근 랜드마크
export interface SeoRegion {
  slug: string
  name: string
  full: string
  admin: string          // areaServed 용 행정구역 정식 명칭
  transit: string        // 해당 지역 → 병원 고유 교통편
  distance: string       // 대략 거리/소요시간
  landmark: string       // 지역 내 랜드마크 (본문 고유성)
}

export const seoRegions: SeoRegion[] = [
  // --- 동래구 (소재지 — 최우선, 전동 커버) ---
  { slug: 'oncheonjang', name: '온천장', full: '부산 동래구 온천장', admin: '부산광역시 동래구', transit: '도시철도 1호선 온천장역 1·5번 출구 바로 앞', distance: '도보 3분', landmark: '온천장역·허심청·동래온천' },
  { slug: 'oncheon', name: '온천동', full: '부산 동래구 온천동', admin: '부산광역시 동래구', transit: '온천동 일대에서 도보 또는 1호선 온천장역', distance: '도보 5~10분', landmark: '동래온천·금강공원 입구' },
  { slug: 'dongnae', name: '동래', full: '부산 동래구', admin: '부산광역시 동래구', transit: '1호선 동래역에서 온천장역 방면 1정거장', distance: '지하철 5분', landmark: '동래시장·동래읍성·롯데백화점 동래점' },
  { slug: 'myeongnyun', name: '명륜동', full: '부산 동래구 명륜동', admin: '부산광역시 동래구', transit: '1호선 명륜역에서 온천장역 방면 1정거장', distance: '지하철 3분', landmark: '명륜역·동래고등학교' },
  { slug: 'sajik', name: '사직동', full: '부산 동래구 사직동', admin: '부산광역시 동래구', transit: '사직동에서 3호선 사직역→연산 환승 또는 버스로 온천장', distance: '차량 10분', landmark: '사직야구장·아시아드주경기장' },
  { slug: 'boksan', name: '복산동', full: '부산 동래구 복산동', admin: '부산광역시 동래구', transit: '복산동에서 버스 또는 차량으로 온천장 방면', distance: '차량 7분', landmark: '동래향교·복천박물관' },
  { slug: 'allak', name: '안락동', full: '부산 동래구 안락동', admin: '부산광역시 동래구', transit: '4호선 안락역→미남 환승 후 1호선, 또는 차량', distance: '차량 10분', landmark: '안락역·충렬사' },
  { slug: 'myeongjang', name: '명장동', full: '부산 동래구 명장동', admin: '부산광역시 동래구', transit: '명장동에서 버스 또는 차량으로 온천장 방면', distance: '차량 12분', landmark: '명장정수사업소·동래향교 인근' },
  // --- 인접 구 ---
  { slug: 'geumjeong', name: '금정구', full: '부산 금정구', admin: '부산광역시 금정구', transit: '1호선 부산대역·장전역에서 온천장역 방면', distance: '지하철 5~10분', landmark: '부산대학교·장전동 먹자골목' },
  { slug: 'yeonje', name: '연제구', full: '부산 연제구', admin: '부산광역시 연제구', transit: '1·3호선 연산역에서 1호선으로 온천장 방면', distance: '지하철 10분', landmark: '부산시청·연산교차로' },
  { slug: 'busanjin', name: '부산진구', full: '부산 부산진구', admin: '부산광역시 부산진구', transit: '1호선 서면역에서 온천장역까지 직통', distance: '지하철 15분', landmark: '서면·부전시장' },
  { slug: 'haeundae', name: '해운대구', full: '부산 해운대구', admin: '부산광역시 해운대구', transit: '해운대에서 차량으로 동래·온천장 방면', distance: '차량 20~25분', landmark: '해운대해수욕장·센텀시티' },
  // --- 인근 시 (원거리 내원) ---
  { slug: 'yangsan', name: '양산', full: '경상남도 양산시', admin: '경상남도 양산시', transit: '양산에서 1호선 또는 차량(노포 방면)으로 온천장', distance: '차량 25~30분', landmark: '양산물금신도시·양산종합운동장' },
  { slug: 'gimhae', name: '김해', full: '경상남도 김해시', admin: '경상남도 김해시', transit: '김해에서 차량(중앙고속도로·만덕터널 방면)으로 동래', distance: '차량 30~40분', landmark: '김해장유·내외동' },
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
