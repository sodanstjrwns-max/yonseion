// ============================================================================
// 홈 공지 팝업 — 활성 판정·정렬 공통 규칙 (/api/popups 와 관리자 화면이 같이 사용)
// 활성: popup=true · 게시 · (종료일 없음 또는 종료일 >= 오늘, KST)
// 정렬: 상단 고정 먼저 → 최신 작성순. 최대 POPUP_MAX(5)개만 동시에 표시.
// ============================================================================

export const POPUP_MAX = 5

type PopupIdx = { id: string; popup?: boolean; published?: boolean; popupUntil?: string; pinned?: boolean; createdAt?: string }

// 한국 시간 기준 오늘 (YYYY-MM-DD) — 홈 스크립트의 '오늘 하루 보지 않기' 계산과 동일
export function kstToday(): string {
  return new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10)
}

export function isPopupActive(x: PopupIdx, today = kstToday()): boolean {
  return !!x.popup && x.published !== false && (!x.popupUntil || x.popupUntil >= today)
}

// 활성 팝업을 표시 우선순위대로 정렬해 반환 (전체 — 잘라내기는 호출 측에서)
export function sortedActivePopups<T extends PopupIdx>(idx: T[], today = kstToday()): T[] {
  return idx
    .filter((x) => isPopupActive(x, today))
    .sort((a, b) => ((b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)) || String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
}
