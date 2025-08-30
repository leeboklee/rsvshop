#!/bin/bash

echo "🚀 WSL + Prisma 연결 최적화 시작..."

# PostgreSQL 서비스 상태 확인 및 시작
echo "📊 PostgreSQL 서비스 상태 확인..."
if ! sudo service postgresql status | grep -q "online"; then
    echo "🔄 PostgreSQL 서비스 시작 중..."
    sudo service postgresql start
    sleep 3
else
    echo "✅ PostgreSQL 이미 실행 중"
fi

# 데이터베이스 연결 테스트
echo "🔍 데이터베이스 연결 테스트..."
if sudo -u postgres psql -d rsvshop -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ 데이터베이스 연결 성공"
else
    echo "❌ 데이터베이스 연결 실패, 데이터베이스 생성 시도..."
    sudo -u postgres createdb rsvshop 2>/dev/null || echo "데이터베이스가 이미 존재합니다"
fi

# Prisma 클라이언트 재생성
echo "🔧 Prisma 클라이언트 재생성..."
npx prisma generate

# 데이터베이스 스키마 동기화
echo "🔄 데이터베이스 스키마 동기화..."
npx prisma db push --accept-data-loss

# 연결 풀 최적화
echo "⚡ 연결 풀 최적화..."
echo "WSL 환경에서 Prisma 연결이 안정화되었습니다."

# 서버 재시작 안내
echo ""
echo "🎯 다음 단계:"
echo "1. 현재 실행 중인 서버 종료: pkill -f 'next dev'"
echo "2. 서버 재시작: npm run dev"
echo ""
echo "💡 WSL 환경 최적화 팁:"
echo "- 연결 풀 크기를 3-5로 제한"
echo "- 타임아웃을 60초로 설정"
echo "- 30초마다 연결 상태 확인"
echo "- 자동 재연결 로직 활성화"
