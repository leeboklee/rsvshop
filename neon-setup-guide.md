# Neon DB 연결 설정 가이드

## 1. Neon 계정 및 데이터베이스 생성

### Neon 계정 생성
1. [Neon 공식 웹사이트](https://neon.tech/) 방문
2. GitHub 계정으로 로그인
3. 새 프로젝트 생성

### 데이터베이스 생성
1. Neon 대시보드에서 "Create Database" 클릭
2. 데이터베이스 이름: `rsvshop`
3. 지역 선택 (Asia Pacific - Seoul 권장)
4. 생성 완료

## 2. 연결 정보 확인

### Neon 연결 문자열 형식
```
postgresql://[user]:[password]@[hostname]/[database]?sslmode=require
```

### 예시
```
postgresql://neondb_owner:npg_1234567890@ep-cool-darkness-123456.us-east-2.aws.neon.tech/rsvshop?sslmode=require
```

## 3. 환경 변수 설정

### 개발 환경 (.env.local)
```bash
# 로컬 개발용 (기존)
DATABASE_URL="postgresql://postgres:qhraksgdl07@127.0.0.1:5432/rsvshop?connection_limit=3&pool_timeout=60&connect_timeout=30&socket_timeout=60"

# Neon 개발용 (새로 추가)
NEON_DATABASE_URL="postgresql://[user]:[password]@[hostname]/[database]?sslmode=require"
```

### 프로덕션 환경 (.env.production)
```bash
# Neon 프로덕션용
DATABASE_URL="postgresql://[user]:[password]@[hostname]/[database]?sslmode=require"
```

## 4. Prisma 설정

### schema.prisma 수정
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // Neon용 추가
}
```

## 5. 마이그레이션 실행

### Neon DB에 스키마 적용
```bash
# Prisma 클라이언트 생성
npx prisma generate

# Neon DB에 마이그레이션 적용
npx prisma db push

# 또는 마이그레이션 파일 생성
npx prisma migrate dev --name init
```

## 6. 연결 테스트

### 연결 확인
```bash
# Prisma Studio로 DB 확인
npx prisma studio

# 또는 API 테스트
curl http://localhost:4900/api/health/db
```

## 7. 환경별 DB 전환

### 개발 시 로컬 DB 사용
```bash
# .env.local에서 DATABASE_URL 사용
npm run dev
```

### 개발 시 Neon DB 사용
```bash
# .env.local에서 NEON_DATABASE_URL 사용
DATABASE_URL=$NEON_DATABASE_URL npm run dev
```

### 프로덕션 배포
```bash
# Vercel 환경 변수에 Neon DATABASE_URL 설정
vercel env add DATABASE_URL
```

## 8. 주의사항

- **SSL 연결**: Neon은 SSL 필수 (`sslmode=require`)
- **연결 풀링**: Neon은 자동 연결 풀링 제공
- **지역 선택**: 사용자와 가까운 지역 선택
- **백업**: Neon은 자동 백업 제공
- **스케일링**: 자동 스케일링 지원

## 9. 비용 최적화

- **개발용**: 무료 티어 (0.5GB 스토리지)
- **프로덕션**: 사용량에 따른 과금
- **슬리핑**: 비활성 시 자동 슬리핑으로 비용 절약
