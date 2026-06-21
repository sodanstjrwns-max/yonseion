import { html, raw } from 'hono/html'
import { Layout, Breadcrumb } from '../components/layout'
import { clinic } from '../data/clinic'
import { treatments } from '../data/treatments'
import { breadcrumbSchema } from '../lib/schema'

// ============================================================================
// 예약 상담 페이지 — 퍼널의 전환 지점. 마찰 최소화 폼 + 전화 즉시 연결
// ============================================================================
export function ReservationPage() {
  const crumb = [{ name: '홈', url: '/' }, { name: '예약 상담', url: '/reservation' }]
  const txOptions = treatments.map((t) => `<option value="${t.name}">${t.name}</option>`).join('')
  const naverCard = clinic.sns.naverBooking ? `
          <div class="sidebar-box rsv-naver">
            <span class="rsv-naver-eyebrow"><i class="fas fa-bolt"></i> 가장 빠른 예약</span>
            <h4>네이버 예약</h4>
            <p class="muted" style="font-size:.88rem;margin:.3rem 0 1rem">날짜·시간을 직접 선택해 바로 예약하세요. 대기 없이 즉시 확정됩니다.</p>
            <a href="${clinic.sns.naverBooking}" target="_blank" rel="noopener" class="rsv-naver-btn">
              <i class="fas fa-calendar-check"></i> 네이버로 바로 예약하기
            </a>
          </div>` : ''

  const body = html`
  <section class="page-hero">
    <div class="container">
      <p class="eyebrow">Reservation</p>
      <h1>예약 상담 신청</h1>
      <p class="lead">남겨주시면 진료시간 내 순차적으로 연락드립니다.<br>급하신 경우 전화가 가장 빠릅니다.</p>
    </div>
  </section>
  ${Breadcrumb(crumb)}

  <section class="section--tight">
    <div class="container">
      <!-- 진행 단계 표시 (퍼널 시각화) -->
      <ol class="rsv-steps" data-reveal aria-label="상담 진행 단계">
        <li class="rsv-step is-active"><span class="rs-num">1</span><span class="rs-label">신청서 작성</span></li>
        <li class="rsv-step"><span class="rs-num">2</span><span class="rs-label">담당자 연락·일정 확정</span></li>
        <li class="rsv-step"><span class="rs-num">3</span><span class="rs-label">내원·정밀 상담</span></li>
      </ol>

      <div class="rsv-grid">
        <!-- 폼 -->
        <form id="rsv-form" class="form-card" data-reveal>
          <div class="form-row">
            <label for="rsv-name">성함 <em>*</em></label>
            <input id="rsv-name" name="name" type="text" required maxlength="30" placeholder="홍길동" autocomplete="name">
          </div>
          <div class="form-row">
            <label for="rsv-phone">연락처 <em>*</em></label>
            <input id="rsv-phone" name="phone" type="tel" required maxlength="20" placeholder="010-0000-0000" autocomplete="tel" inputmode="tel">
          </div>
          <div class="form-row">
            <label for="rsv-treatment">관심 진료</label>
            <select id="rsv-treatment" name="treatment">
              <option value="">선택 안 함 (상담으로 결정)</option>
              ${raw(txOptions)}
            </select>
          </div>
          <div class="form-row">
            <label>희망 시간대 <span class="muted" style="font-weight:400;font-size:.82rem">(선택)</span></label>
            <div class="chip-group" id="rsv-timeslot" role="group" aria-label="희망 시간대">
              <button type="button" class="chip" data-val="평일 오전">평일 오전</button>
              <button type="button" class="chip" data-val="평일 오후">평일 오후</button>
              <button type="button" class="chip" data-val="화요일 야간(~20:00)">화 야간</button>
              <button type="button" class="chip" data-val="토요일 오전">토 오전</button>
            </div>
          </div>
          <div class="form-row">
            <label for="rsv-date">희망 날짜·추가 메모</label>
            <input id="rsv-date" name="preferredDate" type="text" maxlength="60" placeholder="예: 다음 주 화요일 / 빠른 날짜 희망">
          </div>
          <div class="form-row">
            <label for="rsv-message">남기실 말씀</label>
            <textarea id="rsv-message" name="message" rows="4" maxlength="800" placeholder="현재 불편하신 점, 궁금하신 점을 편하게 적어주세요."></textarea>
          </div>
          <div class="form-row form-agree">
            <label class="check">
              <input type="checkbox" name="agreePrivacy" required>
              <span>개인정보 수집·이용에 동의합니다. <a href="/privacy" target="_blank" rel="noopener">자세히</a></span>
            </label>
            <p class="muted" style="font-size:.78rem;margin-top:.5rem">수집 항목: 성함·연락처·상담 내용 / 이용 목적: 예약 상담 연락 / 보유 기간: 상담 완료 후 1년</p>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center" id="rsv-submit">
            상담 신청하기 <i class="fas fa-arrow-right"></i>
          </button>
          <p id="rsv-result" class="form-result" role="status" aria-live="polite"></p>
        </form>

        <!-- 사이드 정보 -->
        <aside class="rsv-aside" data-reveal data-reveal-delay="2">
          ${raw(naverCard)}
          <div class="sidebar-box">
            <h4>전화 상담</h4>
            <a href="tel:${clinic.phoneRaw}" class="rsv-phone"><i class="fas fa-phone"></i> ${clinic.phone}</a>
            <p class="muted" style="font-size:.88rem;margin-top:.6rem">${clinic.hoursSummary}</p>
            <p class="muted" style="font-size:.88rem">${clinic.closedDays}</p>
          </div>
          <div class="sidebar-box">
            <h4>오시는 길</h4>
            <p style="font-size:.92rem;line-height:1.7">${clinic.address}</p>
            <p class="muted" style="font-size:.88rem;margin-top:.5rem">${clinic.directions}</p>
            <a href="/directions" class="link-arrow" style="margin-top:.8rem;display:inline-block;font-size:.9rem">상세 약도 <i class="fas fa-arrow-right"></i></a>
          </div>
          <div class="sidebar-box">
            <h4>상담 안내</h4>
            <p style="font-size:.9rem;line-height:1.8;color:var(--ink-2)">
              정밀 진단 후 치료계획과 비용을 함께 설명드리고, 동의하신 계획대로 진행합니다.
              처음 설명드린 계획과 큰 변함없이 흘러가는 치료를 지향합니다.
            </p>
          </div>
        </aside>
      </div>
    </div>
  </section>

  <script>
  (function () {
    var form = document.getElementById('rsv-form');
    if (!form) return;

    // 희망 시간대 칩 (다중 선택)
    var slot = '';
    var chips = form.querySelectorAll('#rsv-timeslot .chip');
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        c.classList.toggle('is-on');
        var on = [];
        chips.forEach(function (x) { if (x.classList.contains('is-on')) on.push(x.getAttribute('data-val')); });
        slot = on.join(', ');
      });
    });

    // 진행 단계 활성화 — 이름·연락처 입력 시 2단계 하이라이트
    var steps = document.querySelectorAll('.rsv-step');
    function refreshSteps() {
      var n = form.querySelector('#rsv-name').value.trim();
      var p = form.querySelector('#rsv-phone').value.trim();
      if (steps[1]) steps[1].classList.toggle('is-active', !!(n && p));
    }
    form.querySelector('#rsv-name').addEventListener('input', refreshSteps);
    form.querySelector('#rsv-phone').addEventListener('input', refreshSteps);

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var btn = document.getElementById('rsv-submit');
      var result = document.getElementById('rsv-result');
      var fd = new FormData(form);
      // 시간대 칩 + 직접 입력 메모를 preferredDate 한 필드로 합쳐 전송 (API 호환)
      var dateMemo = (fd.get('preferredDate') || '').toString().trim();
      var combined = [slot, dateMemo].filter(Boolean).join(' / ');
      var payload = {
        name: fd.get('name'), phone: fd.get('phone'), treatment: fd.get('treatment'),
        preferredDate: combined, message: fd.get('message'),
        agreePrivacy: !!fd.get('agreePrivacy')
      };
      btn.disabled = true; btn.style.opacity = '.6';
      result.textContent = '접수 중입니다…'; result.className = 'form-result';
      try {
        var res = await fetch('/api/reservations', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        var data = await res.json();
        if (res.ok && data.ok) {
          result.textContent = '✓ 신청이 접수되었습니다. 진료시간 내 순차적으로 연락드리겠습니다.';
          result.className = 'form-result ok';
          form.reset();
          chips.forEach(function (x) { x.classList.remove('is-on'); }); slot = '';
          if (steps[1]) steps[1].classList.add('is-active');
          if (steps[2]) steps[2].classList.add('is-active');
        } else {
          result.textContent = data.error || '접수에 실패했습니다. 전화로 문의 부탁드립니다.';
          result.className = 'form-result err';
        }
      } catch (err) {
        result.textContent = '네트워크 오류가 발생했습니다. 전화(${clinic.phone})로 문의 부탁드립니다.';
        result.className = 'form-result err';
      }
      btn.disabled = false; btn.style.opacity = '';
    });
  })();
  </script>
  `

  return Layout({
    title: `예약 상담 | ${clinic.nameKo}`,
    description: `${clinic.nameKo} 예약 상담 신청 — 온라인 신청 또는 전화 ${clinic.phone}. ${clinic.hoursSummary}.`,
    path: '/reservation',
    jsonLd: [breadcrumbSchema(crumb)],
  }, body)
}
