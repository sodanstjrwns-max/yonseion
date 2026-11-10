// ============================================================================
// 구글 전용 검색 제외 (2026-11-10)
//
// 배경: 구글이 이 사이트를 사이트 단위로 판정해 홈 한 장만 색인하고 있다(백과·지역 조합을 대량
//       공개한 뒤 전체 탈락). 반면 방문 대부분은 네이버에서 백과·용어 페이지로 들어온다.
// 조치: 대량 생성 구역(백과사전 전체, 지역×진료 조합)을 "구글 크롤러에게만" 검색 제외한다.
//       구글이 보는 사이트를 병원 핵심 페이지 수십 쪽으로 줄여 재평가를 받기 위함이다.
//
// 동작: 요청 User-Agent 가 구글 크롤러(Googlebot · Google-InspectionTool)이고, 경로가 아래
//       isGoogleHiddenPath() 대상이며, 응답이 200 HTML 일 때만
//       `X-Robots-Tag: googlebot: noindex` 헤더를 붙인다(이미 있던 X-Robots-Tag 값은 교체).
//       - 네이버(Yeti)·Bing·일반 방문자·AI 봇 응답은 헤더·본문이 한 글자도 바뀌지 않는다.
//       - HTML meta, robots.txt, sitemap, canonical 은 건드리지 않는다.
//       - 301·404 응답에는 붙이지 않는다.
//       - 이 사이트는 응답을 caches.default·KV 에 저장하지 않는다. 나중에 HTML 캐시를 넣게 되면
//         이 헤더가 저장본에 들어가지 않게, 캐시에서 꺼낸 뒤 요청마다 붙여야 한다.
//
// 되돌리는 방법: isGoogleHiddenPath() 가 항상 false 를 돌려주게 하면 끝(첫 줄에 `return false`).
// ============================================================================
import type { MiddlewareHandler } from 'hono'

export const GOOGLE_HIDE_HEADER = 'googlebot: noindex'

/** 구글 검색 크롤러 판정 — Google-Extended·GoogleOther·AdsBot·Mediapartners 는 대상이 아니다. */
export function isGoogleCrawler(ua: string | null | undefined): boolean {
  return /googlebot|google-inspectiontool/i.test(ua || '')
}

/**
 * 구글에 남기는 지역 페이지 — 병원 소재지(온천장) 허브와 온천장 전용으로 따로 쓴 본문 2쪽.
 * (19지역 × 4진료 템플릿 조합 /area/{지역}-{진료} 76쪽은 가린다)
 */
const AREA_KEEP = new Set(['oncheonjang', 'oncheonjang-root-canal', 'oncheonjang-tmj-occlusion'])

/**
 * 구글에만 검색 제외할 경로인가. (대상 경로 판정은 이 함수 하나에 모은다)
 *  가린다: /encyclopedia, /encyclopedia/* (백과사전 목록·용어 전체)
 *          /area (지역 조합 목록), /area/* 중 AREA_KEEP 밖 전부(지역×진료 조합)
 *  남긴다: 그 밖의 모든 경로 — 홈, 진료, 의료진, 비용, 미션, 오시는 길, 예약, FAQ, 공지,
 *          케이스, 칼럼(R2 발행분), 영상, /area/oncheonjang 허브와 온천장 전용 2쪽
 */
export function isGoogleHiddenPath(pathname: string): boolean {
  let p = pathname
  try { p = decodeURIComponent(pathname) } catch { /* 잘못된 인코딩은 원문 그대로 판정 */ }
  p = p.replace(/\/+$/, '') // 끝 슬래시 무시
  if (p === '/encyclopedia' || p.startsWith('/encyclopedia/')) return true
  if (p === '/area') return true
  if (p.startsWith('/area/')) return !AREA_KEEP.has(p.slice('/area/'.length))
  return false
}

/** 앱 맨 바깥 미들웨어 — index.tsx 에서 가장 먼저 등록한다. */
export const googleHide: MiddlewareHandler = async (c, next) => {
  await next()
  if (!isGoogleCrawler(c.req.header('User-Agent'))) return
  if (c.res.status !== 200) return
  if (!(c.res.headers.get('Content-Type') || '').toLowerCase().includes('text/html')) return
  if (!isGoogleHiddenPath(new URL(c.req.url).pathname)) return
  c.header('X-Robots-Tag', GOOGLE_HIDE_HEADER) // set — 기존 값(얇은 용어의 'noindex, follow')이 있으면 교체
}
