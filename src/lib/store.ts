// ============================================================================
// R2 기반 JSON 데이터 저장소 — 회원/케이스/예약/칼럼/공지를 R2에 JSON으로 저장
// 키 구조:
//   cases/<id>.json,  cases/_index.json
//   columns/<id>.json, columns/_index.json
//   notices/<id>.json, notices/_index.json
//   users/<email>.json
//   reservations/<id>.json
//   images/<key>          (바이너리)
// ============================================================================

export class Store {
  constructor(private r2: R2Bucket) {}

  async getJSON<T>(key: string): Promise<T | null> {
    const obj = await this.r2.get(key)
    if (!obj) return null
    try { return JSON.parse(await obj.text()) as T } catch { return null }
  }

  async putJSON(key: string, value: unknown): Promise<void> {
    await this.r2.put(key, JSON.stringify(value), {
      httpMetadata: { contentType: 'application/json; charset=utf-8' },
    })
  }

  async delete(key: string): Promise<void> {
    await this.r2.delete(key)
  }

  // --- 인덱스 헬퍼 (목록 빠르게 조회) ---
  async index<T>(prefix: string): Promise<T[]> {
    const idx = await this.getJSON<T[]>(`${prefix}/_index.json`)
    return idx || []
  }
  async setIndex<T>(prefix: string, items: T[]): Promise<void> {
    await this.putJSON(`${prefix}/_index.json`, items)
  }

  // --- 이미지 ---
  async putImage(key: string, body: ArrayBuffer | ReadableStream, contentType: string): Promise<void> {
    await this.r2.put(key, body, { httpMetadata: { contentType } })
  }
  async getImage(key: string): Promise<R2ObjectBody | null> {
    return await this.r2.get(key)
  }
}

export function newId(prefix = ''): string {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function slugify(s: string): string {
  return s.toLowerCase().trim()
    .replace(/[^\w가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80) || newId()
}
