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

    <!-- 골드 오빗 — 공전하는 벡터 링 (켜다 On 모티프) -->
    <div class="hw-orbit" aria-hidden="true">
      <svg viewBox="0 0 600 600" fill="none">
        <circle cx="300" cy="300" r="248" stroke="url(#og1)" stroke-width="1" opacity=".5"/>
        <circle cx="300" cy="300" r="292" stroke="var(--gold)" stroke-width=".6" stroke-dasharray="2 10" opacity=".4" class="orbit-dash"/>
        <g class="orbit-rot">
          <circle cx="300" cy="52" r="4" fill="var(--gold)"/>
          <circle cx="300" cy="52" r="9" stroke="var(--gold)" stroke-width=".8" opacity=".45"/>
        </g>
        <g class="orbit-rot-rev">
          <circle cx="300" cy="595" r="2.2" fill="var(--gold-light)" opacity=".9"/>
        </g>
        <defs>
          <linearGradient id="og1" x1="0" y1="0" x2="600" y2="600">
            <stop offset="0" stop-color="#C8A86B" stop-opacity=".7"/>
            <stop offset=".5" stop-color="#AE8A4C" stop-opacity=".15"/>
            <stop offset="1" stop-color="#D9C18C" stop-opacity=".6"/>
          </linearGradient>
        </defs>
      </svg>
    </div>

    <!-- 상단 코너 메타 -->
    <div class="hw-corner" data-reveal>
      <div class="m-label">${clinic.nameEn} · 부산 동래 · since ${clinic.openedYear}</div>
      <div class="m-label right">Biomimetic Dentistry</div>
    </div>

    <!-- 콘텐츠 : 태그라인이 주인공 -->
    <div class="hw-content">
      <span class="hw-eyebrow" data-reveal>${clinic.nameKo}</span>
      <h1 class="hw-tagline" aria-label="${clinic.tagline}">${raw(kinetic('미소의 젊음을'))} <span class="tg-gold">${raw(kinetic('켜는'))}</span> ${raw(kinetic('치과'))}</h1>
      <p class="hw-mission" data-reveal data-reveal-delay="2">${clinic.mission}</p>
      <div class="hw-cta" data-reveal data-reveal-delay="3">
        <a href="/reservation" class="btn btn-primary">예약 상담 <i class="fas fa-arrow-right"></i></a>
        <a href="/biomimetic" class="link-arrow">생체모방치의학이란 <i class="fas fa-arrow-right"></i></a>
      </div>
    </div>

    <div class="scroll-hint" aria-hidden="true"><span>Scroll</span><i></i></div>
  </section>

  <!-- ===== 마퀴 밴드 : 프리미엄 브랜드 스트립 ===== -->
  <div class="marquee" aria-hidden="true">
    <div class="marquee-track">
      ${raw(Array(2).fill(
        ['Biomimetic Dentistry', '치과보철과 전문의', 'Esthetic Prosthetics', '자연치아 보존', 'All-on-X', '미소의 젊음을 켜다']
          .map((w) => `<span class="mq-item">${w}</span><span class="mq-dot">◆</span>`).join('')
      ).join(''))}
    </div>
  </div>

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
        <div class="figure figure--tall img-reveal ph tooth-stage" data-reveal>
          <span class="figure-float">Biomimetic Approach</span>
          <!-- 생체모방 치아 라인아트 — 스크롤 진입 시 스트로크 드로잉 -->
          <svg class="tooth-art" viewBox="0 0 300 380" fill="none" data-draw>
            <path class="td td-1" pathLength="100" d="M150 38 C92 38 64 80 64 132 C64 178 80 206 92 252 C101 287 106 330 124 342 C136 350 144 332 147 300 C149 280 149 268 150 268 C151 268 151 280 153 300 C156 332 164 350 176 342 C194 330 199 287 208 252 C220 206 236 178 236 132 C236 80 208 38 150 38 Z" stroke="var(--ink)" stroke-width="2"/>
            <path class="td td-2" pathLength="100" d="M96 120 C112 96 134 88 150 88 C166 88 188 96 204 120" stroke="var(--gold)" stroke-width="1.6"/>
            <path class="td td-3" pathLength="100" d="M108 156 C124 138 140 132 150 132 C160 132 176 138 192 156" stroke="var(--gold)" stroke-width="1.3" opacity=".75"/>
            <path class="td td-4" pathLength="100" d="M120 192 C132 180 144 176 150 176 C156 176 168 180 180 192" stroke="var(--gold)" stroke-width="1" opacity=".55"/>
            <circle class="td-core" cx="150" cy="230" r="5" fill="var(--gold)"/>
            <text x="150" y="372" text-anchor="middle" class="tooth-cap">BIOMIMETIC · 자연치아의 결을 따라</text>
          </svg>
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
    <div class="cta-orbit" aria-hidden="true">
      <svg viewBox="0 0 600 600" fill="none">
        <circle cx="300" cy="300" r="250" stroke="var(--gold-light)" stroke-width=".8" opacity=".4"/>
        <circle cx="300" cy="300" r="290" stroke="var(--gold-light)" stroke-width=".5" stroke-dasharray="2 12" opacity=".35" class="orbit-dash"/>
        <g class="orbit-rot"><circle cx="300" cy="50" r="3.5" fill="var(--gold-light)"/></g>
      </svg>
    </div>
    <div class="container">
      <h2 data-reveal>당신의 미소,<br>지금 다시 켜질 수 있습니다.</h2>
      <p data-reveal data-reveal-delay="1">진단부터 차근차근. 부담 없이 상담부터 시작하세요.</p>
      <a href="/reservation" class="btn btn-primary" data-reveal data-reveal-delay="2">예약 상담 신청 <i class="fas fa-arrow-right"></i></a>
    </div>
  </section>
  `

  return Layout(meta, body)
}
