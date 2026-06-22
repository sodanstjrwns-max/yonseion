import { html, raw } from 'hono/html'
import { Layout, Breadcrumb } from '../components/layout'
import { clinic } from '../data/clinic'
import { doctors, getDoctor } from '../data/doctors'
import { treatments } from '../data/treatments'
import { breadcrumbSchema, personSchema, speakableSchema } from '../lib/schema'

export function DoctorsIndex() {
  const crumb = [{ name: '홈', url: '/' }, { name: '의료진', url: '/doctors' }]
  const body = html`
  <section class="page-hero">
    <div class="container">
      <p class="eyebrow">Medical Staff</p>
      <h1>의료진</h1>
      <p>지켜야 할 치료의 원칙을 지키는 의료진이 진료합니다.</p>
    </div>
  </section>
  ${Breadcrumb(crumb)}
  <section class="section">
    <div class="container">
      <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(280px,380px));justify-content:center">
        ${raw(doctors.map((d) => `
          <a href="/doctors/${d.slug}" class="card reveal" style="text-align:center;padding:0;overflow:hidden">
            <div style="aspect-ratio:3/4;background:linear-gradient(135deg,var(--paper-2),var(--line));display:grid;place-items:center;overflow:hidden">
              <img src="${d.photo}" alt="${d.name} ${d.role}" loading="lazy" style="width:100%;height:100%;object-fit:cover" onerror="this.parentElement.innerHTML='<i class=&quot;fas fa-user-md&quot; style=&quot;font-size:4rem;color:var(--gold)&quot;></i>'">
            </div>
            <div style="padding:1.8rem">
              <h2 style="margin-top:0;font-size:1.25rem">${d.name} <span style="font-size:1rem;color:var(--muted);font-weight:500">${d.role}</span></h2>
              <p style="color:var(--gold);font-weight:600;font-size:.92rem">${d.title}</p>
              <span class="arrow" style="justify-content:center">프로필 보기 <i class="fas fa-arrow-right"></i></span>
            </div>
          </a>`).join(''))}
      </div>
    </div>
  </section>
  `
  return Layout({
    title: `의료진 | ${clinic.nameKo}`,
    description: `${clinic.nameKo} 의료진 소개. 치과보철과·통합치의학과 전문의 김경희 대표원장. 자연치 보존을 중시하는 생체모방치의학 진료.`,
    path: '/doctors',
    jsonLd: [breadcrumbSchema(crumb)],
  }, body)
}

export function DoctorDetail(slug: string) {
  const d = getDoctor(slug)
  if (!d) return null
  const crumb = [{ name: '홈', url: '/' }, { name: '의료진', url: '/doctors' }, { name: d.name, url: '/doctors/' + d.slug }]
  // 이 원장이 담당하는 진료 (인링크)
  const myTreatments = treatments.filter((t) => t.doctorSlugs.includes(d.slug))

  const body = html`
  ${Breadcrumb(crumb)}
  <section class="section">
    <div class="container doc-grid" style="display:grid;grid-template-columns:380px 1fr;gap:3.5rem;align-items:start">
      <div class="reveal">
        <div style="aspect-ratio:3/4;border-radius:18px;overflow:hidden;background:linear-gradient(135deg,var(--paper-2),var(--line));display:grid;place-items:center">
          <img src="${d.photo}" alt="${d.name} ${d.role} ${d.title}" style="width:100%;height:100%;object-fit:cover" onerror="this.parentElement.innerHTML='<i class=&quot;fas fa-user-md&quot; style=&quot;font-size:5rem;color:var(--gold)&quot;></i>'">
        </div>
        <a href="/reservation" class="btn btn-navy" style="width:100%;justify-content:center;margin-top:1rem">예약 상담 <i class="fas fa-arrow-right"></i></a>
      </div>
      <div class="reveal reveal-d1">
        <p class="eyebrow">${d.role}</p>
        <h1 style="font-size:clamp(2rem,4vw,3rem);color:var(--navy);margin:.5rem 0">${d.name}</h1>
        <p style="color:var(--gold);font-weight:700;font-size:1.15rem">${d.title}</p>
        <p class="lead" style="margin-top:1.5rem">${raw(d.intro)}</p>

        <h2 style="color:var(--navy);margin-top:2.2rem;font-size:1.2rem"><i class="fas fa-certificate text-gold"></i> 전문의 자격 · 경력</h2>
        <ul style="margin-top:.8rem">
          ${raw([...d.licenses, ...d.career].map((c) => `<li style="padding:.45rem 0;color:var(--ink-soft);border-bottom:1px solid var(--line)"><i class="fas fa-check text-gold" style="font-size:.75rem;margin-right:.6rem"></i>${c}</li>`).join(''))}
        </ul>

        <h2 style="color:var(--navy);margin-top:2rem;font-size:1.2rem"><i class="fas fa-users text-gold"></i> 학회 활동</h2>
        <ul style="margin-top:.8rem">
          ${raw(d.memberships.map((m) => `<li style="padding:.45rem 0;color:var(--ink-soft);border-bottom:1px solid var(--line)"><i class="fas fa-check text-gold" style="font-size:.75rem;margin-right:.6rem"></i>${m}</li>`).join(''))}
        </ul>

        <h2 style="color:var(--navy);margin-top:2rem;font-size:1.2rem"><i class="fas fa-heart text-gold"></i> 진료 철학</h2>
        ${raw(d.philosophy.map((p) => `<p style="color:var(--ink-soft);padding-left:1rem;border-left:3px solid var(--gold);margin:.8rem 0">${p}</p>`).join(''))}
        ${d.personalNote ? raw(`
        <h2 style="color:var(--navy);margin-top:2rem;font-size:1.2rem"><i class="fas fa-comment-medical text-gold"></i> 환자의 마음을 아는 이유</h2>
        <blockquote style="margin:1rem 0 0;padding:1.4rem 1.6rem;background:var(--paper2,#f5f1e6);border-radius:12px;border-left:4px solid var(--gold);color:var(--ink-soft);line-height:1.85;font-size:.98rem;word-break:keep-all">${d.personalNote}</blockquote>`) : ''}
      </div>
    </div>
  </section>

  ${d.greeting ? html`
  <section class="section greeting-sec" id="greeting" style="background:linear-gradient(180deg,var(--paper2,#f6f1e6),#fff)">
    <div class="container container-narrow">
      <div class="greeting-card reveal">
        <span class="greeting-eyebrow"><i class="fas fa-quote-left"></i> 대표원장 인사말</span>
        <h2 class="greeting-headline">
          ${raw(d.greeting.headline.map((line) =>
            d.greeting!.headlineAccent && line.includes(d.greeting!.headlineAccent)
              ? line.replace(d.greeting!.headlineAccent, `<span class="gx-accent">${d.greeting!.headlineAccent}</span>`)
              : line
          ).join('<br>'))}
        </h2>
        <div class="greeting-body">
          ${raw(d.greeting.paragraphs.map((p) => `<p>${p}</p>`).join(''))}
        </div>
        <p class="greeting-sign"><span class="gx-sign-rule"></span>${d.greeting.sign}</p>
      </div>
    </div>
  </section>` : ''}

  ${myTreatments.length ? html`
  <section class="section bg-paper2">
    <div class="container">
      <div class="sec-head"><p class="eyebrow reveal">Treatments</p><h2 class="sec-title reveal reveal-d1">${d.name} 원장이 진료하는 분야</h2></div>
      <div class="grid grid-3">
        ${raw(myTreatments.map((t) => `
          <a href="/treatments/${t.slug}" class="card">
            <h3 style="font-size:1.15rem;margin-top:0">${t.name}</h3>
            <p style="font-size:.9rem">${t.short}</p>
            <span class="arrow" style="font-size:.82rem">보기 <i class="fas fa-arrow-right"></i></span>
          </a>`).join(''))}
      </div>
      <p style="margin-top:2rem" class="reveal"><a href="/cases/gallery?doctor=${d.slug}" class="btn btn-outline">${d.name} 원장 비포/애프터 <i class="fas fa-images"></i></a></p>
    </div>
  </section>` : ''}
  <style>
    @media (max-width:820px){ .doc-grid{ grid-template-columns:1fr !important } }
    /* 대표원장 인사말 */
    .greeting-card{ position:relative;background:#fff;border:1px solid var(--line);border-radius:20px;padding:3.2rem 3.4rem;box-shadow:0 18px 50px rgba(46,58,75,.08) }
    .greeting-card::before{ content:'';position:absolute;left:0;top:2.6rem;bottom:2.6rem;width:4px;background:linear-gradient(180deg,var(--gold),transparent);border-radius:0 4px 4px 0 }
    .greeting-eyebrow{ display:inline-block;font-size:.82rem;font-weight:700;letter-spacing:.06em;color:var(--gold-2,var(--gold));margin-bottom:1.3rem }
    .greeting-eyebrow i{ margin-right:.4rem;opacity:.7 }
    .greeting-headline{ font-family:var(--serif-kr);font-size:clamp(1.5rem,3.2vw,2.1rem);line-height:1.45;color:var(--navy);margin:0 0 1.8rem;word-break:keep-all }
    .greeting-headline .gx-accent{ color:var(--gold-2,var(--gold)) }
    .greeting-body p{ font-size:1rem;line-height:1.95;color:var(--ink-soft);margin:0 0 1.2rem;word-break:keep-all }
    .greeting-body p:last-child{ margin-bottom:0 }
    .greeting-sign{ display:flex;align-items:center;justify-content:flex-end;gap:1rem;margin:2.4rem 0 0;font-family:var(--serif-kr);font-size:1.15rem;color:var(--navy) }
    .gx-sign-rule{ flex:0 0 56px;height:1px;background:var(--gold);opacity:.6 }
    @media (max-width:560px){ .greeting-card{ padding:2.2rem 1.6rem } .greeting-card::before{ left:-1px } }
    /* 모바일에서는 소개문·인용구의 의미단위 줄바꿈을 자연 흐름으로 */
    @media (max-width:600px){ .lead br, blockquote br{ display:none } }
  </style>
  `
  return Layout({
    title: `${d.name} ${d.role} | ${d.title} · ${clinic.nameKo}`,
    description: `${clinic.nameKo} ${d.role} ${d.name}. ${d.licenses.join(', ')}. ${d.career[0]}. 자연치 보존을 중시하는 생체모방 진료.`,
    path: '/doctors/' + d.slug,
    jsonLd: [breadcrumbSchema(crumb), personSchema(d), speakableSchema(['.lead'])],
  }, body)
}

export const doctorSlugs = doctors.map((d) => d.slug)
