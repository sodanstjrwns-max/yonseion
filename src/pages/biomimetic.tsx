import { html, raw } from 'hono/html'
import { Layout, Breadcrumb } from '../components/layout'
import { clinic } from '../data/clinic'
import { breadcrumbSchema, faqSchema, speakableSchema } from '../lib/schema'

const bioFaqs = [
  { q: '생체모방치의학(Biomimetic Dentistry)이란 무엇인가요?', a: '자연치아의 구조·물성·기능을 모방하여, 손상된 치아를 최대한 보존하면서 복원하는 치의학 원리입니다. 치아를 크게 삭제해 보철로 덮기보다, 손상된 부위만 정밀하게 수복해 자연치를 살리는 보존적 접근을 지향합니다.' },
  { q: '러버댐 방습이 왜 중요한가요?', a: '접착 치료의 성패는 얼마나 건조한 환경에서 접착했는가에 크게 좌우됩니다. 러버댐은 치료 부위를 침·습기로부터 격리해 접착의 안정성과 유지력을 높입니다. 다소 번거롭더라도 결과의 질을 위해 지키는 원칙입니다.' },
  { q: '온레이·오버레이는 크라운과 어떻게 다른가요?', a: '크라운은 치아 전체를 둘러 깎아 씌우는 방식이고, 온레이·오버레이는 손상된 부분만 부분적으로 수복합니다. 건강한 치아 조직을 더 많이 보존할 수 있다는 점이 차이입니다.' },
  { q: 'IDS(즉시 상아질 봉쇄)란 무엇인가요?', a: '치아를 삭제한 직후, 노출된 상아질을 즉시 접착제로 봉쇄하는 술식입니다. 접착력을 높이고 치아를 보호하는 데 도움을 주는 접착 원칙 중 하나입니다.' },
]

export function BiomimeticPage() {
  const crumb = [{ name: '홈', url: '/' }, { name: '생체모방치의학', url: '/biomimetic' }]
  const body = html`
  <section class="page-hero">
    <div class="container">
      <p class="eyebrow">Biomimetic Dentistry</p>
      <h1>자연을 모방하는 치료,<br>생체모방치의학</h1>
      <p>치아를 최대한 보존하며 자연치의 구조와 기능을 복원하는, 연세온치과의 핵심 진료 철학입니다.</p>
    </div>
  </section>
  ${Breadcrumb(crumb)}

  <section class="section">
    <div class="container prose" style="max-width:820px">
      <h2 class="reveal">생체모방치의학이란?</h2>
      <div class="answer reveal">생체모방치의학(Biomimetic Dentistry)은 자연치아의 구조·물성·기능을 모방하여, 손상된 치아를 최대한 보존하면서 복원하는 치의학 원리입니다.</div>
      <p class="reveal">치아는 한 번 깎으면 다시 자라지 않습니다. 그래서 연세온치과는 "어떻게 하면 최소한으로 삭제하고, 최대한 보존하며, 가장 오래 유지되는 결과를 만들 수 있을까"를 진료의 중심에 둡니다. 주변 치과에서 잘 시행하지 않는 러버댐 방습 하의 레진 빌드업, 온레이·오버레이를 원칙대로 시행하는 이유입니다.</p>
    </div>
  </section>

  <!-- 3원칙 -->
  <section class="section bg-paper2">
    <div class="container">
      <div class="sec-head center"><p class="eyebrow reveal">Principles</p><h2 class="sec-title reveal reveal-d1">생체모방치료의 <span class="gold">세 가지 원칙</span></h2></div>
      <div class="grid grid-3">
        ${raw([
          { n: '01', t: '최소 삭제 (Minimal Invasion)', d: '건강한 치아 조직은 최대한 남깁니다. 손상된 부위만 정밀하게 제거하고 수복합니다.' },
          { n: '02', t: '정밀 접착 (Adhesion)', d: '러버댐 방습과 IDS 등 접착 원칙을 지켜, 자연치와 수복물이 견고하게 결합하도록 합니다.' },
          { n: '03', t: '구조 회복 (Biomimicry)', d: '자연치의 강도·탄성·형태를 모방하여, 씹는 힘을 자연스럽게 분산시키는 구조를 복원합니다.' },
        ].map((p, i) => `
          <div class="card reveal reveal-d${i}">
            <span class="card-no">${p.n}</span>
            <h3>${p.t}</h3>
            <p>${p.d}</p>
          </div>`).join(''))}
      </div>
    </div>
  </section>

  <!-- 비교 (일반 vs 생체모방) -->
  <section class="section">
    <div class="container" style="max-width:900px">
      <div class="sec-head center"><p class="eyebrow reveal">Comparison</p><h2 class="sec-title reveal reveal-d1">접근 방식의 <span class="gold">차이</span></h2></div>
      <div class="reveal" style="overflow:hidden;border:1px solid var(--line);border-radius:16px">
        <table style="width:100%;border-collapse:collapse;font-size:.98rem">
          <thead><tr style="background:var(--navy);color:#fff">
            <th style="padding:1.1rem;text-align:left">구분</th>
            <th style="padding:1.1rem;text-align:left">전통적 접근</th>
            <th style="padding:1.1rem;text-align:left;color:var(--gold-light)">생체모방 접근</th>
          </tr></thead>
          <tbody>
            ${raw([
              ['치아 삭제량', '비교적 많이 삭제', '최소한으로 삭제'],
              ['방습 환경', '상대적으로 덜 강조', '러버댐 방습 적극 활용'],
              ['수복 방식', '크라운으로 전체 피개', '온레이·오버레이로 부분 수복'],
              ['목표', '손상 부위 제거·수복', '자연치 보존 + 구조 회복'],
            ].map((r, i) => `
              <tr style="border-top:1px solid var(--line);${i % 2 ? 'background:var(--paper-2)' : ''}">
                <td style="padding:1rem 1.1rem;font-weight:600;color:var(--navy)">${r[0]}</td>
                <td style="padding:1rem 1.1rem;color:var(--ink-soft)">${r[1]}</td>
                <td style="padding:1rem 1.1rem;color:var(--navy);font-weight:600">${r[2]}</td>
              </tr>`).join(''))}
          </tbody>
        </table>
      </div>
      <p style="text-align:center;color:var(--muted);font-size:.85rem;margin-top:1rem">※ 모든 치료법은 치아 상태에 따라 적용이 달라지며, 정밀 진단 후 결정합니다.</p>
    </div>
  </section>

  <!-- FAQ -->
  <section class="section bg-paper2">
    <div class="container" style="max-width:820px">
      <div class="sec-head center"><p class="eyebrow reveal">FAQ</p><h2 class="sec-title reveal reveal-d1">자주 묻는 질문</h2></div>
      <div class="reveal">
        ${raw(bioFaqs.map((f) => `
          <div class="faq-item" style="border:1px solid var(--line);border-radius:12px;margin-bottom:.8rem;background:#fff;overflow:hidden">
            <button class="faq-q" style="width:100%;text-align:left;padding:1.3rem 1.5rem;font-weight:600;color:var(--navy);display:flex;justify-content:space-between;align-items:center;gap:1rem">
              <span>${f.q}</span><i class="fas fa-plus" style="color:var(--gold);transition:transform .3s"></i>
            </button>
            <div class="faq-a" style="max-height:0;overflow:hidden;transition:max-height .4s var(--ease)"><p style="padding:0 1.5rem 1.3rem;color:var(--ink-soft);margin:0">${f.a}</p></div>
          </div>`).join(''))}
      </div>
    </div>
  </section>

  <section class="section" style="background:linear-gradient(135deg,var(--navy),var(--navy-dark));color:#fff;text-align:center">
    <div class="container">
      <h2 class="sec-title reveal" style="color:#fff">생체모방 치료가 <span class="gold">궁금하신가요?</span></h2>
      <p class="reveal reveal-d1" style="color:rgba(255,255,255,.8);margin:1.2rem 0 2rem">정밀 진단으로 내 치아에 맞는 보존적 치료를 상담받으세요.</p>
      <a href="/reservation" class="btn btn-gold reveal reveal-d2">예약 상담 <i class="fas fa-arrow-right"></i></a>
    </div>
  </section>

  <style>
    .faq-item.open .faq-a { max-height: 320px; }
    .faq-item.open .faq-q i { transform: rotate(45deg); }
  </style>
  `
  return Layout({
    title: `생체모방치의학(Biomimetic Dentistry) | ${clinic.nameKo}`,
    description: `생체모방치의학이란? 자연치아를 최대한 보존하며 복원하는 치의학 원리. 러버댐 방습·온레이·오버레이·IDS 접착 원칙. 부산 동래 연세온치과가 시행하는 보존적 치료 철학.`,
    path: '/biomimetic',
    jsonLd: [breadcrumbSchema(crumb), faqSchema(bioFaqs), speakableSchema(['.answer', 'h1'])],
  }, body)
}
