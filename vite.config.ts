import build from '@hono/vite-build/cloudflare-pages'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import { defineConfig } from 'vite'
// @ts-ignore 설정 파일만 Node 에서 실행된다
import { createHash } from 'node:crypto'
// @ts-ignore 위와 같음
import { readFileSync } from 'node:fs'

// 메인 몰입 연출 파일은 내용 해시로 ?v= 를 붙인다(/static/* 1년 immutable 캐시 — 고정 번호면 옛 파일이 남는다)
const hash = (f: string) => createHash('sha256').update(readFileSync(f)).digest('hex').slice(0, 10)

export default defineConfig({
  define: {
    __IMMERSIVE_JS_V__: JSON.stringify(hash('public/static/js/immersive.js')),
    __IMMERSIVE_CSS_V__: JSON.stringify(hash('public/static/css/immersive.css')),
  },
  plugins: [
    build(),
    devServer({
      adapter,
      entry: 'src/index.tsx'
    })
  ]
})
