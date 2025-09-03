#!/bin/bash

# Neon DB 설정 스크립트
echo "🚀 Neon DB 설정 시작..."

# 1. 환경 변수 확인
echo "📋 현재 환경 변수 확인..."
if [ -f ".env.local" ]; then
    echo "✅ .env.local 파일 존재"
    echo "현재 DATABASE_URL:"
    grep "DATABASE_URL=" .env.local | head -1
else
    echo "❌ .env.local 파일이 없습니다"
    exit 1
fi

# 2. Neon 연결 문자열 입력 받기
echo ""
echo "🔗 Neon DB 연결 문자열을 입력하세요:"
echo "형식: postgresql://[user]:[password]@[hostname]/[database]?sslmode=require"
echo ""
read -p "Neon DATABASE_URL: " neon_url

if [ -z "$neon_url" ]; then
    echo "❌ 연결 문자열이 입력되지 않았습니다"
    exit 1
fi

# 3. 백업 생성
echo "💾 기존 설정 백업..."
cp .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S)

# 4. Neon URL로 환경 변수 업데이트
echo "🔄 Neon URL로 환경 변수 업데이트..."
cat > .env.local << EOF
# 로컬 PostgreSQL (개발용)
# DATABASE_URL="postgresql://postgres:qhraksgdl07@127.0.0.1:5432/rsvshop?connection_limit=3&pool_timeout=60&connect_timeout=30&socket_timeout=60"

# Neon PostgreSQL (클라우드용)
DATABASE_URL="$neon_url"
NEON_DATABASE_URL="$neon_url"
EOF

echo "✅ 환경 변수 업데이트 완료"

# 5. Prisma 클라이언트 재생성
echo "🔧 Prisma 클라이언트 재생성..."
npx prisma generate

# 6. Neon DB에 스키마 적용
echo "📊 Neon DB에 스키마 적용..."
npx prisma db push

# 7. 연결 테스트
echo "🧪 연결 테스트..."
if npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Neon DB 연결 성공!"
else
    echo "❌ Neon DB 연결 실패. 연결 문자열을 확인해주세요."
    echo "복원하려면: cp .env.local.backup.$(date +%Y%m%d_%H%M%S) .env.local"
    exit 1
fi

echo ""
echo "🎉 Neon DB 설정 완료!"
echo "📝 다음 단계:"
echo "   1. npm run dev로 서버 시작"
echo "   2. http://localhost:4900/admin/database/enhanced에서 DB 상태 확인"
echo "   3. npx prisma studio로 데이터 확인"
