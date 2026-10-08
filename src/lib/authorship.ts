// ===== 칼럼 작성 주체 (2026-10-08, 사용자 승인) =====
// 원장을 저자·감수자로 표시하는 건 원장이 쓰거나 검토했다는 근거가 있을 때만 한다.
//
// 대행사 투입 글 — 원장 작성·검토 근거 없음 (R2 columns/<id>.json, authorSlug 는 시드 스크립트가 넣은 값):
//   col_all-on-x-confidence, col_esthetic-midlife   ← scripts/make-columns.mjs (커밋 86c7350, 2026-06-17 R2 시드)
//   col_2efb0d25cd, col_cd6d85a270, col_4910a7da30  ← scripts/seed/gen_columns.py (커밋 e4ed855, 2026-06-17 R2 시드)
//   (make-columns.mjs 의 col_biomimetic-3-misunderstandings 는 라이브 인덱스에 없음 — 들어오면 같이 병원 발행)
// → 작성·발행 = 병원(/#clinic), reviewedBy·lastReviewed 없음, 화면엔 일반 건강정보 안내.
//
// 관리자 칼럼 에디터에서 병원이 원장을 지정해 올린 글(위 목록 밖)은 기존 표시(원장 작성·감수)를 유지한다.
// 관리자에서 '병원 발행'(authorSlug = 'clinic')을 고르면 원장 이름이 붙지 않는다(새 글 기본값).
import { getDoctor } from '../data/doctors'

export const AGENCY_SEED_COLUMN_IDS = new Set<string>([
  'col_all-on-x-confidence',
  'col_esthetic-midlife',
  'col_biomimetic-3-misunderstandings',
  'col_2efb0d25cd',
  'col_cd6d85a270',
  'col_4910a7da30',
])
export const CLINIC_AUTHOR_SLUG = 'clinic'
export const CLINIC_GENERAL_INFO_NOTE = '일반 건강정보입니다. 진료 판단은 내원 상담에서 원장이 직접 합니다.'

export const isAgencyColumn = (c: { id?: string | null }) => AGENCY_SEED_COLUMN_IDS.has(String(c.id || ''))

/** 원장 저자를 표시해도 되는 글이면 그 원장, 아니면 undefined(= 병원 발행). */
export const columnDoctor = (c: { id?: string | null; authorSlug?: string | null }) =>
  isAgencyColumn(c) || !c.authorSlug ? undefined : getDoctor(c.authorSlug)
