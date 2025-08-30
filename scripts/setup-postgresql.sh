#!/bin/bash

echo "🚀 PostgreSQL 설정을 시작합니다..."

# PostgreSQL 서비스 시작
echo "📡 PostgreSQL 서비스 시작 중..."
sudo service postgresql start

# 데이터베이스 생성
echo "🗄️  rsvshop 데이터베이스 생성 중..."
sudo -u postgres createdb rsvshop 2>/dev/null || echo "데이터베이스가 이미 존재합니다."

# 환경 변수 설정
echo "⚙️  환경 변수 설정 중..."
if [ ! -f .env ]; then
    cat > .env << EOF
DATABASE_URL="postgresql://postgres:qhraksgdl07@localhost:5432/rsvshop"
NODE_ENV="development"
EOF
    echo "✅ .env 파일이 생성되었습니다."
else
    echo "ℹ️  .env 파일이 이미 존재합니다."
fi

# Prisma 클라이언트 생성
echo "🔧 Prisma 클라이언트 생성 중..."
npx prisma generate

# 데이터베이스 마이그레이션
echo "🔄 데이터베이스 마이그레이션 중..."
npx prisma db push

echo "✅ PostgreSQL 설정이 완료되었습니다!"
echo "🌐 서버를 시작하려면: npm run dev"
