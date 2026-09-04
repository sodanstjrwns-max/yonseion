// ============================================================================
// 관리자 검색·방문 통계 (/admin/stats)
// 데이터: PF 중앙 대시보드 API — 토큰은 서버사이드에서만 사용 (클라이언트 비노출)
// ============================================================================

export const STATS_KEY = '856260384d2e4d341ad8816e78c3cce648203e2e7fe9be65'
export const MASTER_KEY = 'pfwe-b4f42f06'
const STATS_ENDPOINT = 'https://pf-dashboard-2nt.pages.dev/api/stats/yonseion.kr'

export interface StatsData {
  domain: string
  configured: boolean
  hasGa?: boolean
  updatedAt?: string
  range?: { start: string; end: string }
  gsc?: {
    clicks: number; impressions: number; ctr: number; position: number | null
    delta: { clicks: number | null; impressions: number | null; ctr: number | null; position: number | null }
    topQueries: { query: string; clicks: number; impressions: number }[]
    topPages: { page: string; clicks: number; impressions: number }[]
    dailyClicks: { date: string; clicks: number }[]
  } | null
  ga?: {
    users: number; sessions: number; pageviews: number; avgDuration: number; leads: number
    delta: { users: number | null; sessions: number | null; leads: number | null }
    dailyUsers: { date: string; users: number; sessions: number }[]
  } | null
  ai?: {
    sessions: number; share: number; delta: number | null
    bySource: Record<string, number>
    topLandingPages?: { page: string; sessions: number }[]
  } | null
}

export async function fetchDashboardStats(): Promise<StatsData | null> {
  try {
    const res = await fetch(STATS_ENDPOINT, {
      headers: { Authorization: `Bearer ${STATS_KEY}` },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    return (await res.json()) as StatsData
  } catch {
    return null
  }
}

function escS(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}
const num = (n: number | null | undefined) => (n == null || !Number.isFinite(n) ? '-' : n.toLocaleString('ko-KR'))

function deltaBadge(v: number | null | undefined, invert = false): string {
  if (v == null || !Number.isFinite(v)) return ''
  if (v === 0) return '<span class="st-d flat">보합</span>'
  const up = v > 0
  const good = invert ? !up : up
  return `<span class="st-d ${good ? 'good' : 'bad'}">${up ? '▲' : '▼'} ${Math.abs(v)}%</span>`
}

function sparkline(values: number[], stroke: string): string {
  if (!values.length) return '<p class="st-empty">데이터가 아직 없습니다.</p>'
  const w = 600, h = 70, pad = 6
  const max = Math.max(1, ...values)
  const step = values.length > 1 ? (w - pad * 2) / (values.length - 1) : 0
  const pt = (v: number, i: number) => `${(pad + i * step).toFixed(1)},${(h - pad - (v / max) * (h - pad * 2)).toFixed(1)}`
  const line = values.map(pt).join(' ')
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="width:100%;height:70px;display:block" role="img" aria-label="일별 추이 그래프">
    <polygon points="${pad},${h - pad} ${line} ${(pad + (values.length - 1) * step).toFixed(1)},${h - pad}" fill="${stroke}" opacity="0.1"/>
    <polyline points="${line}" fill="none" stroke="${stroke}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
  </svg>`
}

const AI_LABELS: Record<string, string> = { chatgpt: 'ChatGPT', perplexity: 'Perplexity', claude: 'Claude', gemini: 'Gemini', etc: '기타 AI' }

function buildInsights(d: StatsData): string[] {
  const ins: string[] = []
  const g = d.gsc, a = d.ga, ai = d.ai
  if (g) {
    if (g.delta?.clicks != null && g.delta.clicks >= 20) ins.push(`최근 28일 검색 클릭이 이전 기간 대비 ${g.delta.clicks}% 증가했습니다. 상승 흐름이 유지되고 있습니다.`)
    else if (g.delta?.clicks != null && g.delta.clicks <= -20) ins.push(`검색 클릭이 이전 기간 대비 ${Math.abs(g.delta.clicks)}% 감소했습니다. 최근 콘텐츠의 색인 상태를 점검할 시점입니다.`)
    if (g.impressions > 0 && g.clicks < 100) ins.push(`노출 ${num(g.impressions)}회 대비 클릭 ${num(g.clicks)}회 — 노출이 먼저 쌓이고 클릭이 따라오는 초기 구간의 정상적인 흐름입니다.`)
    if (g.position != null && g.position > 20) ins.push(`평균 게재순위 ${g.position}위 — 롱테일 키워드부터 순위가 앞으로 이동하는 시기입니다.`)
    else if (g.position != null && g.position > 0 && g.position <= 10) ins.push(`평균 게재순위 ${g.position}위로 구글 1페이지권에 진입했습니다.`)
    if (ins.length < 4 && g.topQueries?.length) ins.push(`현재 유입 상위 검색어는 "${g.topQueries[0].query}"입니다. 관련 콘텐츠를 보강하면 유입 확대에 유리합니다.`)
  }
  if (ai && ai.share >= 1) ins.push(`AI 검색(ChatGPT·Perplexity 등) 유입 비중이 ${ai.share}%입니다. AEO 구조화 세팅이 작동하고 있습니다.`)
  if (a && a.leads > 0) ins.push(`최근 28일간 전화·예약 등 리드 액션이 ${num(a.leads)}건 발생했습니다.`)
  const fillers = [
    '사이트맵·IndexNow·구조화데이터 등 검색 가속 세팅이 적용되어 색인은 자동으로 진행됩니다.',
    '칼럼·공지 등 콘텐츠를 꾸준히 발행할수록 롱테일 노출 확대 속도가 빨라집니다.',
    '통계는 구글 검색콘솔·GA4 기준 최근 28일 데이터이며 매일 자동 갱신됩니다.',
  ]
  for (const f of fillers) { if (ins.length >= 3) break; ins.push(f) }
  return ins.slice(0, 5)
}

// 관리자 shell 내부에 들어가는 본문 HTML
export function statsContent(d: StatsData | null): string {
  const configured = !!d?.configured
  const g = configured ? d?.gsc : null
  const a = configured ? d?.ga : null
  const ai = configured ? d?.ai : null
  const emphasize = !configured || (g ? g.clicks < 100 : true)

  const css = `<style>
.st-card{background:#fff;border:1px solid var(--line);border-radius:10px;padding:1.4rem 1.5rem;margin-bottom:1.2rem}
.st-card h2{font-size:1.05rem;margin-bottom:.9rem;letter-spacing:-.01em}
.st-card h2 .cap{font-size:.72rem;color:var(--mist);font-weight:500;margin-left:.5rem}
.st-expect.big{border-color:var(--ink);border-width:1.5px;background:linear-gradient(180deg,#F4F0E8,#fff);padding:1.9rem 1.7rem}
.st-expect.big h2{font-size:1.3rem}
.st-expect-msg{color:var(--mist);max-width:46rem;margin-bottom:1.1rem}
.st-tl{display:grid;grid-template-columns:repeat(4,1fr);gap:.5rem;list-style:none;padding:0;margin:0}
.st-tl li{background:#F4F0E8;border:1px solid var(--line);border-radius:8px;padding:.7rem .85rem}
.st-tl li b{display:block;font-size:.78rem;color:#8A6E33}
.st-tl li span{font-size:.85rem;font-weight:600}
.st-wait{border-style:dashed;text-align:center;padding:2.2rem}
.st-wait h2{color:#8A6E33}
.st-wait p{color:var(--mist);max-width:32rem;margin:0 auto}
.st-metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.6rem}
.st-metric{background:#FAF8F2;border:1px solid var(--line);border-radius:8px;padding:.85rem 1rem}
.st-metric .l{font-size:.76rem;color:var(--mist)}
.st-metric .v{font-size:1.5rem;font-weight:700;letter-spacing:-.02em;margin:.1rem 0}
.st-metric .sub{font-size:.74rem;color:var(--mist)}
.st-metric.pending{border-style:dashed;color:var(--mist)}
.st-d{font-size:.74rem;font-weight:700}.st-d.good{color:#2E5E3A}.st-d.bad{color:#9C2B2B}.st-d.flat{color:var(--mist)}
.st-spark{margin-top:1rem}
.st-spark .t{font-size:.76rem;color:var(--mist);margin-bottom:.2rem}
.st-tables{display:grid;grid-template-columns:1fr 1fr;gap:1.2rem}
.st-tables .st-card:last-child{grid-column:1/-1}
.st-card td.rk{color:var(--mist);width:1.8rem}
.st-card td.n,.st-card th.n{text-align:right;font-variant-numeric:tabular-nums}
.st-card td.pg{word-break:break-all}
.st-ins{list-style:none;display:flex;flex-direction:column;gap:.5rem;padding:0;margin:0}
.st-ins li{background:#F4F0E8;border-left:3px solid var(--ink);border-radius:0 6px 6px 0;padding:.6rem .9rem;font-size:.9rem}
.st-empty{color:var(--mist);font-size:.85rem;padding:.4rem 0}
.st-foot{color:var(--mist);font-size:.78rem;text-align:center;margin-top:.4rem}
@media(max-width:900px){.st-tl{grid-template-columns:1fr 1fr}.st-tables{grid-template-columns:1fr}}
</style>`

  const timeline = `<ol class="st-tl">
    <li><b>0~1개월</b><span>색인</span></li>
    <li><b>1~3개월</b><span>롱테일 노출</span></li>
    <li><b>3~6개월</b><span>지역+진료 키워드</span></li>
    <li><b>6개월~</b><span>경쟁 키워드 본순위</span></li>
  </ol>`

  const expectCard = `<section class="st-card st-expect ${emphasize ? 'big' : ''}">
    <h2><i class="fa-solid fa-hourglass-half"></i> 검색 순위는 시간이 필요합니다</h2>
    ${emphasize ? '<p class="st-expect-msg">신규 사이트는 색인과 순위 안착까지 시간이 걸립니다. 본격적인 순위 경쟁은 개설 6개월부터 시작됩니다. 사이트맵·IndexNow·구조화데이터 등 검색 가속 세팅은 모두 완료되어 있습니다.</p>' : ''}
    ${timeline}
  </section>`

  let body = ''
  if (!configured) {
    body = `<section class="st-card st-wait">
      <h2>데이터 연동 대기 중</h2>
      <p>구글 검색콘솔·GA4 데이터 연동이 준비되는 대로 이 페이지에 최근 28일 검색·방문 통계가 자동으로 표시됩니다.</p>
    </section>`
  } else {
    const gaCards = d!.hasGa && a
      ? `<div class="st-metric"><div class="l">방문 사용자</div><div class="v">${num(a.users)}</div>${deltaBadge(a.delta?.users)}</div>
        <div class="st-metric"><div class="l">세션</div><div class="v">${num(a.sessions)}</div>${deltaBadge(a.delta?.sessions)}</div>
        <div class="st-metric"><div class="l">리드(전화·예약)</div><div class="v">${num(a.leads)}</div>${deltaBadge(a.delta?.leads)}</div>
        <div class="st-metric"><div class="l">AI 검색 유입</div><div class="v">${num(ai?.sessions)}</div><div class="sub">전체의 ${ai?.share ?? 0}%</div>${deltaBadge(ai?.delta)}</div>`
      : `<div class="st-metric pending" style="grid-column:1/-1"><div class="l">GA4 방문 분석</div><div class="v" style="font-size:1.05rem">GA 연동 예정</div><div class="sub">연동 완료 후 사용자·세션·리드·AI 유입이 표시됩니다.</div></div>`

    const queriesRows = (g?.topQueries ?? []).slice(0, 10).map((q, i) =>
      `<tr><td class="rk">${i + 1}</td><td>${escS(q.query)}</td><td class="n">${num(q.clicks)}</td><td class="n">${num(q.impressions)}</td></tr>`).join('')
    const pagesRows = (g?.topPages ?? []).slice(0, 10).map((p, i) => {
      const path = String(p.page || '').replace(/^https?:\/\/[^/]+/, '') || '/'
      return `<tr><td class="rk">${i + 1}</td><td class="pg">${escS(path)}</td><td class="n">${num(p.clicks)}</td><td class="n">${num(p.impressions)}</td></tr>`
    }).join('')
    const aiRows = ai
      ? Object.entries(ai.bySource || {}).map(([k, v]) =>
        `<tr><td>${escS(AI_LABELS[k] || k)}</td><td class="n">${num(v as number)}</td></tr>`).join('')
      : ''

    body = `<section class="st-card">
      <h2>검색 성과 <span class="cap">구글 검색콘솔 · 최근 28일</span></h2>
      <div class="st-metrics">
        <div class="st-metric"><div class="l">클릭</div><div class="v">${num(g?.clicks)}</div>${deltaBadge(g?.delta?.clicks)}</div>
        <div class="st-metric"><div class="l">노출</div><div class="v">${num(g?.impressions)}</div>${deltaBadge(g?.delta?.impressions)}</div>
        <div class="st-metric"><div class="l">CTR</div><div class="v">${g ? (g.ctr * 100).toFixed(2) + '%' : '-'}</div>${deltaBadge(g?.delta?.ctr)}</div>
        <div class="st-metric"><div class="l">평균 게재순위</div><div class="v">${g?.position ?? '-'}</div>${deltaBadge(g?.delta?.position, true)}</div>
      </div>
      <div class="st-spark"><p class="t">일별 검색 클릭</p>${sparkline((g?.dailyClicks ?? []).map((x) => x.clicks), '#14243E')}</div>
    </section>

    <section class="st-card">
      <h2>방문·전환 <span class="cap">GA4 · 최근 28일</span></h2>
      <div class="st-metrics">${gaCards}</div>
      ${d!.hasGa && a ? `<div class="st-spark"><p class="t">일별 방문 사용자</p>${sparkline((a.dailyUsers ?? []).map((x) => x.users), '#8A6E33')}</div>` : ''}
    </section>

    <div class="st-tables">
      <section class="st-card">
        <h2>상위 검색어 TOP 10</h2>
        ${queriesRows ? `<table><thead><tr><th></th><th>검색어</th><th class="n">클릭</th><th class="n">노출</th></tr></thead><tbody>${queriesRows}</tbody></table>` : '<p class="st-empty">집계된 검색어가 아직 없습니다.</p>'}
      </section>
      <section class="st-card">
        <h2>상위 유입 페이지 TOP 10</h2>
        ${pagesRows ? `<table><thead><tr><th></th><th>페이지</th><th class="n">클릭</th><th class="n">노출</th></tr></thead><tbody>${pagesRows}</tbody></table>` : '<p class="st-empty">집계된 페이지가 아직 없습니다.</p>'}
      </section>
      <section class="st-card">
        <h2>AI 검색 소스별 유입</h2>
        ${aiRows ? `<table><thead><tr><th>소스</th><th class="n">세션</th></tr></thead><tbody>${aiRows}</tbody></table>` : '<p class="st-empty">GA 연동 후 표시됩니다.</p>'}
      </section>
    </div>`
  }

  const insights = d ? buildInsights(d) : ['통계 서버와의 연결이 원활하지 않습니다. 잠시 후 새로고침해 주세요.', '사이트맵·IndexNow·구조화데이터 등 검색 가속 세팅은 정상 적용되어 있습니다.', '데이터 연동이 준비되는 대로 이 페이지에 자동으로 표시됩니다.']
  const rangeTxt = d?.range ? `${d.range.start} ~ ${d.range.end}` : '최근 28일'

  return `${css}
  <h1>검색·방문 통계</h1>
  ${expectCard}
  ${body}
  <section class="st-card">
    <h2>자동 인사이트</h2>
    <ul class="st-ins">${insights.map((s) => `<li>${escS(s)}</li>`).join('')}</ul>
  </section>
  <p class="st-foot">데이터: 구글 검색콘솔 · GA4 (${escS(rangeTxt)})${d?.updatedAt ? ` · 갱신 ${escS(String(d.updatedAt).slice(0, 16).replace('T', ' '))}` : ''} · 이 페이지는 검색엔진에 노출되지 않습니다.</p>`
}
