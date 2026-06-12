// ============================================================================
// 치과 백과사전 — AEO(질문 직답형) 정적 콘텐츠. 효과 단정 없음, 일반 의학정보
// ============================================================================
export interface EncycloEntry {
  slug: string
  term: string
  termEn: string
  category: string
  oneLiner: string            // AEO: 한 문장 정의 (스피커블)
  body: { h: string; p: string }[]
  relatedTreatments: string[] // 인링크
}

export const encyclopedia: EncycloEntry[] = [
  {
    slug: 'biomimetic-dentistry',
    term: '생체모방치의학',
    termEn: 'Biomimetic Dentistry',
    category: '치료 철학',
    oneLiner: '생체모방치의학은 자연치아의 구조와 물성을 모방해, 치아를 최대한 보존하면서 본래의 기능과 형태를 회복하는 치과 치료 접근법입니다.',
    body: [
      { h: '왜 "자연치아를 닮게" 치료하나요?', p: '자연치아는 법랑질과 상아질이 유기적으로 결합된 정교한 구조입니다. 이 구조를 무시하고 과도하게 삭제하면 치아 수명이 짧아질 수 있습니다. 생체모방 접근은 남은 치아 조직을 살리고, 비슷한 물성의 재료를 접착해 자연치아처럼 기능하도록 합니다.' },
      { h: '어떤 치료에 적용되나요?', p: '레진·인레이·온레이 같은 접착수복, 라미네이트, 크라운 등 보철 치료 전반에 적용됩니다. 핵심 원칙은 러버댐 방습, 즉시상아질봉쇄(IDS) 등 접착 프로토콜의 준수입니다.' },
    ],
    relatedTreatments: ['adhesive-restoration', 'esthetic-prosthetics'],
  },
  {
    slug: 'rubber-dam',
    term: '러버댐',
    termEn: 'Rubber Dam',
    category: '접착·보존',
    oneLiner: '러버댐은 치료할 치아를 얇은 고무막으로 격리해 침과 습기를 차단하는 방습 장치로, 접착 치료의 안정성을 높이는 데 사용됩니다.',
    body: [
      { h: '러버댐을 왜 사용하나요?', p: '레진·인레이 등 접착 치료는 수분에 매우 민감합니다. 러버댐으로 치아를 격리하면 침·혈액·습기로부터 접착면을 보호해 탈락·변색 위험을 줄이는 데 도움이 됩니다.' },
      { h: '불편하지 않나요?', p: '처음에는 다소 낯설 수 있으나, 치료 부위에 물이나 기구가 닿지 않아 오히려 편안하게 느끼는 분도 많습니다. 안전성 측면에서도 기구·재료가 입안으로 떨어지는 것을 막아줍니다.' },
    ],
    relatedTreatments: ['adhesive-restoration'],
  },
  {
    slug: 'ids',
    term: '즉시상아질봉쇄 (IDS)',
    termEn: 'Immediate Dentin Sealing',
    category: '접착·보존',
    oneLiner: 'IDS는 치아 삭제 직후 노출된 상아질을 즉시 접착제로 봉쇄하는 술식으로, 시린 증상과 세균 침투를 줄이는 데 도움이 되는 접착 프로토콜입니다.',
    body: [
      { h: 'IDS는 언제 시행하나요?', p: '인레이·온레이·라미네이트 등 간접 수복물을 위해 치아를 삭제한 직후, 본을 뜨기 전에 시행합니다. 신선한 상아질 면에 바로 접착하는 것이 접착력 측면에서 유리하다고 알려져 있습니다.' },
      { h: '환자에게 어떤 이점이 있나요?', p: '임시 수복 기간 동안의 시린 증상과 세균 침투 가능성을 줄이는 데 도움이 됩니다. 생체모방 접착 치료의 핵심 단계 중 하나입니다.' },
    ],
    relatedTreatments: ['adhesive-restoration', 'esthetic-prosthetics'],
  },
  {
    slug: 'all-on-x',
    term: '올온엑스 (All-on-X)',
    termEn: 'All-on-X',
    category: '임플란트',
    oneLiner: 'All-on-X는 4~6개 내외의 임플란트로 한 악(위턱 또는 아래턱) 전체의 고정성 보철을 지지하는 전체 임플란트 치료 방식입니다.',
    body: [
      { h: '틀니와 무엇이 다른가요?', p: '잇몸으로 지지하는 틀니와 달리, 임플란트에 고정되므로 빼고 끼는 번거로움이 없고 저작(씹는) 기능 회복에 유리한 방식입니다. 다만 적용 가능 여부는 골 상태·전신 건강에 따라 다릅니다.' },
      { h: '어떤 분들이 고려하나요?', p: '대부분의 치아를 상실했거나 남은 치아의 예후가 좋지 않아 전체적인 회복이 필요한 경우 고려합니다. CT 진단과 정밀 치료계획이 선행되어야 합니다.' },
    ],
    relatedTreatments: ['all-on-x'],
  },
  {
    slug: 'navigation-implant',
    term: '네비게이션 임플란트',
    termEn: 'Guided Implant Surgery',
    category: '임플란트',
    oneLiner: '네비게이션(가이드) 임플란트는 CT와 구강스캔 데이터로 식립 위치·각도·깊이를 미리 설계하고, 3D 프린팅 가이드를 통해 계획대로 식립하는 디지털 임플란트 방식입니다.',
    body: [
      { h: '일반 식립과 무엇이 다른가요?', p: '수술 전에 컴퓨터 상에서 신경·골 상태를 분석해 안전한 위치를 설계하고, 수술용 가이드를 출력해 그대로 식립합니다. 정밀도와 예측 가능성을 높이는 데 도움이 됩니다.' },
    ],
    relatedTreatments: ['all-on-x', 'implant-guide'],
  },
  {
    slug: 'laminate',
    term: '라미네이트',
    termEn: 'Laminate Veneer',
    category: '심미보철',
    oneLiner: '라미네이트는 치아 앞면을 최소한으로 다듬고 얇은 세라믹을 접착해 형태와 색을 개선하는 심미 치료입니다.',
    body: [
      { h: '치아를 많이 깎아야 하나요?', p: '크라운에 비해 삭제량이 적은 편이며, 케이스에 따라 삭제를 최소화할 수 있습니다. 다만 치아 상태(변색 정도, 배열)에 따라 적응증이 달라지므로 정밀 진단이 필요합니다.' },
      { h: '수명은 어느 정도인가요?', p: '접착 품질과 구강 습관(이갈이 등)에 따라 달라집니다. 방습 하의 정밀 접착과 정기 관리가 유지에 중요합니다.' },
    ],
    relatedTreatments: ['esthetic-prosthetics'],
  },
  {
    slug: 'zirconia-crown',
    term: '지르코니아 크라운',
    termEn: 'Zirconia Crown',
    category: '심미보철',
    oneLiner: '지르코니아 크라운은 강도가 높고 자연치아와 유사한 색 표현이 가능한 세라믹 계열 보철로, 어금니부터 앞니까지 널리 사용됩니다.',
    body: [
      { h: 'PFZ 크라운과는 어떻게 다른가요?', p: '풀지르코니아는 단일 재료로 강도가 높고, PFZ(Porcelain Fused to Zirconia)는 지르코니아 코어 위에 포세린을 입혀 심미성을 더한 방식입니다. 부위와 심미 목표에 따라 선택합니다.' },
    ],
    relatedTreatments: ['esthetic-prosthetics'],
  },
  {
    slug: 'diastema',
    term: '다이아스테마',
    termEn: 'Diastema',
    category: '심미보철',
    oneLiner: '다이아스테마는 앞니 사이가 벌어진 상태를 말하며, 정도에 따라 레진 접착수복·라미네이트·교정 등으로 개선을 고려할 수 있습니다.',
    body: [
      { h: '교정 없이도 개선할 수 있나요?', p: '벌어진 정도가 크지 않다면 치아 삭제를 최소화한 레진 수복으로 자연스럽게 메우는 방법을 고려할 수 있습니다. 정밀 진단으로 원인(설소대, 치아 크기 등)을 먼저 확인하는 것이 중요합니다.' },
    ],
    relatedTreatments: ['esthetic-prosthetics', 'adhesive-restoration'],
  },
  {
    slug: 'onlay-overlay',
    term: '온레이 · 오버레이',
    termEn: 'Onlay / Overlay',
    category: '접착·보존',
    oneLiner: '온레이·오버레이는 크라운처럼 치아 전체를 둘러 깎지 않고, 손상된 부분만 세라믹으로 부분 수복하는 치아 보존형 치료입니다.',
    body: [
      { h: '크라운 대신 온레이를 하는 이유는?', p: '건강한 치아 조직을 더 많이 보존할 수 있기 때문입니다. 생체모방 관점에서 "필요한 만큼만 수복"하는 것이 치아 수명에 유리하다고 봅니다. 다만 남은 치질의 양에 따라 크라운이 필요한 경우도 있습니다.' },
    ],
    relatedTreatments: ['adhesive-restoration'],
  },
  {
    slug: 'splint',
    term: '교합안정장치 (스플린트)',
    termEn: 'Occlusal Splint',
    category: '턱관절·교합',
    oneLiner: '교합안정장치는 수면 중 착용하는 맞춤 장치로, 이갈이·이악물기로부터 치아를 보호하고 턱관절과 근육의 안정을 돕습니다.',
    body: [
      { h: '어떤 경우에 필요한가요?', p: '아침에 턱이 뻐근하거나, 치아가 비정상적으로 닳아 있거나, 턱관절 소리·통증이 있는 경우 진단 후 처방될 수 있습니다. 보철 치료 후 결과물 보호 목적으로도 사용됩니다.' },
    ],
    relatedTreatments: ['tmj-occlusion'],
  },
  {
    slug: 'sinus-lift',
    term: '상악동 거상술',
    termEn: 'Sinus Lift',
    category: '임플란트',
    oneLiner: '상악동 거상술은 위턱 어금니 부위의 골 높이가 부족할 때, 상악동 막을 들어 올리고 골이식재를 채워 임플란트 식립 조건을 만드는 수술입니다.',
    body: [
      { h: '왜 필요한가요?', p: '위턱 어금니를 오래 전에 상실하면 골이 흡수되고 상악동(코 옆 공기주머니)이 내려와 임플란트를 심을 골 높이가 부족해질 수 있습니다. CT로 골량을 평가해 필요 여부를 판단합니다.' },
    ],
    relatedTreatments: ['all-on-x', 'implant-guide'],
  },
  {
    slug: 'intraoral-scanner',
    term: '구강스캐너',
    termEn: 'Intraoral Scanner',
    category: '디지털 치의학',
    oneLiner: '구강스캐너는 입안을 직접 스캔해 3차원 디지털 모형을 만드는 장비로, 인상재(본뜨기)의 불편 없이 정밀한 인상 채득이 가능합니다.',
    body: [
      { h: '본뜨기와 무엇이 다른가요?', p: '구역감을 유발하는 인상재 없이 카메라로 스캔하므로 편안하고, 데이터가 즉시 디지털화되어 보철 설계·제작의 정밀도를 높이는 데 도움이 됩니다. 연세온치과는 트리오스5 스캐너를 사용합니다.' },
    ],
    relatedTreatments: ['esthetic-prosthetics', 'all-on-x'],
  },
]

export function getEntry(slug: string): EncycloEntry | undefined {
  return encyclopedia.find((e) => e.slug === slug)
}

export const encycloCategories = [...new Set(encyclopedia.map((e) => e.category))]
