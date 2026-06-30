import { html, raw } from 'hono/html'
import { Layout, Breadcrumb } from '../components/layout'
import { FaqAccordion } from '../components/faq'
import { clinic } from '../data/clinic'
import { treatments, getTreatment, coreTreatments, treatmentGroups, treatmentsByGroup, type Treatment } from '../data/treatments'
import { getDoctor } from '../data/doctors'
import { faqGroups } from '../data/faqs'
import { getEntry } from '../data/encyclopedia'
import { breadcrumbSchema, procedureSchema, speakableSchema, howToSchema, medicalWebPageSchema, itemListSchema, compareQaSchema } from '../lib/schema'
import { autoLink } from '../lib/inlink'

// ---------- 진료 전체 목록 ----------
export function TreatmentsIndex() {
  const crumb = [{ name: '홈', url: '/' }, { name: '진료안내', url: '/treatments' }]
  const body = html`
  <section class="page-hero">
    <div class="container">
      <p class="eyebrow">Treatments</p>
      <h1>진료 안내</h1>
      <p class="lead" id="tx-index-answer">${clinic.nameKo}는 생체모방치의학 원칙을 바탕으로, 치아를 최대한 보존하는 진료를 제공합니다.<br>중장년 심미보철·전체임플란트(All-on-X)·접착수복 등 정밀 진료부터 보존·치주, 턱관절 치료까지<br>${treatments.length}개 진료 과목을 ${clinic.subway} 위치에서 운영합니다.</p>
    </div>
  </section>
  ${Breadcrumb(crumb)}

  <section class="section">
    <div class="container">
      <div class="sec-head"><p class="eyebrow reveal">Signature</p><h2 class="sec-title reveal reveal-d1">집중 진료</h2></div>
      <div class="grid grid-3">
        ${raw(coreTreatments.map((t, i) => `
          <a href="/treatments/${t.slug}" class="core-card reveal reveal-d${i + 1}">
            <img src="/static/img/tx-${t.slug}.jpg?v=20260621b" alt="${t.name}" loading="lazy" onerror="this.style.display='none'">
            <span class="tag">0${i + 1} · ${t.group}</span>
            <h3>${t.name}</h3><p>${t.short}</p>
            <span class="arrow">자세히 보기 <i class="fas fa-arrow-right"></i></span>
          </a>`).join(''))}
      </div>
    </div>
  </section>

  <section class="section bg-paper2">
    <div class="container">
      <div class="sec-head"><p class="eyebrow reveal">All Treatments</p><h2 class="sec-title reveal reveal-d1">전체 진료 과목</h2></div>
      ${raw(treatmentGroups.map((g) => `
        <div class="reveal" style="margin-bottom:2.5rem">
          <h3 style="color:var(--navy);font-size:1.3rem;border-bottom:2px solid var(--gold);display:inline-block;padding-bottom:.4rem;margin-bottom:1.2rem">${g}</h3>
          <div class="grid grid-3">
            ${treatmentsByGroup(g).map((t) => `
              <a href="/treatments/${t.slug}" class="card" style="padding:1.6rem">
                <h3 style="font-size:1.15rem;margin-top:0">${t.name}${t.category === 'core' ? ' <span class="pill" style="font-size:.65rem;padding:.15rem .5rem">핵심</span>' : ''}</h3>
                <p style="font-size:.9rem">${t.short}</p>
                <span class="arrow" style="font-size:.82rem">보기 <i class="fas fa-arrow-right"></i></span>
              </a>`).join('')}
          </div>
        </div>`).join(''))}
    </div>
  </section>
  `
  return Layout({
    title: `진료안내 | ${clinic.nameKo} · 부산 동래 생체모방치과`,
    description: `${clinic.nameKo} 진료 안내 — 중장년 심미보철, 전체임플란트(All-on-X), 생체모방 접착수복, 턱관절·교합치료 등. 치아를 최대한 보존하는 정밀 진료.`,
    path: '/treatments',
    jsonLd: [
      breadcrumbSchema(crumb),
      itemListSchema({
        name: `${clinic.nameKo} 진료 과목`,
        items: treatments.map((t) => ({ name: t.name, url: '/treatments/' + t.slug, description: t.short })),
      }),
      speakableSchema(['#tx-index-answer']),
    ],
  }, body)
}

// ---------- 진료 상세 ----------
export function TreatmentDetail(slug: string) {
  const t = getTreatment(slug)
  if (!t) return null
  const crumb = [{ name: '홈', url: '/' }, { name: '진료안내', url: '/treatments' }, { name: t.name, url: '/treatments/' + t.slug }]
  const docs = t.doctorSlugs.map(getDoctor).filter(Boolean)
  const related = t.relatedTreatments.map(getTreatment).filter(Boolean) as Treatment[]
  const faqGroup = faqGroups[t.faqRef]
  // 진료별 전용 FAQ + 그룹 FAQ 병합 (중복 질문 제거) → 더 풍부한 FAQPage
  const mergedFaqs = [
    ...(t.faqs || []),
    ...(faqGroup?.faqs || []).filter((g) => !(t.faqs || []).some((f) => f.q === g.q)),
  ]
  // 백과사전 크로스링크 (존재하는 엔트리만)
  const encRefs = (t.encyclopediaRefs || [])
    .map((s) => { const e = getEntry(s); return e ? { slug: s, term: e.term } : null })
    .filter(Boolean) as { slug: string; term: string }[]

  const body = html`
  <section class="page-hero">
    <div class="container">
      <p class="eyebrow">${t.group}${t.category === 'core' ? ' · 집중 진료' : ''}</p>
      <h1>${t.name}</h1>
      <p>${t.short}</p>
    </div>
  </section>
  ${Breadcrumb(crumb)}

  <section class="section">
    <div class="container tx-grid" style="display:grid;grid-template-columns:1fr 320px;gap:3.5rem;align-items:start">
      <div class="prose" style="max-width:none">
        <p class="lead reveal" id="tx-answer" style="margin-bottom:2rem">${t.hero}</p>

        ${raw(`
          <nav class="tx-toc reveal" aria-label="목차">
            <span class="tx-toc-label"><i class="fas fa-list-ul"></i> 이 페이지에서 확인하실 내용</span>
            <ul>
              ${t.symptoms?.length ? '<li><a href="#tx-symptoms">이런 분께 권합니다</a></li>' : ''}
              ${t.sections.slice(0, 4).map((s, i) => `<li><a href="#tx-sec-${i}">${s.q.replace(/<[^>]+>/g, '')}</a></li>`).join('')}
              ${t.compare ? '<li><a href="#tx-compare">비교 한눈에 보기</a></li>' : ''}
              ${t.process?.length ? '<li><a href="#tx-process">진료 과정</a></li>' : ''}
              ${t.aftercare?.length ? '<li><a href="#tx-aftercare">회복·관리</a></li>' : ''}
              ${t.videos?.length ? '<li><a href="#tx-videos">영상으로 보기</a></li>' : ''}
              ${mergedFaqs.length ? '<li><a href="#tx-faq">자주 묻는 질문</a></li>' : ''}
            </ul>
          </nav>`)}

        ${t.symptoms?.length ? raw(`
          <div class="symptom-box reveal" id="tx-symptoms" style="background:var(--charcoal);border-radius:14px;padding:1.9rem 2.1rem;margin-bottom:2.4rem;box-shadow:0 10px 34px rgba(0,0,0,.16)">
            <h2 style="margin:0 0 1.2rem;font-size:1.15rem;color:#fff;font-family:var(--serif-kr)"><i class="fas fa-circle-check" style="color:var(--gold-light);margin-right:.5rem"></i>이런 분께 권합니다</h2>
            <ul style="margin:0;padding:0;list-style:none;display:grid;gap:.85rem">
              ${t.symptoms.map((s) => `<li style="display:flex;gap:.8rem;align-items:flex-start;font-size:.96rem;color:rgba(255,255,255,.86);line-height:1.6"><i class="fas fa-check" style="color:var(--gold-light);margin-top:.3rem;flex-shrink:0;font-size:.82rem"></i><span>${s}</span></li>`).join('')}
            </ul>
          </div>`) : ''}

        ${raw(autoLink(t.sections.map((s, i) => `
          <div class="reveal reveal-d${i % 3}" id="tx-sec-${i}">
            <h2>${s.q}</h2>
            <div class="answer">${s.a}</div>
            ${s.body ? `<p>${s.body}</p>` : ''}
            ${s.image ? `<figure class="tx-sec-figure">
              <img src="${s.image.src}" alt="${s.image.alt}" loading="lazy">
              ${s.image.caption ? `<figcaption>${s.image.caption}</figcaption>` : ''}
            </figure>` : ''}
          </div>`).join(''), 12))}

        ${t.compare ? raw(`
          <div class="tx-compare reveal" id="tx-compare" style="margin-top:2.6rem">
            <h2 style="margin-bottom:1.1rem">${t.compare.title}</h2>
            <div class="tx-table-wrap">
              <table class="tx-table tx-compare-table">
                <thead><tr>${t.compare.cols.map((c, i) => `<th${i === 0 ? ' class="tx-th-first"' : ''}>${c}</th>`).join('')}</tr></thead>
                <tbody>
                  ${t.compare.rows.map((r) => `<tr>${r.map((cell, i) => i === 0 ? `<th scope="row">${cell}</th>` : `<td>${cell}</td>`).join('')}</tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>`) : ''}

        ${t.caseImages?.length ? raw(`
          <div class="tx-cases reveal" id="tx-cases" style="margin-top:2.8rem">
            <h2 style="margin-bottom:1.2rem"><i class="fas fa-images" style="color:var(--gold);margin-right:.5rem"></i>실제 진료 케이스</h2>
            <div class="tx-case-grid">
              ${t.caseImages.map((c) => `
                <figure class="tx-case-card">
                  <img src="${c.src}" alt="${c.alt}" loading="lazy">
                  <figcaption>${c.caption}</figcaption>
                </figure>`).join('')}
            </div>
            <p style="margin-top:1rem;font-size:.82rem;color:var(--muted)">※ 실제 치료 사례이며, 결과는 환자의 구강 상태에 따라 개인차가 있을 수 있습니다.</p>
          </div>`) : ''}

        ${t.process?.length ? raw(`
          <h2 class="reveal" id="tx-process" style="margin-top:2.5rem">진료는 이렇게 진행됩니다</h2>
          <ol class="tx-steps reveal">
            ${t.process.map((p, i) => `
              <li>
                <span class="tx-step-num">${i + 1}</span>
                <div><strong>${p.step}</strong><span>${p.desc}</span></div>
              </li>`).join('')}
          </ol>`) : ''}

        ${t.procedures ? raw(`
          <h2 class="reveal" style="margin-top:2.5rem">세부 시술</h2>
          <div class="grid grid-2 reveal" style="margin-top:1rem">
            ${t.procedures.map((p) => `
              <div style="border:1px solid var(--line);border-radius:12px;padding:1.3rem;background:#fff">
                <h3 style="font-size:1.05rem;margin:0 0 .4rem;color:var(--navy)">${p.name}</h3>
                <p style="margin:0;font-size:.92rem;color:var(--ink-soft)">${p.desc}</p>
              </div>`).join('')}
          </div>`) : ''}

        ${t.aftercare?.length ? raw(`
          <h2 class="reveal" id="tx-aftercare" style="margin-top:2.6rem">회복과 관리, 이렇게 도와드립니다</h2>
          <div class="tx-after reveal">
            ${t.aftercare.map((a) => `
              <div class="tx-after-item">
                <span class="tx-after-phase"><i class="fas fa-leaf"></i> ${a.phase}</span>
                <p>${a.desc}</p>
              </div>`).join('')}
          </div>`) : ''}

        ${t.evidence?.length ? raw(`
          <div class="tx-evidence reveal" style="margin-top:2.4rem">
            <h3 style="font-size:1rem;margin:0 0 1rem;color:var(--navy)"><i class="fas fa-microscope" style="color:var(--gold);margin-right:.5rem"></i>진료 기준·근거</h3>
            <div class="tx-evidence-grid">
              ${t.evidence.map((e) => `
                <div class="tx-evidence-card">
                  <span class="tx-ev-label">${e.label}</span>
                  <strong class="tx-ev-value">${e.value}</strong>
                  ${e.note ? `<small class="tx-ev-note">${e.note}</small>` : ''}
                </div>`).join('')}
            </div>
          </div>`) : ''}

        ${t.videos?.length ? raw(`
          <div class="tx-videos reveal" id="tx-videos" style="margin-top:2.8rem">
            <h2 style="margin-bottom:1.2rem"><i class="fas fa-circle-play" style="color:var(--gold);margin-right:.5rem"></i>영상으로 보는 ${t.name}</h2>
            <figure style="margin:0 0 1.4rem">
              <div class="tx-video-frame" style="position:relative;width:100%;aspect-ratio:16/9;border-radius:14px;overflow:hidden;background:#000;box-shadow:0 12px 38px rgba(0,0,0,.18)">
                <iframe src="https://www.youtube-nocookie.com/embed/${t.videos[0].id}" title="${t.videos[0].title}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" style="position:absolute;inset:0;width:100%;height:100%;border:0"></iframe>
              </div>
              <figcaption style="margin-top:.8rem;font-size:.9rem;color:var(--ink-soft);line-height:1.6"><strong style="color:var(--navy);display:block;margin-bottom:.2rem">${t.videos[0].title}</strong>${t.videos[0].caption}</figcaption>
            </figure>
            ${t.videos.length > 1 ? `<div class="tx-video-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.4rem">
              ${t.videos.slice(1).map((v) => `
                <figure style="margin:0">
                  <div class="tx-video-frame" style="position:relative;width:100%;aspect-ratio:16/9;border-radius:12px;overflow:hidden;background:#000;box-shadow:0 8px 26px rgba(0,0,0,.14)">
                    <iframe src="https://www.youtube-nocookie.com/embed/${v.id}" title="${v.title}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" style="position:absolute;inset:0;width:100%;height:100%;border:0"></iframe>
                  </div>
                  <figcaption style="margin-top:.6rem;font-size:.84rem;color:var(--ink-soft);line-height:1.55"><strong style="color:var(--navy);display:block;margin-bottom:.15rem">${v.title}</strong>${v.caption}</figcaption>
                </figure>`).join('')}
            </div>` : ''}
          </div>`) : ''}

        ${t.priceNote || t.caution ? raw(`
          <div class="notice-box reveal" style="margin-top:2.6rem;display:grid;gap:1rem">
            ${t.priceNote ? `<div style="background:#fff;border:1px solid var(--line);border-radius:12px;padding:1.4rem 1.6rem">
              <h3 style="margin:0 0 .5rem;font-size:1rem;color:var(--navy)"><i class="fas fa-won-sign" style="color:var(--gold);margin-right:.5rem"></i>비용·보험 안내</h3>
              <p style="margin:0;font-size:.9rem;color:var(--ink-soft);line-height:1.7">${t.priceNote}</p>
            </div>` : ''}
            ${t.caution ? `<div style="background:#fff;border:1px solid var(--line);border-radius:12px;padding:1.4rem 1.6rem">
              <h3 style="margin:0 0 .5rem;font-size:1rem;color:var(--navy)"><i class="fas fa-circle-info" style="color:var(--gold);margin-right:.5rem"></i>진료 전 알아두실 점</h3>
              <p style="margin:0;font-size:.86rem;color:var(--muted);line-height:1.7">${t.caution}</p>
            </div>` : ''}
          </div>`) : ''}

        ${encRefs.length ? raw(`
          <div class="tx-enc reveal" style="margin-top:2.4rem">
            <h3 style="font-size:1rem;margin:0 0 .9rem;color:var(--navy)"><i class="fas fa-book-open" style="color:var(--gold);margin-right:.5rem"></i>더 알아보기 — 치과 용어 사전</h3>
            <div class="tx-enc-chips">
              ${encRefs.map((e) => `<a href="/encyclopedia/${e.slug}" class="tx-enc-chip">${e.term} <i class="fas fa-arrow-right"></i></a>`).join('')}
            </div>
          </div>`) : ''}

        <p class="reveal" style="margin-top:2rem;font-size:.82rem;color:var(--muted);border-top:1px solid var(--line);padding-top:1rem">
          <i class="fas fa-user-md" style="color:var(--gold);margin-right:.4rem"></i>이 내용은 <a href="/doctors/kim-kyunghee" style="color:var(--navy);font-weight:600">${docs[0]?.name || '대표원장'} ${docs[0]?.role || '원장'}</a>의 감수를 거쳤습니다. 진단·치료 결과는 개인의 구강 상태에 따라 다를 수 있습니다.
        </p>
      </div>

      <!-- 사이드 (인링크 허브) -->
      <aside style="position:sticky;top:100px" class="reveal reveal-d1">
        <div class="card" style="padding:1.6rem">
          <h3 style="font-size:1rem;margin-top:0;color:var(--gold)">담당 의료진</h3>
          ${raw(docs.map((d) => `
            <a href="/doctors/${d!.slug}" style="display:flex;gap:.8rem;align-items:center;padding:.7rem 0;border-bottom:1px solid var(--line)">
              <span style="width:42px;height:42px;border-radius:50%;background:var(--paper-2);display:grid;place-items:center;flex-shrink:0"><i class="fas fa-user-md" style="color:var(--gold)"></i></span>
              <span><strong style="color:var(--navy);display:block;font-size:.95rem">${d!.name} ${d!.role}</strong><small style="color:var(--muted)">${d!.title}</small></span>
            </a>`).join(''))}
          ${raw(related.length ? `<h3 style="font-size:1rem;margin:1.4rem 0 .6rem;color:var(--gold)">관련 진료</h3>
            ${related.map((r) => `<a href="/treatments/${r.slug}" class="mega-item" style="color:var(--ink-soft)">→ ${r.name}</a>`).join('')}` : '')}
          <a href="/cases/gallery?treatment=${t.slug}" class="btn btn-outline" style="width:100%;justify-content:center;margin-top:1.4rem;font-size:.88rem">관련 비포/애프터 <i class="fas fa-images"></i></a>
          <a href="/reservation" class="btn btn-navy" style="width:100%;justify-content:center;margin-top:.6rem;font-size:.88rem">예약 상담 <i class="fas fa-arrow-right"></i></a>
        </div>
      </aside>
    </div>
  </section>

  ${mergedFaqs.length ? html`
  <section class="section bg-paper2" id="tx-faq">
    <div class="container container-narrow">
      <div class="sec-head center"><p class="eyebrow reveal">FAQ</p><h2 class="sec-title reveal reveal-d1">${t.name} 자주 묻는 질문</h2></div>
      ${FaqAccordion(mergedFaqs)}
      <p style="text-align:center;margin-top:2rem" class="reveal"><a href="/faq" class="btn btn-outline">전체 FAQ 보기 <i class="fas fa-arrow-right"></i></a></p>
    </div>
  </section>` : ''}

  <section class="section" style="background:linear-gradient(135deg,var(--navy),var(--navy-dark));color:#fff;text-align:center">
    <div class="container">
      <h2 class="sec-title reveal" style="color:#fff">${t.name}, <span class="gold">상담받아 보세요</span></h2>
      <p class="reveal reveal-d1" style="color:rgba(255,255,255,.8);margin:1.2rem 0 2rem">정밀 진단 후 내 치아에 맞는 치료계획을 안내드립니다.</p>
      <div class="reveal reveal-d2" style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap">
        <a href="/reservation" class="btn btn-gold">예약 상담 <i class="fas fa-arrow-right"></i></a>
        <a href="tel:${clinic.phoneRaw}" class="btn btn-ghost"><i class="fas fa-phone"></i> ${clinic.phone}</a>
      </div>
    </div>
  </section>

  <style>
    /* 그리드 트랙이 콘텐츠 최소폭에 밀려 넘치지 않도록 자식에 min-width:0 (CSS Grid 오버플로우 표준 해법) */
    .tx-grid > *{ min-width:0 }
    .prose{ max-width:100%;overflow-wrap:break-word;word-break:keep-all }
    /* 섹션 본문 케이스 사진 */
    .tx-sec-figure{ margin:1.6rem 0 0;border:1px solid var(--line);border-radius:14px;overflow:hidden;background:#fff;box-shadow:0 8px 26px rgba(20,30,55,.06) }
    .tx-sec-figure img{ display:block;width:100%;height:auto }
    .tx-sec-figure figcaption{ padding:.9rem 1.2rem;font-size:.86rem;color:var(--ink-soft);border-top:1px solid var(--line);line-height:1.6 }
    /* 실제 진료 케이스 갤러리 */
    .tx-case-grid{ display:grid;grid-template-columns:repeat(3,1fr);gap:1.2rem }
    .tx-case-card{ margin:0;border:1px solid var(--line);border-radius:14px;overflow:hidden;background:#fff;box-shadow:0 8px 26px rgba(20,30,55,.06) }
    .tx-case-card img{ display:block;width:100%;aspect-ratio:1/1;object-fit:cover;background:#000 }
    .tx-case-card figcaption{ padding:.85rem 1rem;font-size:.82rem;color:var(--ink-soft);border-top:1px solid var(--line);line-height:1.55 }
    @media (max-width:820px){ .tx-case-grid{ grid-template-columns:1fr } }
    .prose img,.prose video,.prose iframe{ max-width:100% }
    @media (max-width:900px){ .tx-grid{ grid-template-columns:1fr !important } aside{ position:static !important } }
    .tx-steps{ list-style:none;padding:0;margin:1.4rem 0 0 }
    .tx-steps li{ position:relative;display:flex;gap:1.1rem;padding:0 0 1.7rem;align-items:flex-start }
    .tx-steps li:not(:last-child)::before{ content:'';position:absolute;left:1.05rem;top:2.4rem;bottom:0;width:2px;background:var(--line) }
    .tx-step-num{ flex-shrink:0;width:2.2rem;height:2.2rem;border-radius:50%;background:var(--navy);color:#fff;display:grid;place-items:center;font-weight:700;font-size:.95rem;z-index:1 }
    .tx-steps li div{ padding-top:.15rem }
    .tx-steps li strong{ display:block;color:var(--navy);font-size:1.02rem;margin-bottom:.25rem }
    .tx-steps li div span{ font-size:.93rem;color:var(--ink-soft);line-height:1.6 }

    /* 목차 TOC */
    .tx-toc{ background:var(--paper-2);border:1px solid var(--line);border-radius:12px;padding:1.2rem 1.5rem;margin-bottom:2.2rem }
    .tx-toc-label{ display:block;font-size:.82rem;font-weight:700;color:var(--gold-2);letter-spacing:.02em;margin-bottom:.6rem }
    .tx-toc ul{ list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:.5rem .9rem }
    .tx-toc li a{ font-size:.88rem;color:var(--ink-soft);text-decoration:none;border-bottom:1px dashed var(--line);padding-bottom:1px;transition:color .15s }
    .tx-toc li a:hover{ color:var(--gold-2);border-bottom-color:var(--gold) }

    /* 비교표 */
    .tx-table-wrap{ overflow-x:auto;border:1px solid var(--line);border-radius:12px }
    .tx-table{ width:100%;border-collapse:collapse;background:#fff;font-size:.92rem;min-width:480px;table-layout:fixed }
    .tx-table th,.tx-table td{ padding:.85rem 1rem;text-align:left;border-bottom:1px solid var(--line-soft);vertical-align:top;word-break:keep-all;overflow-wrap:anywhere }
    .tx-table tbody th[scope=row]{ width:24% }
    .tx-table thead th{ background:var(--charcoal);color:#fff;font-weight:600;font-size:.88rem }
    .tx-table thead th.tx-th-first{ background:var(--navy) }
    .tx-table tbody th[scope=row]{ background:var(--paper-2);color:var(--navy);font-weight:600;white-space:nowrap }
    .tx-table tbody td{ color:var(--ink-soft) }
    .tx-table tbody tr:last-child th,.tx-table tbody tr:last-child td{ border-bottom:none }
    /* 비교표(인레이/온레이/오버레이 등 3열)는 우측 공백 없이 폭을 꽉 채우도록 균등 분배 */
    .tx-compare-table{ table-layout:fixed }
    .tx-compare-table th:first-child,.tx-compare-table td:first-child{ width:20% }
    .tx-compare-table th:nth-child(2),.tx-compare-table td:nth-child(2),
    .tx-compare-table th:nth-child(3),.tx-compare-table td:nth-child(3){ width:40% }
    .tx-compare-table tbody th[scope=row]{ width:20%;white-space:normal }

    /* 회복 타임라인 */
    .tx-after{ display:grid;gap:.9rem;margin-top:1.2rem }
    .tx-after-item{ border-left:3px solid var(--gold);background:var(--paper-2);border-radius:0 10px 10px 0;padding:1rem 1.3rem }
    .tx-after-phase{ display:block;font-weight:700;color:var(--navy);font-size:.95rem;margin-bottom:.3rem }
    .tx-after-phase i{ color:var(--gold);margin-right:.4rem;font-size:.85rem }
    .tx-after-item p{ margin:0;font-size:.9rem;color:var(--ink-soft);line-height:1.6 }

    /* 근거 카드 */
    .tx-evidence{ background:var(--paper-2);border:1px solid var(--line);border-radius:14px;padding:1.5rem 1.7rem }
    .tx-evidence-grid{ display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:1rem }
    .tx-evidence-card{ background:#fff;border:1px solid var(--line);border-radius:10px;padding:1rem 1.1rem;text-align:center }
    .tx-ev-label{ display:block;font-size:.78rem;color:var(--muted);margin-bottom:.35rem }
    .tx-ev-value{ display:block;font-size:1.05rem;color:var(--navy);font-family:var(--serif-kr) }
    .tx-ev-note{ display:block;font-size:.76rem;color:var(--muted);margin-top:.3rem }

    /* 백과 크로스링크 칩 */
    .tx-enc-chips{ display:flex;flex-wrap:wrap;gap:.6rem }
    .tx-enc-chip{ display:inline-flex;align-items:center;gap:.4rem;font-size:.85rem;color:var(--navy);background:#fff;border:1px solid var(--line);border-radius:999px;padding:.45rem 1rem;text-decoration:none;transition:all .15s }
    .tx-enc-chip i{ font-size:.72rem;color:var(--gold);transition:transform .15s }
    .tx-enc-chip:hover{ border-color:var(--gold);background:var(--paper-2) }
    .tx-enc-chip:hover i{ transform:translateX(3px) }
  </style>
  `

  const jsonLd: object[] = [
    breadcrumbSchema(crumb),
    procedureSchema(t),
    medicalWebPageSchema({
      title: `${t.name} | ${clinic.nameKo}`,
      description: t.hero.slice(0, 155),
      path: '/treatments/' + t.slug,
      reviewerName: docs[0]?.name || '김경희',
      reviewerSlug: docs[0]?.slug || 'kim-kyunghee',
    }),
    speakableSchema(['#tx-answer', '.answer']),
  ]
  if (t.process?.length) {
    jsonLd.push(howToSchema({
      name: `${t.name} 진료 과정`,
      description: `${clinic.nameKo}의 ${t.name} 진료 단계 안내`,
      steps: t.process,
    }))
  }
  // FAQPage — 병합 FAQ + 비교표를 Q&A로 직렬화(AEO 강화)
  if (mergedFaqs.length || t.compare) {
    const faqEntities: object[] = mergedFaqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    }))
    if (t.compare) faqEntities.push(compareQaSchema(t.compare))
    jsonLd.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqEntities })
  }
  // VideoObject — 진료 소개·후기 영상 (구글 동영상 리치결과/AEO 강화)
  if (t.videos?.length) {
    t.videos.forEach((v) => {
      jsonLd.push({
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: v.title,
        description: v.caption,
        thumbnailUrl: [`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`],
        uploadDate: '2024-01-01',
        contentUrl: `https://www.youtube.com/watch?v=${v.id}`,
        embedUrl: `https://www.youtube-nocookie.com/embed/${v.id}`,
        publisher: {
          '@type': 'Organization',
          name: clinic.nameKo,
        },
      })
    })
  }

  return Layout({
    title: t.metaTitle || `${t.name} | ${clinic.nameKo} · 부산 동래`,
    description: t.metaDescription || t.hero.slice(0, 155),
    path: '/treatments/' + t.slug,
    jsonLd,
  }, body)
}

export const treatmentSlugs = treatments.map((t) => t.slug)
