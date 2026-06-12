import { html, raw } from 'hono/html'
import { Layout, Breadcrumb } from '../components/layout'
import { clinic } from '../data/clinic'
import { breadcrumbSchema, speakableSchema } from '../lib/schema'

export function MissionPage() {
  const crumb = [{ name: '홈', url: '/' }, { name: '병원미션', url: '/mission' }]
  const body = html`
  <section class="hero" style="min-height:88vh">
    <div class="hero-inner" style="text-align:center;max-width:900px">
      <p class="eyebrow hero-eyebrow reveal">Our Mission</p>
      <h1 class="hero-title reveal reveal-d1" style="font-size:clamp(2.2rem,6vw,5rem)">
        자연치아를 닮은<br><span class="gold">생체모방치의학</span>으로,<br>미소에 젊음을 더한다
      </h1>
      <p class="hero-sub reveal reveal-d2" style="margin-inline:auto">
        연세온치과의원이 존재하는 이유입니다.
      </p>
    </div>
    <div class="scroll-hint"><span>SCROLL</span><span class="bar"></span></div>
  </section>

  ${Breadcrumb(crumb)}

  <!-- 슬로건 -->
  <section class="section">
    <div class="container" style="max-width:840px;text-align:center">
      <p class="eyebrow reveal">Slogan</p>
      <h2 class="font-serif reveal reveal-d1" style="font-size:clamp(2rem,5vw,3.6rem);color:var(--navy);font-style:italic;line-height:1.3;margin-top:1rem">
        "미소의 젊음을 켜는 치과<span class="text-gold">."</span>
      </h2>
      <p class="lead reveal reveal-d2" style="margin-top:2rem">
        나이가 들며 자연스럽게 변하는 치아와 미소. 우리는 자연치아의 기능과 형태를 최대한
        보존하고 복원하여, 환자분의 삶의 질을 높이고 미소에 젊음을 더하는 것을 목표로 합니다.
      </p>
    </div>
  </section>

  <!-- '온' 브랜드 스토리 (원장님 답변 Q2 — 세 가지 의미의 언어유희) -->
  <section class="section">
    <div class="container">
      <div class="sec-head center">
        <p class="eyebrow reveal">Why “On”</p>
        <h2 class="sec-title reveal reveal-d1">${clinic.brandStory.headline}</h2>
        <p class="sec-desc reveal reveal-d2" style="margin-inline:auto">연세온치과의 “온”에는 세 가지 마음이 담겨 있습니다.</p>
      </div>
      <div class="grid grid-3">
        ${raw(clinic.brandStory.meanings.map((m, idx) => `
          <div class="card reveal reveal-d${idx + 1}" style="text-align:center">
            <p class="fraunces" style="font-size:2.6rem;color:var(--gold);font-style:italic">온</p>
            <h3 style="margin-top:.6rem">${m.key}</h3>
            <p style="margin-top:.8rem">${m.desc}</p>
          </div>`).join(''))}
      </div>
    </div>
  </section>

  <!-- 핵심 가치 (Q19·Q28) — 약점은 강점으로 리프레이밍 -->
  <section class="section bg-paper2">
    <div class="container">
      <div class="sec-head center">
        <p class="eyebrow reveal">Core Values</p>
        <h2 class="sec-title reveal reveal-d1">우리가 지키는 <span class="gold">치료의 원칙</span></h2>
        <p class="sec-desc reveal reveal-d2">친절한 말보다, 정직한 치료의 본질로 신뢰를 드립니다.</p>
      </div>
      <div class="grid grid-3">
        ${raw([
          { i: 'fa-shield-halved', t: '원칙을 지키는 치료', d: '러버댐 방습, IDS 등 지켜야 할 접착의 원칙을 지킵니다. 번거롭더라도 유지력 있는 결과를 위해 타협하지 않습니다.' },
          { i: 'fa-tooth', t: '치아 최대 보존', d: '환자의 치아를 최대한 보존하여 활용합니다. 크게 깎기보다, 손상된 부분만 정밀하게 복원하는 것을 우선합니다.' },
          { i: 'fa-comments', t: '명확한 설명', d: '이해하실 수 있도록 명확하게 설명드립니다. 무엇을, 왜, 어떻게 하는지 투명하게 안내합니다.' },
          { i: 'fa-route', t: '포괄적 치료계획', d: '전체 치료계획을 먼저 수립하고, 처음 설명드린 계획대로 일관되게 진행하는 것을 원칙으로 합니다.' },
          { i: 'fa-magnifying-glass', t: '꼼꼼함과 미감', d: '보철과 전문의 특유의 꼼꼼함과 미감으로, 디테일까지 신경 쓴 심미 결과를 추구합니다.' },
          { i: 'fa-microscope', t: '정직한 진단', d: '필요한 치료는 권하고, 필요하지 않은 치료는 권하지 않습니다. 진단의 정직함이 신뢰의 시작입니다.' },
        ].map((v, idx) => `
          <div class="card reveal reveal-d${idx % 3}">
            <i class="fas ${v.i}" style="font-size:1.9rem;color:var(--gold)"></i>
            <h3 style="margin-top:1.1rem">${v.t}</h3>
            <p>${v.d}</p>
          </div>`).join(''))}
      </div>
    </div>
  </section>

  <!-- 원장 메시지 -->
  <section class="section bg-navy" style="position:relative;overflow:hidden">
    <div data-parallax="0.06" style="position:absolute;left:-6%;bottom:-10%;width:480px;height:480px;border-radius:50%;background:radial-gradient(circle,rgba(197,165,114,.12),transparent 70%)"></div>
    <div class="container" style="max-width:860px;position:relative">
      <p class="eyebrow reveal" style="color:var(--gold-light);text-align:center">Director's Message</p>
      <blockquote class="font-serif reveal reveal-d1" style="font-size:clamp(1.4rem,3vw,2.2rem);color:#fff;text-align:center;line-height:1.6;margin-top:1.5rem;font-style:italic">
        "제가 생각하는 좋은 치과는,<br>
        <span class="text-gold">환자분들께서 지금보다 더 나은 삶을 영위할 수 있도록 돕는 곳입니다.</span><br>
        한 단계 업그레이드된 삶의 시작을 연세온치과에서 함께하시길 바랍니다."
      </blockquote>
      <p class="reveal reveal-d2" style="text-align:center;color:var(--gold-light);margin-top:2rem;font-weight:600">
        — 연세온치과의원 대표원장 ${clinic.business.owner}
      </p>
      <div class="reveal reveal-d3" style="text-align:center;margin-top:2rem">
        <a href="/doctors/kim-kyunghee" class="btn btn-gold">대표원장 프로필 보기 <i class="fas fa-arrow-right"></i></a>
      </div>
    </div>
  </section>

  <!-- 다음 단계 인링크 -->
  <section class="section">
    <div class="container">
      <div class="grid grid-2">
        <a href="/biomimetic" class="card reveal" style="display:flex;flex-direction:column;justify-content:space-between;min-height:200px">
          <div><p class="eyebrow">Philosophy</p><h3 style="font-size:1.6rem">생체모방치의학이란?</h3>
          <p>자연치아를 모방하는 우리의 핵심 진료 철학을 더 자세히 알아보세요.</p></div>
          <span class="arrow">알아보기 <i class="fas fa-arrow-right"></i></span>
        </a>
        <a href="/treatments" class="card reveal reveal-d1" style="display:flex;flex-direction:column;justify-content:space-between;min-height:200px">
          <div><p class="eyebrow">Treatments</p><h3 style="font-size:1.6rem">진료 안내</h3>
          <p>중장년 심미보철·전체임플란트·접착수복 등 진료 분야를 확인하세요.</p></div>
          <span class="arrow">진료 보기 <i class="fas fa-arrow-right"></i></span>
        </a>
      </div>
    </div>
  </section>
  `
  return Layout({
    title: `병원미션 | ${clinic.nameKo} · 미소의 젊음을 켜는 치과`,
    description: `${clinic.nameKo}의 미션과 핵심 가치 — 자연치아를 닮은 생체모방치의학으로 치아를 최대한 보존하며 환자의 미소에 젊음을 더합니다. 원칙을 지키는 정직한 치료.`,
    path: '/mission',
    jsonLd: [breadcrumbSchema(crumb), speakableSchema(['.hero-title', 'blockquote'])],
  }, body)
}
