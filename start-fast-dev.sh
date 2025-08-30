#!/bin/bash

# RSVShop 빠른 개발 서버 시작 스크립트
# 페이지 로드 속도 최적화

echo "🚀 RSVShop 빠른 개발 서버 시작 중..."

# 기존 프로세스 정리
echo "🧹 기존 프로세스 정리 중..."
pkill -f "next-server" 2>/dev/null
pkill -f "nodemon" 2>/dev/null

# 캐시 정리 (선택사항)
if [ "$1" = "--clean" ]; then
    echo "🗑️  캐시 정리 중..."
    rm -rf .next/cache 2>/dev/null
    rm -rf node_modules/.cache 2>/dev/null
fi

# 환경 변수 설정
export NODE_ENV=development
export NODE_OPTIONS="--max-old-space-size=1024 --max-semi-space-size=128"
export NEXT_TELEMETRY_DISABLED=1
export NEXT_DEV_FAST_REFRESH=true
export NEXT_DEV_SOURCEMAP=false

# 포트 확인
PORT=4900
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  포트 $PORT이 이미 사용 중입니다. 다른 포트를 사용합니다."
    PORT=4901
fi

echo "🔧 최적화된 설정으로 서버 시작 중..."
echo "📊 메모리 제한: 1024MB"
echo "🌐 포트: $PORT"
echo "⚡ 빠른 새로고침: 활성화"
echo "🗺️  소스맵: 비활성화"

# 빠른 개발 서버 시작
npx next dev --port $PORT --turbo=false --experimental-https=false

echo "✅ 빠른 개발 서버가 시작되었습니다!"
echo "🌐 http://localhost:$PORT"
echo "📝 로그를 확인하려면: tail -f dev-server.log"
