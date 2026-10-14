// ============================================================================
// 칼럼 대표 이미지 경량본 (2026-10-14) — R2 원본(/api/images/…)이 300KB~7.4MB 라 og·본문 첫 사진이 무거웠다.
// 같은 사진을 긴 변 1200px 이하 JPG(≤300KB)로 줄여 public/static/img/og/ 에 두고, og:image·Article.image·본문 첫 사진에 쓴다.
// 목록에 없는 썸네일(새로 올린 칼럼)은 원본 그대로 + og:image:width/height 생략(실제 크기를 모름).
// ============================================================================
export interface LiteImage { src: string; w: number; h: number }

const COLUMN_THUMB_LITE: Record<string, LiteImage> = {
  '/api/images/mrflr5ubcw8m.jpg': { src: '/static/img/og/col-mrflr5ubcw8m.jpg', w: 1200, h: 808 }, // 7.4MB → 79KB
  '/api/images/mrlhwj0efq43.png': { src: '/static/img/og/col-mrlhwj0efq43.jpg', w: 823, h: 1200 }, // 2.3MB PNG → 131KB
  '/api/images/mrsmovjpa803.jpg': { src: '/static/img/og/col-mszt295qlsoe.jpg', w: 900, h: 1200 }, // 2.4MB → 182KB (mszt295qlsoe 와 같은 사진)
  '/api/images/mszt295qlsoe.jpg': { src: '/static/img/og/col-mszt295qlsoe.jpg', w: 900, h: 1200 }, // 2.4MB → 182KB
  '/api/images/mukoskuz80om.png': { src: '/static/img/og/col-mukoskuz80om.jpg', w: 1080, h: 1080 }, // 1.6MB PNG → 136KB
  '/api/images/mruek09j6rlb.jpg': { src: '/static/img/og/col-mruek09j6rlb.jpg', w: 800, h: 800 }, // 410KB → 89KB
  '/api/images/mse6vhs0e85w.jpg': { src: '/static/img/og/col-mse6vhs0e85w.jpg', w: 800, h: 800 }, // 406KB → 89KB
  '/api/images/msnzan2p5yp3.jpg': { src: '/static/img/og/col-msnzan2p5yp3.jpg', w: 800, h: 800 }, // 334KB → 64KB
  '/api/images/mtl4pdlqwccf.jpg': { src: '/static/img/og/col-mtl4pdlqwccf.jpg', w: 800, h: 800 }, // 325KB → 65KB
}

/** 칼럼 썸네일 경로 → 경량본(있으면) */
export function columnThumbLite(thumb?: string): LiteImage | undefined {
  return thumb ? COLUMN_THUMB_LITE[thumb.split('?')[0]] : undefined
}
