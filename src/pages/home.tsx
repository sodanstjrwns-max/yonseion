import { html, raw } from 'hono/html'
import { Layout, kinetic } from '../components/layout'
import { clinic } from '../data/clinic'
import { coreTreatments } from '../data/treatments'
import { doctors } from '../data/doctors'
import { organizationSchema, websiteSchema } from '../lib/schema'

// 실사진 제공 전 — 외부 placeholder 대신 깨끗한 CSS 톤 블록(.ph) 사용
// 사진 URL을 받으면 .ph 안의 <img>로 교체만 하면 됨
function phBlock(label: string, ratio = '4/5'): string {
  return `<div class="ph" style="aspect-ratio:${ratio}"><span class="ph-label">${label}</span></div>`
}
// 워드마크용 글자 분할
function splitChars(text: string): string {
  return Array.from(text).map((ch) => `<span class="kc">${ch}</span>`).join('')
}

export function HomePage() {
  const meta = {
    title: `${clinic.nameKo} | ${clinic.tagline}`,
    description: `${clinic.address} · ${clinic.subway}. 자연치아를 닮은 생체모방치의학으로 미소에 젊음을 더하는 ${clinic.nameKo}. 중장년 심미보철·전체임플란트·접착수복 진료.`,
    path: '/',
    jsonLd: [organizationSchema(), websiteSchema()],
  }

  const lead = doctors[0]

  const body = html`
  <!-- ===== HERO : 거대 사진 + 절제 타이포 ===== -->
  <section class="hero-word" id="hero">
    <!-- 거대 ON — 배경 워터마크 오브제 -->
    <div class="hw-mark" aria-hidden="true">${raw(splitChars('ON'))}</div>

    <!-- 상단 코너 메타 -->
    <div class="hw-corner" data-reveal>
      <div class="m-label">${clinic.nameEn} · 부산 동래 · since ${clinic.openedYear}</div>
      <div class="m-label right">Biomimetic Dentistry</div>
    </div>

    <!-- 콘텐츠 : 태그라인이 주인공 -->
    <div class="hw-content">
      <span class="hw-eyebrow" data-reveal>${clinic.nameKo}</span>
      <h1 class="hw-tagline" aria-label="${clinic.tagline}">${raw(kinetic('미소의 젊음을 켜는 치과'))}</h1>
      <p class="hw-mission" data-reveal data-reveal-delay="2">${clinic.mission}</p>
      <div class="hw-cta" data-reveal data-reveal-delay="3">
        <a href="/reservation" class="btn btn-primary">예약 상담 <i class="fas fa-arrow-right"></i></a>
        <a href="/biomimetic" class="link-arrow">생체모방치의학이란 <i class="fas fa-arrow-right"></i></a>
      </div>
    </div>

    <div class="scroll-hint" aria-hidden="true"><span>Scroll</span><i></i></div>
  </section>

  <!-- ===== 미션 한 줄 : 여백 가득 ===== -->
  <section class="section">
    <div class="container">
      <div class="quote" style="max-width:30ch" data-reveal>
        <blockquote>닳고 무너진 치아에<br>다시 자연의 형태를.</blockquote>
        <cite>— ${clinic.nameKo} · 생체모방치의학</cite>
      </div>
    </div>
  </section>

  <hr class="divider container" style="border:0;height:1px;background:var(--line)">

  <!-- ===== 핵심 진료 : 미니멀 인덱스 행 ===== -->
  <section class="section">
    <div class="container">
      <div class="sec-head" data-reveal>
        <div style="display:flex;align-items:center;gap:1.2rem;margin-bottom:1.6rem">
          <span class="sec-index">01</span>
          <span class="eyebrow">Core Treatments</span>
        </div>
        <h2 class="sec-title">세 가지 중심 진료</h2>
        <p class="sec-lead">연세온치과가 가장 깊이 들여다보는 영역입니다. 자연치아를 닮은 결과를 향해, 보존을 우선합니다.</p>
      </div>
      <div class="index-list">
        ${raw(coreTreatments.map((t, i) => `
          <a class="index-row" href="/treatments/${t.slug}" data-reveal data-reveal-delay="${(i % 3) + 1}">
            <span class="num">0${i + 1}</span>
            <span>
              <span class="row-title">${t.name}</span>
              <span class="row-desc">${t.short}</span>
            </span>
            <span class="row-go"><i class="fas fa-arrow-right"></i></span>
          </a>
        `).join(''))}
      </div>
      <div class="mt-3" data-reveal>
        <a href="/treatments" class="link-arrow">전체 진료 안내 <i class="fas fa-arrow-right"></i></a>
      </div>
    </div>
  </section>

  <!-- ===== 풀블리드 사진 (패럴랙스 + 부유 캡션) ===== -->
  <section class="section--tight">
    <figure class="full-bleed img-reveal ph ph--wide" data-reveal style="position:relative;aspect-ratio:21/9">
      <span class="figure-float">연세온치과 · 진료 공간</span>
      <span class="ph-label">CLINIC INTERIOR</span>
    </figure>
  </section>

  <!-- ===== 에디토리얼 스플릿 : 철학 ===== -->
  <section class="section">
    <div class="container">
      <div class="split">
        <div class="figure figure--tall img-reveal ph" data-reveal>
          <span class="figure-float">Biomimetic Approach</span>
          <span class="ph-label">PHILOSOPHY</span>
        </div>
        <div class="split-text" data-reveal data-reveal-delay="2">
          <div style="display:flex;align-items:center;gap:1.2rem;margin-bottom:1.6rem">
            <span class="sec-index">02</span>
            <span class="eyebrow">Our Philosophy</span>
          </div>
          <h2>자연이 만든 형태를<br>가장 가까이 닮게.</h2>
          <p>생체모방치의학은 자연치아의 구조와 물성을 모방하는 접근입니다. 무조건 깎아내기보다, 남은 치아를 살리고 본래의 기능과 형태를 회복하는 것을 우선합니다.</p>
          <p>화려한 수치 대신, 오래 쓰는 정직한 치료. 그것이 미소의 젊음을 오래 지키는 길이라 믿습니다.</p>
          <a href="/biomimetic" class="link-arrow mt-1">더 알아보기 <i class="fas fa-arrow-right"></i></a>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== 의료진 ===== -->
  <section class="section bg-paper-2">
    <div class="container">
      <div class="split split--reverse">
        <div class="figure figure--tall img-reveal ph ph--alt" data-reveal>
          <span class="figure-float">${lead.name} · ${lead.role}</span>
          <span class="ph-label">${lead.name} 대표원장</span>
        </div>
        <div class="split-text" data-reveal data-reveal-delay="2">
          <div style="display:flex;align-items:center;gap:1.2rem;margin-bottom:1.6rem">
            <span class="sec-index">03</span>
            <span class="eyebrow">Director</span>
          </div>
          <h2>${lead.name} <span style="font-size:.4em;color:var(--mist);font-family:var(--sans);font-weight:500">${lead.role}</span></h2>
          <p class="muted" style="font-size:.95rem;margin-bottom:1.4rem">${lead.title}</p>
          <p>${lead.philosophy[0]}</p>
          <a href="/doctors/${lead.slug}" class="link-arrow mt-1">의료진 소개 <i class="fas fa-arrow-right"></i></a>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== 방문 안내 (미니멀 정보) ===== -->
  <section class="section">
    <div class="container">
      <div class="sec-head" data-reveal>
        <div style="display:flex;align-items:center;gap:1.2rem;margin-bottom:1.6rem">
          <span class="sec-index">04</span>
          <span class="eyebrow">Visit</span>
        </div>
        <h2 class="sec-title">오시는 길</h2>
      </div>
      <div class="metrics" style="border-top:1px solid var(--line)">
        <div class="metric" data-reveal>
          <div class="l" style="margin-top:0;margin-bottom:.6rem">위치</div>
          <p class="text-ink" style="font-size:1.05rem;line-height:1.6">${clinic.address}</p>
        </div>
        <div class="metric" data-reveal data-reveal-delay="1">
          <div class="l" style="margin-top:0;margin-bottom:.6rem">교통</div>
          <p class="text-ink" style="font-size:1.05rem;line-height:1.6">${clinic.subway}</p>
        </div>
        <div class="metric" data-reveal data-reveal-delay="2">
          <div class="l" style="margin-top:0;margin-bottom:.6rem">진료시간</div>
          <p class="text-ink" style="font-size:1.05rem;line-height:1.6">${clinic.hoursSummary}<br><span class="muted" style="font-size:.9rem">${clinic.closedDays}</span></p>
        </div>
        <div class="metric" data-reveal data-reveal-delay="3">
          <div class="l" style="margin-top:0;margin-bottom:.6rem">전화</div>
          <p class="text-ink" style="font-size:1.05rem;line-height:1.6"><a href="tel:${clinic.phoneRaw}" class="link-arrow">${clinic.phone}</a></p>
        </div>
      </div>
      <div class="mt-3" data-reveal>
        <a href="/directions" class="link-arrow">상세 약도 보기 <i class="fas fa-arrow-right"></i></a>
      </div>
    </div>
  </section>

  <!-- ===== CTA 밴드 ===== -->
  <section class="section cta-band">
    <div class="container">
      <h2 data-reveal>당신의 미소,<br>지금 다시 켜질 수 있습니다.</h2>
      <p data-reveal data-reveal-delay="1">진단부터 차근차근. 부담 없이 상담부터 시작하세요.</p>
      <a href="/reservation" class="btn btn-primary" data-reveal data-reveal-delay="2">예약 상담 신청 <i class="fas fa-arrow-right"></i></a>
    </div>
  </section>
  `

  return Layout(meta, body)
}
