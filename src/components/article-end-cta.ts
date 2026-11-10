import { clinic } from '../data/clinic'

/**
 * 글 끝 상담 블록 (2026-11-10) — 칼럼·백과 등 정보 글 상세의 본문 끝에 1개.
 * 정보 글에서 예약·문의로 가는 길을 만든다. 버튼은 clinic.sns 에 정의된 채널만(네이버 예약·전화·카카오 채널).
 * 각 링크의 data-cta="article-end" 는 클릭 측정용 표식이다.
 * 문구는 일반 정보 안내 + 문의 방법만 — 효과·결과 약속이나 재촉 표현을 넣지 않는다(의료광고법).
 * 스타일: static/css/app.css 의 .article-end-cta (사이트 기존 .btn 과 색 토큰만 사용).
 */
export function articleEndCta(): string {
  const btns = [
    clinic.sns.naverBooking
      ? `<a href="${clinic.sns.naverBooking}" target="_blank" rel="noopener" class="btn btn-primary" data-cta="article-end"><i class="fas fa-calendar-check" aria-hidden="true"></i> 네이버 예약</a>`
      : '',
    `<a href="tel:${clinic.phoneRaw}" class="btn btn-ghost" data-cta="article-end"><i class="fas fa-phone" aria-hidden="true"></i> 전화 ${clinic.phone}</a>`,
    clinic.sns.kakaoChannel
      ? `<a href="${clinic.sns.kakaoChannel}" target="_blank" rel="noopener" class="btn btn-ghost" data-cta="article-end"><i class="fas fa-comment" aria-hidden="true"></i> 카카오톡 채널</a>`
      : '',
  ].filter(Boolean).join('')
  return `<div class="article-end-cta">
    <p class="aec-title">직접 확인이 필요하다면</p>
    <p class="aec-desc">이 글은 일반 정보입니다. 내 상태는 진료실에서 확인해야 정확합니다. 진료 시간 안에 ${clinic.nameShort}로 문의하세요.</p>
    <div class="aec-btns">${btns}</div>
  </div>`
}
