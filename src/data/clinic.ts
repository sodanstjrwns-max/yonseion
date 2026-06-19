// ============================================================================
// 연세온치과의원 — 병원 정보 단일 진실 공급원 (Single Source of Truth)
// 이 파일 하나만 수정하면 헤더/푸터/스키마/연락처가 전 사이트에 반영됩니다.
// ※ 사실관계(자격·경력)는 신청서 원문만 사용 — 창작 금지
// ============================================================================

export const clinic = {
  // --- 기본 정보 ---
  nameKo: '연세온치과의원',
  nameEn: 'Yeonseon On Dental Clinic',
  nameShort: '연세온치과',
  tagline: '미소의 젊음을 켜는 치과',
  mission: '자연치아를 닮은 생체모방치의학으로, 환자의 미소에 젊음을 더한다',
  domain: 'https://yonseion.kr', // 공식 도메인 (Cloudflare Pages 연결, 가비아 등록)

  // --- '온(On)' 브랜드 의미 (원장님 답변 Q2 원문 기반) ---
  brandStory: {
    headline: '이름에 담은 세 가지 “온”',
    meanings: [
      { key: '온천장의 온', en: 'Oncheonjang', desc: '부산 동래 온천장 — 오랜 시간 사람들의 일상이 흐르는 동네에서, 이웃의 구강건강을 책임집니다.' },
      { key: '따뜻할 온(溫)', en: 'Warmth', desc: '환자를 대할 때 따뜻한 마음을 잃지 않겠다는 약속입니다.' },
      { key: '켜다 온(On)', en: 'Switch On', desc: '환자의 구강건강과 미소의 자신감을 다시 “켜는” 치과가 되겠습니다.' },
    ],
  },
  openedYear: 2022,

  // --- 연락처 ---
  phone: '051-951-1000',
  phoneRaw: '0519511000',
  email: 'ys_ondental@naver.com',

  // --- 위치 ---
  address: '부산광역시 동래구 온천장로 114, 901호(온천동, 허브메디타워)',
  addressRegion: '부산광역시',
  addressLocality: '동래구',
  postalCode: '47734',
  directions: '지하철 1호선 온천장역 1·5번 출구에서 도보 3분 (1층 베스킨라빈스 건물)',
  subway: '1호선 온천장역 1·5번 출구 도보 3분',
  geo: { lat: 35.2138, lng: 129.0865 }, // 동래구 온천장 인근 (지도 연결 시 정밀 좌표로 교체)
  // 지도 — 네이버플레이스 short URL을 hasMap 으로 사용 (로컬 SEO)
  mapUrl: 'https://naver.me/FZ8n5qiP',
  // 서비스 제공 지역 (areaServed) — 로컬팩 진입 핵심 시그널
  areaServed: [
    '부산광역시 동래구', '부산광역시 금정구', '부산광역시 연제구', '부산광역시 부산진구',
    '부산광역시 해운대구', '부산광역시 남구', '경상남도 양산시', '경상남도 김해시',
  ],

  // --- 진료시간 ---
  hours: [
    { day: '월요일', time: '09:30 - 18:30', note: '점심 13:00-14:00' },
    { day: '화요일', time: '09:30 - 20:00', note: '점심 13:00-14:00 · 야간진료' },
    { day: '수요일', time: '휴진', note: '' },
    { day: '목요일', time: '09:30 - 18:30', note: '점심 13:00-14:00' },
    { day: '금요일', time: '09:30 - 18:30', note: '점심 13:00-14:00' },
    { day: '토요일', time: '09:30 - 13:00', note: '점심시간 없음' },
    { day: '일요일·공휴일', time: '휴진', note: '' },
  ],
  hoursSummary: '평일 09:30-18:30 · 화 야간 ~20:00 · 토 09:30-13:00',
  closedDays: '수요일·일요일·공휴일 휴진',

  // --- 사업자 정보 (푸터) — 사업자등록증 원문 (부가가치세 면세사업자) ---
  business: {
    company: '연세온치과의원',
    owner: '김경희',
    bizNo: '248-90-01937', // 사업자등록번호 (사업자등록증 기준)
    openDate: '2022.03.07',
  },

  // --- SNS · 운영 채널 (원장님 답변 '채워가야할 것들 2' 기반) ---
  sns: {
    instagram: 'https://www.instagram.com/ys_ondent',
    youtube: 'https://www.youtube.com/@연세온치과',
    blog: 'https://blog.naver.com/ysondent',          // 병원 브랜드블로그
    blogPersonal: 'https://blog.naver.com/ys_ondental', // 원장 개인블로그 (E-E-A-T 저자 시그널)
    naverPlace: 'https://naver.me/FZ8n5qiP',
    kakaoChannel: 'http://pf.kakao.com/_xiPfab',
  },

  // --- 브랜드 (차콜블랙 × 샴페인 골드 × 미색 페이퍼) ---
  brand: {
    ink: '#2E3A4B',        // 로고 딥 네이비 (텍스트/주조)
    paper: '#FBF9F1',      // 미색 도는 따뜻한 아이보리 (배경)
    mist: '#6E7681',       // 로고 그레이 (보조 텍스트 — 위계용)
    line: '#E3DECE',       // 헤어라인
    navy: '#2E3A4B',       // 로고 네이비
    navyDark: '#222C3A',   // 로고 네이비 다크
    gold: '#C59F66',       // 로고 샴페인 골드 (악센트)
    goldLight: '#E0C99B',
  },
} as const

export type Clinic = typeof clinic
