// ============================================================================
// 백과사전 자동 인링크 — 본문 HTML 속 용어를 /encyclopedia/<slug> 링크로 변환
//  · 리치(encyclopedia) + 경량(glossary) 용어를 모두 대상으로 함
//  · <a>·heading·태그 내부는 건드리지 않음 / 용어당 1회 / 페이지당 최대 N개
// ============================================================================
import { encyclopedia } from '../data/encyclopedia'
import { glossary } from '../data/glossary'

interface TermRef { term: string; slug: string }

// 짧은 일반 단어는 과링크 방지를 위해 제외
const EXCLUDE = new Set(['치아', '잇몸', '교합', '발치', '크라운', '마진', '치통'])

let _terms: TermRef[] | null = null
function termList(): TermRef[] {
  if (_terms) return _terms
  const list: TermRef[] = []
  for (const e of encyclopedia) list.push({ term: e.term, slug: e.slug })
  for (const e of glossary) {
    // '파노라마 방사선사진' 같은 풀네임과 괄호 앞 축약형 모두 등록
    const main = e.term.replace(/\s*\(.*\)$/, '').trim()
    if (main.length >= 3 && !EXCLUDE.has(main)) list.push({ term: main, slug: e.slug })
  }
  // 긴 용어 우선 매칭 (예: '신경치료'보다 '재신경치료' 먼저)
  list.sort((a, b) => b.term.length - a.term.length)
  _terms = list
  return list
}

/**
 * HTML 본문에 백과사전 인링크를 자동 삽입합니다.
 * @param htmlStr 원본 HTML
 * @param maxLinks 페이지당 최대 링크 수 (기본 10)
 * @param skipSlug 현재 페이지 자신을 가리키는 링크 방지
 */
export function autoLink(htmlStr: string, maxLinks = 10, skipSlug?: string): string {
  if (!htmlStr) return htmlStr
  const terms = termList()
  const used = new Set<string>()
  let linkCount = 0

  // 토큰화: 태그 / 텍스트로 분리. <a>...</a>, <h1~6>...</h*>, <script>, <style> 내부는 보호
  const tokens = htmlStr.split(/(<[^>]+>)/g)
  let protectDepth = 0
  const PROTECT_OPEN = /^<(a|h[1-6]|script|style|button|code)\b/i
  const PROTECT_CLOSE = /^<\/(a|h[1-6]|script|style|button|code)>/i

  const out = tokens.map((tok) => {
    if (tok.startsWith('<')) {
      if (PROTECT_OPEN.test(tok)) protectDepth++
      else if (PROTECT_CLOSE.test(tok)) protectDepth = Math.max(0, protectDepth - 1)
      return tok
    }
    if (protectDepth > 0 || linkCount >= maxLinks || !tok.trim()) return tok

    // 세그먼트 방식: 이미 링크된 부분은 재매칭 대상에서 제외
    let segments: { text: string; linked: boolean }[] = [{ text: tok, linked: false }]
    for (const t of terms) {
      if (linkCount >= maxLinks) break
      if (used.has(t.slug) || t.slug === skipSlug) continue
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i]
        if (seg.linked) continue
        const idx = seg.text.indexOf(t.term)
        if (idx === -1) continue
        used.add(t.slug)
        linkCount++
        const before = seg.text.slice(0, idx)
        const after = seg.text.slice(idx + t.term.length)
        const link = `<a href="/encyclopedia/${t.slug}" class="inlink" title="${t.term} — 치과 백과사전">${t.term}</a>`
        segments.splice(i, 1,
          { text: before, linked: false },
          { text: link, linked: true },
          { text: after, linked: false })
        break
      }
    }
    return segments.map((s) => s.text).join('')
  })
  return out.join('')
}
