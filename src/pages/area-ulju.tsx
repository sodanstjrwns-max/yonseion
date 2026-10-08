import { html, raw } from 'hono/html'
import { Layout, Breadcrumb } from '../components/layout'
import { clinic } from '../data/clinic'
import { doctors } from '../data/doctors'
import { breadcrumbSchema, faqSchema } from '../lib/schema'

// ============================================================================
// 울산 울주 원거리 내원 안내 — /area/ulju-{진료} 4페이지 (2026-10-08 재작성)
//
// 병원은 부산 동래구 온천장에 있고 울주에는 진료실이 없다. 지역×진료 템플릿(AreaPage)이
// "울산 전체임플란트, 연세온치과에서 / 가깝게 내원" 식으로 현지 병원처럼 보이던 문제(도어웨이)를 정리:
//  - URL·색인 유지(지역 페이지 noindex/삭제 금지 원칙), 제목·H1 을 "울산 울주에서 연세온치과 — {진료} 상담·내원 안내"로
//  - 도입부에서 거리가 있다는 사실을 먼저 밝히고, 급한 통증은 가까운 치과 먼저 안내
//  - 오시는 길은 일반 지리만(버스 번호·소요 시간 없음), 일부러 오실 만한 경우·일정 짜는 법은 레포 사실만
//  - 진료별로 본문을 따로 써서 서로·동래 페이지와 문장 재사용 없음(5-gram 유사도 검사)
// 사실 출처: clinic.ts(주소·전화·진료시간·주차), treatments.ts(과정·사후관리·비용 안내·FAQ), doctors.ts
// ============================================================================

export const ULJU_SLUG = 'ulju'
export const ULJU_DATE = '2026-10-08'

type UljuCopy = {
  label: string        // 진료 표기 (H1·제목)
  crumb: string        // 브레드크럼·관련 링크 라벨
  lead: string
  noteTitle: string
  note: string
  worthH2: string
  worth: string[]
  visitH2: string
  visit: string[]
  planH2: string
  plan: { t: string; d: string }[]
  faqs: { q: string; a: string }[]
  cta: string
  description: string
}

const PHONE = clinic.phone
const doc = doctors[0]

const COPY: Record<string, UljuCopy> = {
  'all-on-x': {
    label: '전체임플란트(All-on-X)',
    crumb: '울주에서 전체임플란트 상담',
    lead: `${clinic.nameShort}는 울주가 아니라 부산 동래구 온천장(1호선 온천장역 1·5번 출구 도보 3분)에 있는 치과입니다. 울주에서는 하루를 따로 비워야 하는 거리라, All-on-X 전체임플란트 때문에 먼 길을 고민하시는 분께 필요한 치료 흐름과 오시는 방법, 일정 짜는 요령을 있는 그대로 정리했습니다.`,
    noteTitle: '먼저 확인해 주세요',
    note: '잇몸이 갑자기 붓거나 흔들리는 치아 때문에 통증이 심하다면 울주에서 가까운 치과를 먼저 찾으세요. 염증 조절이나 응급 처치는 가까운 곳이 유리하고, 전체임플란트 상담은 급한 증상이 가라앉은 뒤에 받아도 늦지 않습니다.',
    worthH2: '전체임플란트, 울주에서 일부러 오실 만한 경우',
    worth: [
      'All-on-X는 하루에 끝나는 치료가 아닙니다. 정밀 진단과 디지털 식립 계획, 식립 수술, 임시 보철로 지내는 골유착 기간, 최종 보철 장착까지 여러 달에 걸쳐 이어집니다. 그래서 거리만큼이나 "처음 세운 계획이 끝까지 같은 의료진 손에서 이어지는가"를 따져 보고 병원을 고르시는 분들이 있습니다.',
      `${clinic.nameShort}에서는 ${doc.licenses.join('·')}인 ${doc.name} ${doc.role}이 진단부터 최종 보철까지 직접 맡습니다. 김 원장은 환자가 쓰던 틀니의 교합을 디지털로 옮겨 All-on-4 보철을 완성한 증례를 2018년 대한치과보철학회 학술대회에서 발표했습니다.`,
      '진단 때 얻은 CT·구강스캔 데이터를 수술 가이드와 임시 치아, 최종 보철 제작까지 이어 쓰도록 계획해 반복 인상 채득 같은 내원을 줄이려 합니다. 다만 실제 횟수와 기간은 잇몸뼈 상태와 치료 범위에 따라 달라지므로, 첫 상담에서 예상 일정표를 함께 확인합니다.',
    ],
    visitH2: '울주에서 온천장까지 오시는 방법',
    visit: [
      '울주군 남쪽은 부산 기장군·경남 양산시와 맞닿아 있어 부산 동래 방면으로 내려오는 길이 여럿입니다. 열차를 이용하신다면 동해선으로 부산 동래 방면까지 오신 뒤 도시철도 1호선으로 갈아타 온천장역에서 내리세요. 1·5번 출구에서 걸어서 3분, 허브메디컬타워 901호입니다.',
      '자가용은 노포 방면으로 부산에 들어와 동래·온천장 쪽으로 오시면 되고 건물 주차장을 이용할 수 있습니다. 식립 수술 날은 마취와 부기를 고려해 보호자와 함께 오시거나 직접 운전하지 않는 귀갓길을 미리 정해 두시길 권합니다. 갈아타는 역과 열차 시간, 주차 세부 사항은 출발 전 지도 앱이나 전화로 확인해 주세요.',
    ],
    planH2: '원거리 내원 일정, 이렇게 맞춥니다',
    plan: [
      { t: '첫 방문', d: 'CT·구강스캔 진단과 상담을 함께 진행하고, 식립 개수·골이식 여부·보철 재료에 따른 비용을 항목별로 설명드립니다. 진단 전에는 일률적인 금액을 약속하지 않습니다.' },
      { t: '수술일', d: '골 상태와 초기 고정력이 충분하면 미리 만든 임시 치아를 당일 연결하도록 계획합니다. 연결 여부는 수술 중 고정력을 확인한 뒤 결정합니다.' },
      { t: '골유착 기간', d: '부드러운 음식 위주로 지내며, 약속한 날에 교합 높이와 발음·외모를 점검합니다.' },
      { t: '요일 고르기', d: '수요일·일요일·공휴일은 휴진이고 토요일은 오후 1시까지라, 시간이 걸리는 수술이나 장착은 월·화·목·금으로 잡는 편이 여유롭습니다.' },
    ],
    faqs: [
      { q: '울주에서 상담만 먼저 받아 봐도 되나요?', a: '네. 첫 방문에서 CT·구강스캔으로 진단하고 치료 단계와 예상 내원 일정, 항목별 비용을 설명드립니다. 설명을 들으신 뒤 가까운 치과와 비교해 결정하셔도 괜찮습니다.' },
      { q: '수술 뒤 불편하면 매번 부산까지 와야 하나요?', a: `먼저 전화(${PHONE})로 증상을 알려 주시면 내원이 필요한지 안내해 드립니다. 갑자기 심하게 붓거나 피가 멈추지 않는 등 급한 상황이라면 가까운 치과나 응급실을 먼저 찾으시고, 받으신 처치를 알려 주시면 이어서 관리합니다.` },
      { q: '최종 보철 뒤 정기 검진도 부산에서 받아야 하나요?', a: '티타늄 바 고정성 보철의 구조와 교합 기록이 병원에 있어 보철·교합 점검은 연세온치과에서 받으시길 권합니다. 매일의 칫솔·치간 관리와 스케일링은 가까운 치과에서 받으셔도 되며, 검진 주기는 상태에 따라 함께 정합니다.' },
    ],
    cta: '진단과 예상 일정표부터 받아 보세요.',
    description: `울산 울주에서 부산 동래구 온천장 ${clinic.nameShort}까지 — All-on-X 전체임플란트 상담 전 알아 둘 치료 흐름, 오시는 방법, 원거리 내원 일정. 급한 통증은 가까운 치과 먼저.`,
  },

  'esthetic-prosthetics': {
    label: '중장년 심미보철',
    crumb: '울주에서 심미보철 상담',
    lead: `앞니 보철을 다시 하려고 울주에서 부산까지 알아보고 계신가요? ${clinic.nameShort}는 부산 동래구 온천장역 앞(1·5번 출구 도보 3분)에 있어 울주에서 가까운 거리는 아닙니다. 심미보철을 받으려면 대략 몇 번 와야 하는지, 어떤 경우에 이동할 가치가 있는지, 어떻게 오시면 되는지를 솔직하게 적었습니다.`,
    noteTitle: '보철이 빠지거나 깨졌다면',
    note: '보철이 빠졌거나 깨져 날카롭게 걸리고 아프다면 우선 울주 근처 치과에서 임시로 붙이거나 다듬는 처치를 받으세요. 빠진 보철은 버리지 말고 보관해 두시면 나중에 재보철 상담 때 원인을 살피는 데 도움이 됩니다.',
    worthH2: '앞니 심미보철 때문에 부산까지 오실 만한 경우',
    worth: [
      '심미보철은 한 번 정한 색과 모양을 오래 보고 지내야 하는 치료입니다. 오래된 크라운이 잇몸 쪽에서 검게 비치거나, 닳고 깨진 앞니를 많이 깎지 않고 고치고 싶을 때 보철과 전문의의 진단을 받아 보려고 먼 길을 오시는 경우가 있습니다.',
      `${clinic.nameShort}는 "가능한 한 적게 깎는다"는 보존 원칙을 먼저 적용해 라미네이트·풀지르코니아 크라운·레진 수복 가운데 손상 정도에 맞는 방법을 고릅니다. 잇몸 라인이 어긋나 보이면 연조직 수술(CTG·CAF)을 함께 검토하기도 하며, 이때는 기간이 길어질 수 있습니다.`,
      '앞니 하나의 작은 깨짐이나 가벼운 변색이라면 가까운 치과에서도 해결되는 경우가 많습니다. 먼저 상담으로 범위를 확인한 뒤 이동 여부를 정하셔도 됩니다.',
    ],
    visitH2: '울주 → 동래 온천장, 이동 방법',
    visit: [
      '기차를 타신다면 동해선으로 부산 동래 방면까지 오신 뒤 도시철도 1호선으로 갈아타 온천장역에서 내리세요. 역 1·5번 출구에서 걸어서 3분, 1층에 베스킨라빈스가 있는 허브메디컬타워 9층입니다.',
      `승용차라면 울주에서 부산 쪽으로 내려와 노포를 거쳐 동래·온천장으로 들어오시면 됩니다. 건물 주차장이 있으며, 환승역이나 주차 세부 사항은 지도 앱과 전화(${PHONE})로 미리 확인해 주세요.`,
    ],
    planH2: '2~3회 내원을 기준으로 일정 잡기',
    plan: [
      { t: '대략의 횟수', d: '일반적으로 정밀 진단 뒤 2~3회 내원으로 진행되는 경우가 많고, 연조직 수술이 더해지면 늘어납니다.' },
      { t: '첫날', d: '트리오스5 구강스캔과 사진·CT로 치아와 잇몸을 분석하고, 보철 종류와 목표 색·모양, 기간을 설명드립니다.' },
      { t: '시적(try-in)', d: '디지털로 설계한 형태와 색을 입안에서 미리 확인하는 날입니다. 마음에 걸리는 부분은 이때 조정하니 거울을 보며 충분히 의견을 주세요.' },
      { t: '장착 뒤', d: '1~2주 무렵 씹는 느낌을 확인하고 필요하면 미세 조정합니다. 이후에는 6개월마다 보철 경계부와 잇몸 점검을 권합니다. 수요일·일요일·공휴일은 휴진, 토요일은 오후 1시까지입니다.' },
    ],
    faqs: [
      { q: '여러 개를 한꺼번에 하면 내원 횟수를 줄일 수 있나요?', a: '여러 치아를 같은 계획 안에서 함께 설계하면 진단과 시적을 한데 묶어 일정이 정리되는 경우가 있습니다. 다만 잇몸 처치가 먼저 필요하면 단계를 나눠야 하므로 진단 후 함께 정합니다.' },
      { q: '장착 후 조정은 울주 근처 치과에서 받아도 되나요?', a: '설계 기록과 색 정보가 연세온치과에 있어 장착 직후 몇 차례 점검은 직접 보시길 권합니다. 이물감이나 시린 느낌은 대부분 며칠 안에 적응하며, 오래가면 전화로 먼저 알려 주세요.' },
      { q: '비용은 언제 알 수 있나요?', a: '심미보철은 비급여 진료로 치아 개수·재료·난이도에 따라 달라집니다. 첫 방문 정밀 진단 뒤 항목별로 안내드리며, 공개된 기준은 비급여 수가 안내 페이지에서도 보실 수 있습니다.' },
    ],
    cta: '색과 모양, 내원 횟수부터 상담해 보세요.',
    description: `울산 울주에서 부산 동래구 온천장 ${clinic.nameShort}까지 — 중장년 앞니 심미보철 상담 전 확인할 내원 횟수(대개 2~3회), 오시는 방법, 이동할 만한 경우. 보철이 빠져 아프면 가까운 치과 먼저.`,
  },

  'adhesive-restoration': {
    label: '레진·온레이 충치치료',
    crumb: '울주에서 충치치료 상담',
    lead: `충치 치료는 대부분 가까운 치과에서 받으시는 편이 낫습니다. ${clinic.nameShort}는 부산 동래구 온천장에 있어 울주에서는 이동 부담이 크기 때문입니다. 다만 크라운을 권유받은 치아를 덜 깎고 살릴 수 있는지 다시 확인하고 싶을 때처럼 일부러 오실 이유가 있는 경우도 있어, 그 기준과 오시는 길을 정리했습니다.`,
    noteTitle: '이가 아파서 찾으셨다면',
    note: '밤에 욱신거리거나 얼굴까지 붓는 통증은 신경이나 뿌리 끝 염증일 수 있어 미루지 않는 것이 중요합니다. 이럴 때는 울주에서 바로 갈 수 있는 치과에서 먼저 처치를 받으세요. 통증이 가라앉은 뒤 보존 치료 방향을 상담해도 늦지 않습니다.',
    worthH2: '충치치료로 울주에서 오실 만한 경우와 아닌 경우',
    worth: [
      `오실 만한 경우는 금이 가거나 크게 썩은 어금니에 크라운을 권유받았는데 덜 깎는 방법이 있는지 알고 싶을 때, 오래된 아말감이나 인레이 여러 개를 한 계획 안에서 정리하고 싶을 때입니다. ${clinic.nameShort}는 러버댐으로 침과 습기를 막은 상태에서 레진 빌드업과 이맥스 온레이·오버레이 같은 접착 수복을 하고, 즉시 상아질 봉쇄(IDS) 등 접착 원칙을 지킵니다.`,
      '정기 검진에서 발견된 작은 충치나 한 번에 끝나는 단순 레진 치료라면 굳이 오지 않으셔도 됩니다. 가까운 치과에서 받으시는 것이 시간과 교통비 면에서 합리적입니다.',
      '진단에는 충치와 세균막을 형광으로 보여 주는 Qray pen을 사용해 썩은 범위를 눈으로 확인하며 설명드립니다.',
    ],
    visitH2: '울주에서 부산 동래로 오실 때',
    visit: [
      '울주군은 남쪽으로 부산 기장군과 이어져 있습니다. 대중교통은 동해선을 타고 부산 동래 방면으로 내려와 도시철도 1호선으로 환승한 뒤 온천장역에서 내리시면 되고, 1·5번 출구에서 도보 3분입니다.',
      '차량은 노포 방면으로 들어와 동래·온천장으로 오시면 되고 건물 주차장을 쓸 수 있습니다. 마취를 한 날은 마취가 풀릴 때까지 식사를 미루시는 것이 좋으니 돌아가는 시간도 넉넉히 잡아 두세요. 환승역과 주차 세부 사항은 출발 전에 확인해 주세요.',
    ],
    planH2: '치료 범위에 따라 달라지는 내원 횟수',
    plan: [
      { t: '직접 레진 수복', d: '작은 충치는 한 번 내원으로 자연색 수복을 마치는 경우가 많습니다.' },
      { t: '온레이·오버레이', d: '손상 부위를 정리하고 스캔한 뒤 수복물을 만들어 붙이는 간접 수복이라 대개 한 번 이상 더 오셔야 합니다. 여러 치아라면 같은 날 묶어 진행할 수 있는지 상담 때 함께 계획합니다.' },
      { t: '치료 뒤', d: '깊은 충치였다면 며칠 시릴 수 있으나 대개 점차 가라앉습니다. 씹을 때 높게 느껴지면 조정이 필요하니 전화로 알려 주세요.' },
      { t: '진료 요일', d: '월·화·목·금 09:30~18:30(점심 13:00~14:00), 토요일 09:30~13:00이며 수요일·일요일·공휴일은 쉽니다.' },
    ],
    faqs: [
      { q: '크라운을 권유받았는데 온레이로 가능한지 봐 주실 수 있나요?', a: '네. 남아 있는 치아 벽의 두께와 금 간 범위, 씹는 힘을 보고 온레이·오버레이로 보존할 수 있는지 판단합니다. 손상이 크면 크라운이 더 적합할 수 있어 진단 결과를 그대로 설명드립니다.' },
      { q: '레진 치료도 건강보험이 되나요?', a: '만 12세 이하 영구치 충치 등 일부 기준에서 건강보험이 적용되고, 성인 어금니 레진이나 이맥스 온레이·오버레이 같은 간접 수복은 비급여인 경우가 많습니다. 정확한 본인 부담은 진료 시 안내드립니다.' },
      { q: '치료 후 정기 검진은 어디서 받으면 되나요?', a: '수복물 경계에 충치가 다시 생기지 않았는지 6개월마다 확인하시길 권합니다. 거리 부담이 크면 가까운 치과 검진도 괜찮고, 수복물에 이상이 보이면 연락 주세요.' },
    ],
    cta: '살릴 수 있는 치아인지부터 확인해 보세요.',
    description: `울산 울주에서 부산 동래구 온천장 ${clinic.nameShort}까지 — 러버댐 레진·온레이 충치치료로 이동할 만한 경우와 아닌 경우, 오시는 방법, 내원 횟수. 아픈 이는 가까운 치과 먼저.`,
  },

  'implant-guide': {
    label: '네비게이션 가이드 임플란트',
    crumb: '울주에서 임플란트 상담',
    lead: `${clinic.nameShort}는 울주가 아닌 부산 동래구 온천장역 앞(1·5번 출구 도보 3분)에 있습니다. 임플란트는 심은 뒤에도 실밥 제거와 보철 장착처럼 몇 차례 더 와야 하는 치료라, 울주에서 다니실 수 있을지 판단하실 수 있도록 단계별 내원 시점과 오시는 길을 정리했습니다.`,
    noteTitle: '거리부터 생각해 주세요',
    note: '치아가 부러졌거나 잇몸이 크게 부어 당장 아프다면 울주 가까운 치과에서 먼저 진료를 받으세요. 발치나 염증 조절 같은 첫 처치는 가까운 곳에서 받고, 임플란트 계획은 그다음에 세워도 됩니다.',
    worthH2: '가이드 임플란트로 부산까지 오실 만한 경우',
    worth: [
      '가이드 임플란트는 CT와 구강스캔 데이터로 위치·각도·깊이를 먼저 설계하고, 3D 프린터로 출력한 수술용 가이드를 이용해 계획대로 심는 방식입니다. 신경이나 상악동(위턱뼈 속 빈 공간)과 가까운 부위, 뼈가 부족해 골이식이나 상악동 거상술이 함께 필요할 수 있는 경우, 여러 개를 동시에 심어야 하는 경우에 이점이 큽니다.',
      '조건이 단순한 한 개 식립은 일반 식립으로도 충분히 정밀하게 할 수 있어 가까운 치과가 더 합리적일 수 있습니다. 연세온치과는 디오·덴티스 시스템을 사용합니다.',
    ],
    visitH2: '울주에서 오시는 길',
    visit: [
      '울주군 남부는 부산 기장군·경남 양산시와 경계를 맞대고 있습니다. 열차는 동해선으로 부산 동래 방면에 오신 뒤 도시철도 1호선 온천장역으로 갈아타시면 되고, 1·5번 출구에서 걸어서 3분 거리 허브메디컬타워 901호입니다.',
      '승용차는 노포 방면으로 부산에 들어와 동래·온천장 쪽으로 오시면 되고 건물 주차장이 있습니다. 식립 당일은 부기와 약 복용을 고려해 귀가 동선을 미리 정해 두시면 좋습니다. 환승역과 주차 세부 사항은 미리 확인해 주세요.',
    ],
    planH2: '단계별로 몇 번 오시게 되나요',
    plan: [
      { t: '진단·계획', d: 'CT·구강스캔으로 뼈 상태와 신경 위치를 3차원으로 확인하고, 식립 부위·개수·골이식 여부에 따른 비용과 일정을 안내합니다.' },
      { t: '식립', d: '출력한 가이드로 계획한 위치에 심습니다. 뼈 이식이 함께 필요하면 시간이 늘어날 수 있습니다.' },
      { t: '실밥 제거', d: '대개 7~10일 무렵이며 상황에 따라 다릅니다.' },
      { t: '골유착 뒤 보철', d: '뼈와 임플란트가 붙는 기간(개인·부위에 따라 차이)을 지나 최종 보철을 올리고 교합을 맞춥니다. 긴 수술은 수요일·일요일·공휴일 휴진과 토요일 오후 1시 마감을 피해 월·화·목·금으로 잡는 편이 여유롭습니다.' },
    ],
    faqs: [
      { q: '만 65세 이상이면 임플란트 건강보험이 되나요?', a: '만 65세 이상은 부분 임플란트 건강보험 적용 기준이 따로 있어 진료 시 해당 여부를 확인해 드립니다. 가이드 임플란트 자체는 식립 부위·개수·골이식 여부에 따라 비용이 달라지는 비급여 진료입니다.' },
      { q: '심은 뒤 붓거나 아프면 어떻게 하나요?', a: `식립 직후 부기와 약간의 출혈은 있을 수 있으며 처방과 주의사항을 안내해 드립니다. 예상보다 심해지면 먼저 전화(${PHONE})로 알려 주시고, 급한 상황이면 가까운 치과나 응급실을 찾으세요.` },
      { q: '당뇨나 골다공증이 있어도 받을 수 있나요?', a: '조절 상태가 양호하면 진행하는 경우가 많지만 전신 질환과 흡연은 예후에 영향을 줄 수 있습니다. 복용 중인 약 목록을 챙겨 오시면 진단 때 함께 검토합니다.' },
    ],
    cta: 'CT 진단으로 단계별 일정부터 확인하세요.',
    description: `울산 울주에서 부산 동래구 온천장 ${clinic.nameShort}까지 — 네비게이션 가이드 임플란트 상담 전 알아 둘 단계별 내원 시점, 오시는 방법, 이동할 만한 경우. 급한 통증은 가까운 치과 먼저.`,
  },
}

export const uljuTreatmentSlugs = Object.keys(COPY)

export function UljuAreaPage(treatmentSlug: string, treatmentName: string) {
  const c = COPY[treatmentSlug]
  if (!c) return null
  const path = `/area/${ULJU_SLUG}-${treatmentSlug}`
  const h1 = `울산 울주에서 ${clinic.nameShort} — ${c.label} 상담·내원 안내`
  const crumb = [{ name: '홈', url: '/' }, { name: '지역별 안내', url: '/area' }, { name: c.crumb, url: path }]
  const mapQuery = encodeURIComponent(clinic.address)
  const others = uljuTreatmentSlugs.filter((s) => s !== treatmentSlug)

  const body = html`
  <section class="page-hero">
    <div class="container">
      <p class="eyebrow">울산 울주 → 부산 동래구 온천장 · 원거리 내원 안내</p>
      <h1 style="font-size:var(--t-h2)">${h1}</h1>
      <p class="lead" id="ulju-answer">${c.lead}</p>
    </div>
  </section>
  ${Breadcrumb(crumb)}

  <section class="section--tight">
    <div class="container">
      <div class="detail-grid">
        <div>
          <aside class="ulju-note" data-reveal role="note">
            <strong>${c.noteTitle}</strong>
            <p>${c.note}</p>
          </aside>

          <article class="prose" data-reveal>
            <h2>${c.worthH2}</h2>
            ${raw(c.worth.map((p) => `<p>${p}</p>`).join(''))}
            <p><a href="/treatments/${treatmentSlug}" class="link-arrow">${treatmentName} 진료 자세히 보기 <i class="fas fa-arrow-right"></i></a></p>

            <h2>${c.visitH2}</h2>
            ${raw(c.visit.map((p) => `<p>${p}</p>`).join(''))}

            <h2>${c.planH2}</h2>
            <ul class="ulju-plan">
              ${raw(c.plan.map((p) => `<li><strong>${p.t}</strong> — ${p.d}</li>`).join(''))}
            </ul>
          </article>

          <div class="map-embed" data-reveal style="margin-top:2rem;border-radius:14px;overflow:hidden;box-shadow:0 8px 30px rgba(20,36,62,.08)">
            <iframe src="https://maps.google.com/maps?q=${mapQuery}&z=16&output=embed"
              width="100%" height="360" style="border:0;display:block;filter:grayscale(.12)"
              loading="lazy" referrerpolicy="no-referrer-when-downgrade"
              title="${clinic.nameKo} 위치 — ${clinic.address}"></iframe>
          </div>
          <div data-reveal style="display:flex;gap:.6rem;flex-wrap:wrap;margin-top:.9rem">
            <a href="${clinic.mapUrl}" target="_blank" rel="noopener" class="faq-tab"><i class="fas fa-location-dot"></i> 네이버플레이스</a>
            <a href="https://map.kakao.com/?q=${mapQuery}" target="_blank" rel="noopener" class="faq-tab"><i class="fas fa-map"></i> 카카오맵</a>
            <a href="/directions" class="faq-tab"><i class="fas fa-map-location-dot"></i> 오시는 길</a>
          </div>

          <div class="prose" data-reveal style="margin-top:3rem">
            <h2>울주에서 상담 전에 많이 묻는 질문</h2>
            <div class="enc-faq">
              ${raw(c.faqs.map((f) => `<details><summary>${f.q}</summary><p>${f.a}</p></details>`).join(''))}
            </div>
          </div>

          <div class="prose" data-reveal style="margin-top:2.5rem">
            <h2>함께 보면 좋은 안내</h2>
            <div style="display:flex;gap:.6rem;flex-wrap:wrap;margin-top:.4rem">
              ${raw(others.map((s) => `<a href="/area/${ULJU_SLUG}-${s}" class="faq-tab">${COPY[s].crumb}</a>`).join(''))}
              <a href="/area/oncheonjang" class="faq-tab">온천장 치과 — 위치·진료시간</a>
              <a href="/pricing" class="faq-tab">비급여 수가 안내</a>
            </div>
          </div>
        </div>
        <aside class="sidebar">
          <div class="sidebar-box">
            <h4>병원 위치</h4>
            <p style="font-size:.86rem;line-height:1.7">${clinic.address}</p>
            <p style="font-size:.86rem;font-weight:600;color:var(--ink);margin-top:.4rem">${clinic.subway}</p>
          </div>
          <div class="sidebar-box">
            <h4>진료시간</h4>
            <p style="font-size:.88rem;line-height:1.8">${clinic.hoursSummary}</p>
            <p class="muted" style="font-size:.82rem">${clinic.closedDays}</p>
          </div>
          <div class="sidebar-box">
            <h4>상담·예약</h4>
            <a href="/reservation">예약 상담 신청</a>
            <a href="tel:${clinic.phoneRaw}">${clinic.phone}</a>
            <a href="${clinic.sns.naverBooking}" target="_blank" rel="noopener">네이버 예약</a>
          </div>
        </aside>
      </div>
    </div>
  </section>
  <style>
    .ulju-note{border:1px solid var(--line);border-left:4px solid var(--gold);background:#fff;border-radius:6px;padding:1.1rem 1.3rem;margin:0 0 2rem}
    .ulju-note strong{display:block;color:var(--ink);margin-bottom:.35rem}
    .ulju-note p{margin:0;line-height:1.75;font-size:.95rem}
    .ulju-plan{list-style:none;margin:0 0 1.4rem;padding:0}
    .ulju-plan li{border-bottom:1px solid var(--line);padding:.75rem 0;margin:0;line-height:1.75}
    .enc-faq details{border-bottom:1px solid var(--line);padding:.2rem 0}
    .enc-faq summary{cursor:pointer;font-weight:600;color:var(--ink);padding:1rem 0;list-style:none}
    .enc-faq summary::-webkit-details-marker{display:none}
    .enc-faq summary::before{content:'Q. ';color:var(--gold-2)}
    .enc-faq details p{margin:0 0 1rem}
  </style>

  <section class="section cta-band">
    <div class="container">
      <h2 data-reveal>${c.cta}</h2>
      <a href="/reservation" class="btn btn-primary" data-reveal data-reveal-delay="1" style="margin-top:2rem">예약 상담 신청 <i class="fas fa-arrow-right"></i></a>
    </div>
  </section>
  `
  const title = `${h1} | ${clinic.nameKo}`
  return Layout({
    title,
    description: c.description,
    path,
    keywords: `울산 ${treatmentName}, 울주 ${treatmentName}, 부산 동래 ${treatmentName}, ${clinic.nameShort}`,
    jsonLd: [
      breadcrumbSchema(crumb),
      {
        '@context': 'https://schema.org',
        '@type': 'MedicalWebPage',
        '@id': `${clinic.domain}${path}#webpage`,
        url: `${clinic.domain}${path}`,
        name: h1,
        description: c.description,
        inLanguage: 'ko',
        isPartOf: { '@id': `${clinic.domain}/#website` },
        about: { '@id': `${clinic.domain}/#clinic` },
        lastReviewed: ULJU_DATE,
        dateModified: ULJU_DATE,
        reviewedBy: { '@id': `${clinic.domain}/doctors/${doc.slug}#person` },
        speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '#ulju-answer'] },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        serviceType: treatmentName,
        name: `${treatmentName} — 울산 울주에서 내원`,
        provider: { '@id': `${clinic.domain}/#clinic` },
        areaServed: { '@type': 'AdministrativeArea', name: '울산광역시 울주군' },
        url: `${clinic.domain}/treatments/${treatmentSlug}`,
      },
      faqSchema(c.faqs),
    ],
  }, body)
}
