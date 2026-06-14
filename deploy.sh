#!/bin/bash
# ============================================================
# 연세온치과 — 원클릭 배포 스크립트
# 사용법: bash deploy.sh ["커밋 메시지"]
# 빌드 → Cloudflare Pages 배포 → GitHub push 를 한 번에
# ============================================================
set -e
cd "$(dirname "$0")"

MSG="${1:-update: 사이트 업데이트}"

echo "🔨 [1/4] 빌드 중..."
npm run build

echo "🚀 [2/4] Cloudflare Pages 배포 중..."
npx wrangler pages deploy dist --project-name yeonseon-dental --branch main --commit-dirty=true

echo "💾 [3/4] git 커밋..."
git add -A
git commit -m "$MSG" || echo "  (변경사항 없음 — 커밋 건너뜀)"

echo "📤 [4/4] GitHub push..."
git push origin main || echo "  (push 실패 — 수동 확인 필요)"

echo ""
echo "✅ 완료! → https://yeonseon-dental.pages.dev"
