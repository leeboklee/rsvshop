# Vercel 데이터베이스 설정 가이드

## 1. Vercel Postgres 설정

### Vercel 대시보드에서:
1. 프로젝트 선택
2. Storage 탭 → Create Database → Postgres
3. 데이터베이스 이름 설정 (예: rsvshop-prod)
4. 지역 선택 (Seoul 또는 Tokyo)

### 환경 변수 설정:
```bash
# Vercel 대시보드 → Settings → Environment Variables
DATABASE_URL="postgresql://username:password@host:port/database"
POSTGRES_URL="postgresql://username:password@host:port/database"
POSTGRES_PRISMA_URL="postgresql://username:password@host:port/database?pgbouncer=true&connect_timeout=15"
POSTGRES_USER="username"
POSTGRES_HOST="host"
POSTGRES_PASSWORD="password"
POSTGRES_DATABASE="database"
```

## 2. 로컬 개발 환경 설정

### .env.local 파일:
```bash
# 로컬 개발용
DATABASE_URL="postgresql://postgres:password@localhost:5432/rsvshop"

# Vercel 프로덕션용 (참고용)
# DATABASE_URL="postgresql://username:password@host:port/database"
```

## 3. 데이터베이스 마이그레이션

### 프로덕션 DB에 스키마 적용:
```bash
# Vercel CLI 사용
npx vercel env pull .env.production
npx prisma migrate deploy
npx prisma generate
```

### 또는 Vercel 대시보드에서:
1. Functions 탭 → Create Function
2. `api/migrate` 엔드포인트 생성
3. 마이그레이션 실행

## 4. 데이터 동기화

### 개발 → 프로덕션:
```bash
# 로컬 데이터 백업
pg_dump rsvshop > backup.sql

# 프로덕션에 복원 (주의: 기존 데이터 덮어씀)
psql $PRODUCTION_DATABASE_URL < backup.sql
```

### 프로덕션 → 개발:
```bash
# 프로덕션 데이터 백업
pg_dump $PRODUCTION_DATABASE_URL > prod_backup.sql

# 로컬에 복원
psql rsvshop < prod_backup.sql
```
