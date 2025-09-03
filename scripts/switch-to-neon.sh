#!/bin/bash

# Neon DB로 빠른 전환 스크립트
echo "🔄 Neon DB로 전환 중..."

# 1. 현재 DATABASE_URL 확인
current_url=$(grep "DATABASE_URL=" .env.local | head -1 | cut -d'"' -f2)
echo "현재 DB: $current_url"

# 2. Neon URL이 설정되어 있는지 확인
if grep -q "NEON_DATABASE_URL=" .env.local; then
    neon_url=$(grep "NEON_DATABASE_URL=" .env.local | cut -d'"' -f2)
    if [ ! -z "$neon_url" ] && [ "$neon_url" != "postgresql://[user]:[password]@[hostname]/[database]?sslmode=require" ]; then
        echo "✅ Neon URL 발견: $neon_url"
        
        # 3. Neon URL로 전환
        echo "🔄 Neon DB로 전환..."
        sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"$neon_url\"|" .env.local
        
        # 4. Prisma 클라이언트 재생성
        echo "🔧 Prisma 클라이언트 재생성..."
        npx prisma generate
        
        # 5. 연결 테스트
        echo "🧪 연결 테스트..."
        if npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
            echo "✅ Neon DB 연결 성공!"
            echo "🚀 서버를 시작하려면: npm run dev"
        else
            echo "❌ Neon DB 연결 실패"
            exit 1
        fi
    else
        echo "❌ Neon URL이 설정되지 않았습니다"
        echo "📝 scripts/neon-setup.sh를 실행하여 Neon URL을 설정하세요"
        exit 1
    fi
else
    echo "❌ NEON_DATABASE_URL이 설정되지 않았습니다"
    echo "📝 scripts/neon-setup.sh를 실행하여 Neon URL을 설정하세요"
    exit 1
fi
