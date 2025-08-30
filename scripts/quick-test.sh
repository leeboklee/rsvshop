#!/bin/bash

# RSVShop 빠른 테스트 스크립트
# 사용법: ./scripts/quick-test.sh

echo "🚀 RSVShop 빠른 테스트 시작..."
echo "=================================="

# 서버 상태 확인
echo "📡 서버 상태 확인 중..."
if curl -s http://localhost:4900 > /dev/null 2>&1; then
    echo "✅ 서버가 정상적으로 실행 중입니다 (포트 4900)"
else
    echo "❌ 서버에 연결할 수 없습니다"
    exit 1
fi

# API 테스트
echo ""
echo "🔍 API 테스트 중..."

# 호텔 API 테스트
echo "  - 호텔 API 테스트..."
HOTEL_RESPONSE=$(curl -s http://localhost:4900/api/admin/hotels)
if echo "$HOTEL_RESPONSE" | grep -q "hotels"; then
    echo "    ✅ 호텔 API 정상 작동"
    HOTEL_COUNT=$(echo "$HOTEL_RESPONSE" | grep -o '"id":"[^"]*"' | wc -l)
    echo "    📊 호텔 수: $HOTEL_COUNT개"
else
    echo "    ❌ 호텔 API 오류"
fi

# 데이터베이스 연결 테스트
echo ""
echo "🗄️  데이터베이스 연결 테스트..."
if npx prisma db pull > /dev/null 2>&1; then
    echo "✅ 데이터베이스 연결 성공"
else
    echo "❌ 데이터베이스 연결 실패"
fi

# Prisma 클라이언트 상태 확인
echo ""
echo "🔧 Prisma 클라이언트 상태 확인..."
if npx prisma generate > /dev/null 2>&1; then
    echo "✅ Prisma 클라이언트 생성 성공"
else
    echo "❌ Prisma 클라이언트 생성 실패"
fi

echo ""
echo "🎯 테스트 완료!"
echo "=================================="
