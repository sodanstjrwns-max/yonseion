// ============================================================================
// 유튜브 RSS 자동 반영 (하이브리드)
// - 채널 RSS 피드에서 최신 영상을 가져와 쇼츠(해시태그 다수)를 필터링합니다.
// - Cloudflare 엣지 fetch 캐시(cacheTtl)를 사용해 KV 없이도 1시간 캐시됩니다.
// - RSS 실패 시(네트워크 등)에도 고정 영상(videosPinned)으로 안전하게 폴백합니다.
// ============================================================================

export interface VideoItem {
  id: string
  title: string
}

// 제목에 해시태그가 이 개수 이상이면 쇼츠/짧은 홍보 영상으로 간주하고 제외
const HASHTAG_SHORT_THRESHOLD = 3

// RSS <entry>에서 videoId·title 추출 (정규식 파싱 — Workers 환경엔 DOMParser가 없음)
function parseFeed(xml: string): VideoItem[] {
  const items: VideoItem[] = []
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? []
  for (const e of entries) {
    const idM = e.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)
    const titleM = e.match(/<title>([^<]*)<\/title>/)
    if (!idM) continue
    const id = idM[1].trim()
    const title = decodeXml((titleM?.[1] ?? '').trim())
    items.push({ id, title })
  }
  return items
}

function decodeXml(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
}

// 쇼츠 판별: 해시태그가 많은 제목은 짧은 홍보 영상일 가능성이 높음
function isShort(title: string): boolean {
  const hashtags = (title.match(/#/g) ?? []).length
  return hashtags >= HASHTAG_SHORT_THRESHOLD
}

/**
 * 고정 영상 + RSS 자동 영상을 병합해 반환합니다.
 * @param channelId  유튜브 채널 ID (UC...)
 * @param pinned     항상 상단 고정할 엄선 영상
 * @param max        최대 표시 개수
 */
export async function getMergedVideos(
  channelId: string,
  pinned: VideoItem[],
  max = 9,
): Promise<VideoItem[]> {
  const seen = new Set<string>()
  const result: VideoItem[] = []

  // 1) 고정 영상 먼저
  for (const v of pinned) {
    if (v.id && !seen.has(v.id)) {
      seen.add(v.id)
      result.push(v)
    }
  }

  // 2) RSS 자동 영상 (쇼츠 제외, 중복 제외)
  try {
    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
    const res = await fetch(feedUrl, {
      // Cloudflare 엣지 캐시: 1시간. KV 없이도 매 요청 유튜브 호출을 막습니다.
      cf: { cacheTtl: 3600, cacheEverything: true },
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; YeonseonBot/1.0)' },
    } as RequestInit)
    if (res.ok) {
      const xml = await res.text()
      const feed = parseFeed(xml)
      for (const v of feed) {
        if (result.length >= max) break
        if (seen.has(v.id)) continue
        if (isShort(v.title)) continue
        seen.add(v.id)
        result.push(v)
      }
    }
  } catch {
    // RSS 실패 시 고정 영상만으로 폴백 (아무것도 안 함)
  }

  return result.slice(0, max)
}
