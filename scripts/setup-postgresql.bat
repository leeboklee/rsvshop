@echo off
echo 🚀 PostgreSQL 설정을 시작합니다...

REM WSL2에서 PostgreSQL 서비스 시작
echo 📡 PostgreSQL 서비스 시작 중...
wsl sudo service postgresql start

REM 데이터베이스 생성
echo 🗄️  rsvshop 데이터베이스 생성 중...
wsl sudo -u postgres createdb rsvshop 2>/dev/null || echo "데이터베이스가 이미 존재합니다."

REM 환경 변수 설정
echo ⚙️  환경 변수 설정 중...
if not exist .env (
    echo DATABASE_URL="postgresql://postgres:qhraksgdl07@localhost:5432/rsvshop" > .env
    echo NODE_ENV="development" >> .env
    echo ✅ .env 파일이 생성되었습니다.
) else (
    echo ℹ️  .env 파일이 이미 존재합니다.
)

REM Prisma 클라이언트 생성
echo 🔧 Prisma 클라이언트 생성 중...
wsl npx prisma generate

REM 데이터베이스 마이그레이션
echo 🔄 데이터베이스 마이그레이션 중...
wsl npx prisma db push

echo ✅ PostgreSQL 설정이 완료되었습니다!
echo 🌐 서버를 시작하려면: npm run dev
pause
