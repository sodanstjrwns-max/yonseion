// ============================================================================
// 한글 제목 → 영문 SEO 슬러그 (칼럼·치료사례 주소창용)
// seoul365dental src/lib/db.ts generateSeoSlug + DENTAL_TERM_MAP 를 이식·확장.
//  - 치과 용어/자주 쓰는 표현 사전으로 한글 → 영어 (긴 용어 우선, 용어 안 띄어쓰기 무시)
//  - 사전에 없는 한글(조사·어미 등)은 버림 → 결과가 3단어 미만이면 남은 한글을 로마자로 보충
//  - 소문자·하이픈, 최대 70자(단어 경계에서 자름)
// 새 용어는 아래 TERM_MAP 에 추가하면 관리자 에디터 미리보기·저장에 바로 반영된다.
// ============================================================================

const TERM_MAP: Record<string, string> = {
  // --- 진료 과목 · 술식 ---
  '임플란트': 'implant', '인플란트': 'implant',
  '전체임플란트': 'full-mouth-implant', '전악임플란트': 'full-mouth-implant',
  '발치즉시임플란트': 'immediate-implant', '즉시임플란트': 'immediate-implant', '즉시식립': 'immediate-placement',
  '올온엑스': 'all-on-x', '올온포': 'all-on-4', '올온식스': 'all-on-6', '풀아치': 'full-arch',
  '즉시로딩': 'immediate-loading', '뼈이식': 'bone-graft', '골이식': 'bone-graft',
  '상악동거상술': 'sinus-lift', '상악동': 'sinus', '무치악': 'edentulous',
  '교정': 'orthodontics', '치아교정': 'orthodontics', '치열교정': 'orthodontics',
  '앞니교정': 'front-teeth-orthodontics', '부분교정': 'partial-orthodontics',
  '인비절라인': 'invisalign', '투명교정': 'clear-aligner',
  '라미네이트': 'laminate', '무삭제라미네이트': 'no-prep-laminate', '최소삭제': 'minimal-prep',
  '비니어': 'veneer',
  '충치': 'cavity', '충치치료': 'cavity-treatment',
  '신경치료': 'root-canal', '근관치료': 'root-canal', '재신경치료': 'root-canal-retreatment',
  '생활치수치료': 'vital-pulp-therapy', '치수': 'pulp', '급성치수염': 'acute-pulpitis', '치수염': 'pulpitis',
  '치근단절제술': 'apicoectomy', '치아재식술': 'tooth-replantation', '의도적재식술': 'intentional-replantation',
  '발치': 'extraction', '사랑니': 'wisdom-tooth', '사랑니발치': 'wisdom-tooth-extraction',
  '스케일링': 'scaling', '치석': 'tartar', '치석제거': 'scaling',
  '잇몸': 'gum', '잇몸치료': 'gum-treatment', '잇몸질환': 'gum-disease', '치주': 'periodontal',
  '치주염': 'periodontitis', '치주치료': 'periodontal-treatment', '치은염': 'gingivitis',
  '보철': 'prosthetics', '심미보철': 'cosmetic-prosthetics', '크라운': 'crown', '브릿지': 'bridge',
  '메릴랜드브릿지': 'maryland-bridge', '인레이': 'inlay', '온레이': 'onlay', '오버레이': 'overlay',
  '틀니': 'dentures', '의치': 'dentures', '부분틀니': 'partial-dentures',
  '전악수복': 'full-mouth-rehabilitation', '전체구강회복': 'full-mouth-rehabilitation',
  '구강회복': 'oral-rehabilitation', '수복치료': 'restoration', '수복': 'restoration',
  '접착수복': 'adhesive-restoration', '레진수복': 'resin-restoration', '레진': 'resin',
  '세라믹': 'ceramic', '지르코니아': 'zirconia', '금니': 'gold-crown',
  '생체모방': 'biomimetic', '보존적': 'conservative', '보존치료': 'conservative-treatment',
  '본드필': 'bondfill', '블랙트라이앵글': 'black-triangle',
  '이갈이': 'bruxism', '이악물기': 'clenching', '스플린트': 'splint', '턱관절': 'tmj',
  '치아마모': 'tooth-wear', '치경부마모증': 'cervical-abrasion', '치경부마모': 'cervical-abrasion', '마모': 'wear',
  '시린이': 'sensitive-teeth', '시린치아': 'sensitive-teeth', '지각과민': 'tooth-sensitivity',
  '고름': 'abscess', '농양': 'abscess', '염증': 'inflammation', '금간치아': 'cracked-tooth', '크랙': 'crack',
  '떼운': 'filling', '때운': 'filling', '떼운곳': 'filling',
  '수면진료': 'sedation', '수면치료': 'sedation', '수술': 'surgery',
  '소아': 'pediatric', '소아치과': 'pediatric-dentistry',
  '심미': 'cosmetic', '심미치료': 'cosmetic-dentistry', '미백': 'whitening', '치아미백': 'teeth-whitening',
  '디지털': 'digital', '파노라마': 'panoramic', '구강스캐너': 'intraoral-scanner',
  // --- 부위 ---
  '앞니': 'front-tooth', '앞니하나': 'one-front-tooth', '아랫니': 'lower-tooth', '윗니': 'upper-tooth',
  '어금니': 'molar', '전치부': 'anterior', '전치': 'anterior', '구치부': 'posterior',
  '상악': 'upper', '하악': 'lower', '치아신경': 'tooth-nerve', '신경': 'nerve', '치아뿌리': 'tooth-root',
  '뼈': 'bone', '뼈가없': 'bone-loss', '뼈가부족': 'bone-loss', '얼굴': 'face', '미소': 'smile',
  // --- 일반 ---
  '치과': 'dental', '치아': 'tooth', '치아건강': 'dental-health', '구강': 'oral', '구강건강': 'oral-health',
  '통증': 'pain', '치통': 'toothache', '비용': 'cost', '가격': 'price', '후기': 'review',
  '과정': 'process', '치료과정': 'treatment-process', '기간': 'duration', '치료기간': 'treatment-duration',
  '수명': 'lifespan', '관리': 'care', '주의사항': 'precautions', '부작용': 'side-effects',
  '장단점': 'pros-cons', '장점': 'benefits', '단점': 'drawbacks',
  '차이': 'difference', '비교': 'comparison', '종류': 'types', '종류가아닙니다': 'not-a-type',
  '선택지': 'option', '선택': 'choice', '가이드': 'guide', '총정리': 'complete-guide',
  '방법': 'options', '이유': 'why', '오해': 'myth', '사실': 'facts', '이야기': 'story',
  '치료': 'treatment', '진단': 'diagnosis', '검진': 'checkup', '상담': 'consultation',
  '실패': 'failure', '신호': 'sign', '원인': 'causes', '증상': 'symptoms', '예방': 'prevention',
  '치아를살리는': 'save-the-tooth', '치아신경을지키는': 'preserve-tooth-nerve', '신경을살리는': 'save-the-nerve',
  '마지막': 'last', '살리는': 'save', '살리기': 'save', '지키는': 'preserve', '지키기': 'preserve',
  '맞춤': 'custom', '대신': 'instead', '임플란트대신': 'instead-of-implant', '금니대신': 'instead-of-gold',
  '틀니말고': 'beyond-dentures', '임플란트전': 'before-implant',
  '필요한경우': 'when-needed', '꼭필요한': 'when-needed', '필요': 'need',
  '달라진': 'changing', '바꾸는': 'changes', '어렵': 'difficult', '까다로': 'demanding',
  '쉽다': 'easy', '쉬운': 'easy', '더쉽다': 'easier', '더쉬운': 'easier', '더비싼': 'costlier', '비싼': 'expensive', '공임': 'labor-cost',
  '자연스러움': 'natural-look', '자연스러운': 'natural', '우선': 'first',
  '나이보다': 'over-age', '나이': 'age', '제약이아닙니다': 'no-limit', '제약': 'limit',
  '늙는': 'aging', '노화': 'aging', '치아도늙': 'teeth-age-too', '얼굴만': 'not-just-face',
  '밤새': 'night', '잠못이루': 'sleepless', '떨어지': 'falling-out', '다시찾은': 'regained',
  '안내': 'guide', '진료': 'dental-care', '진료안내': 'clinic-guide', '진료일정': 'clinic-schedule', '휴진': 'closed',
  '연휴': 'holiday', '추석': 'chuseok', '설날': 'lunar-new-year', '공지': 'notice', '이벤트': 'event', '얼마': 'how-much',
  '1개': 'one', '한개': 'one', '하나': 'one', '두개': 'two',
  // --- 환자 ---
  '환자': 'patient', '전신질환자': 'medically-compromised', '전신질환': 'systemic-disease',
  '중장년': 'middle-aged', '어르신': 'senior', '노인': 'elderly', '고령': 'senior',
  '어린이': 'children', '청소년': 'teenager', '남성': 'male', '여성': 'female',
  // --- 지역 ---
  '부산': 'busan', '동래': 'dongnae', '온천장': 'oncheonjang', '온천동': 'oncheon-dong',
}

// 로마자 보충용 — 단어 끝 조사 제거
const PARTICLE_RE = /(에서는|으로는|에서|으로|이란|이라는|라는|에게|께서|까지|부터|처럼|보다|이나|은|는|이|가|을|를|의|에|와|과|로|도|만|요)$/

function escapeRe(s: string) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') }

// 용어 안의 띄어쓰기 무시("생활치수 치료" = "생활치수치료"), 긴 용어 우선
const TERMS = Object.keys(TERM_MAP).sort((a, b) => b.length - a.length)
const TERM_RE = new RegExp(
  TERMS.map((t) => (t.length >= 3 ? [...t].map(escapeRe).join('\\s*') : escapeRe(t))).join('|'),
  'g',
)
const lookup = (m: string) => TERM_MAP[m.replace(/\s+/g, '')] || ''

// 개정 로마자 표기(음운 변동 없는 단순판) — 사전에 없는 단어 보충용
const CHO = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h']
const JUNG = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i']
const JONG = ['', 'k', 'k', 'k', 'n', 'n', 'n', 't', 'l', 'k', 'm', 'l', 'l', 'l', 'p', 'l', 'm', 'p', 'p', 't', 't', 'ng', 't', 't', 'k', 't', 'p', 't']
export function romanize(s: string): string {
  let out = ''
  for (const ch of s) {
    const code = ch.charCodeAt(0) - 0xac00
    if (code < 0 || code > 11171) { out += /[a-z0-9]/i.test(ch) ? ch.toLowerCase() : ''; continue }
    out += CHO[Math.floor(code / 588)] + JUNG[Math.floor((code % 588) / 28)] + JONG[code % 28]
  }
  return out
}

type Seg = { en: string } | { ko: string }

function segments(title: string): Seg[] {
  const text = title.normalize('NFC')
    .replace(/(\d+)\s*대(?=\s|[가-힣]|$|[^\w])/g, ' $1s ') // 40대 → 40s
    .replace(/(\d+)\s*(년|월|일|개월|세)(?=\s|[가-힣]|$|[^\w])/g, (_m, n, u) => ` ${n}${({ 년: '', 월: '', 일: '', 개월: '-months', 세: '-years-old' } as Record<string, string>)[u]} `)
    .replace(/[“”"'‘’`()[\]{}<>?!.,:;·…—–/\\|~^*&%$#@+=]/g, ' ')
  const segs: Seg[] = []
  const pushRest = (s: string) => {
    for (const w of s.split(/[\s_]+/)) {
      if (!w) continue
      // 한글·영문이 붙은 단어는 쪼갠다 (예: "vpt생활" → vpt / 생활). "All-on-X" 같은 영문은 한 덩어리
      for (const part of w.match(/[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*|[가-힣]+/g) || []) {
        if (/[가-힣]/.test(part)) segs.push({ ko: part })
        else segs.push({ en: part.toLowerCase() })
      }
    }
  }
  let last = 0
  for (const m of text.matchAll(TERM_RE)) {
    pushRest(text.slice(last, m.index))
    const en = lookup(m[0])
    if (en) segs.push({ en })
    last = (m.index || 0) + m[0].length
  }
  pushRest(text.slice(last))
  return segs
}

export function cleanSlug(s: string, max = 70): string {
  let out = String(s || '').toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  if (out.length > max) {
    out = out.slice(0, max)
    const cut = out.lastIndexOf('-')
    if (cut >= 20) out = out.slice(0, cut)
    out = out.replace(/-+$/, '')
  }
  return out
}

/**
 * 한글 제목 → 영문 슬러그. 결과가 비면 fallbackPrefix-<시간> 형태.
 * @param fallbackPrefix 단어가 3개 미만일 때 앞에 붙일 말 (예: 'dental-column')
 */
export function generateSeoSlug(title: string, fallbackPrefix = 'dental'): string {
  const segs = segments(title || '')
  const seen = new Set<string>()
  const pick = (romanizeKo: boolean) => {
    const out: string[] = []
    for (const s of segs) {
      let v = ''
      if ('en' in s) v = s.en
      else if (romanizeKo) v = romanize(s.ko.replace(PARTICLE_RE, '') || s.ko)
      if (!v || seen.has(v)) continue
      seen.add(v); out.push(v)
    }
    seen.clear()
    return out
  }
  let parts = pick(false)
  const words = (p: string[]) => p.join('-').split('-').filter(Boolean).length
  if (words(parts) < 3) parts = pick(true)
  let slug = cleanSlug(parts.join('-'))
  if (words(slug ? [slug] : []) < 3) slug = cleanSlug(`${fallbackPrefix}-${slug}`)
  if (slug.split('-').filter(Boolean).length < 2) slug = cleanSlug(`${fallbackPrefix}-${Date.now().toString(36)}`)
  return slug
}

export const SLUG_RE = /^[a-z0-9-]{3,80}$/
export function isValidSlug(s: string): boolean {
  return SLUG_RE.test(s) && !/^-|-$|--/.test(s)
}

/** 이미 쓰는 주소와 겹치면 -2, -3 … 을 붙인다 */
export function uniqueSlug(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base
  for (let i = 2; i < 1000; i++) {
    const cand = `${base.slice(0, 76)}-${i}`
    if (!taken.has(cand)) return cand
  }
  return `${base.slice(0, 70)}-${Date.now().toString(36)}`
}
