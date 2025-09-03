# 데이터베이스 관리 가이드

## 🎯 **개발 vs 프로덕션 환경 관리**

### **1. 환경 분리 전략**

```
로컬 개발 환경 (WSL)
├── PostgreSQL (localhost:5432)
├── 데이터: 테스트/개발용
└── 접근: 개발자만

Vercel 프로덕션 환경
├── Vercel Postgres
├── 데이터: 실제 운영 데이터
└── 접근: 관리자 페이지에서 확인
```

### **2. 관리자 페이지에서 실제 DB 보기**

#### **접속 방법:**
```
로컬: http://localhost:4900/admin/database/enhanced
프로덕션: https://your-app.vercel.app/admin/database/enhanced
```

#### **기능:**
- ✅ **실시간 DB 상태 모니터링**
- ✅ **테이블별 레코드 수 확인**
- ✅ **실제 데이터 조회 및 검색**
- ✅ **환경 정보 확인** (로컬/프로덕션 구분)
- ✅ **최근 예약/패키지 데이터 미리보기**

### **3. 데이터 동기화 방법**

#### **개발 → 프로덕션 (신규 배포 시):**
```bash
# 1. 로컬에서 스키마 마이그레이션
npx prisma migrate dev

# 2. Vercel에 배포
vercel --prod

# 3. 프로덕션 DB에 마이그레이션 적용
npx vercel env pull .env.production
npx prisma migrate deploy
```

#### **프로덕션 → 개발 (데이터 복사):**
```bash
# 1. 프로덕션 데이터 백업
pg_dump $PRODUCTION_DATABASE_URL > prod_backup.sql

# 2. 로컬 DB에 복원
psql rsvshop < prod_backup.sql
```

### **4. 보안 고려사항**

#### **환경 변수 관리:**
```bash
# .env.local (로컬 개발용)
DATABASE_URL="postgresql://postgres:password@localhost:5432/rsvshop"

# Vercel 환경 변수 (프로덕션용)
DATABASE_URL="postgresql://username:password@host:port/database"
```

#### **접근 권한:**
- ✅ **관리자 페이지**: 인증된 사용자만 접근
- ✅ **API 엔드포인트**: 보안 검증 포함
- ✅ **SQL 인젝션 방지**: 안전한 쿼리 사용

### **5. 모니터링 및 알림**

#### **자동 모니터링:**
- 🔄 **30초마다 DB 상태 체크**
- 📊 **응답 시간 모니터링**
- 🚨 **연결 오류 시 알림**

#### **수동 확인:**
- 📋 **테이블별 데이터 현황**
- 🔍 **실시간 데이터 조회**
- 📈 **성능 지표 확인**

### **6. 문제 해결**

#### **일반적인 문제:**
1. **연결 오류**: 환경 변수 확인
2. **마이그레이션 실패**: 스키마 동기화
3. **데이터 불일치**: 백업/복원 실행

#### **긴급 복구:**
```bash
# 1. 백업에서 복원
psql $DATABASE_URL < backup.sql

# 2. 마이그레이션 재실행
npx prisma migrate deploy

# 3. 상태 확인
npx prisma db pull
```

## 🎉 **결론**

이제 관리자 페이지에서:
- ✅ **실제 운영 DB 상태를 실시간으로 확인**
- ✅ **테이블별 데이터 현황 파악**
- ✅ **환경별 DB 분리 관리**
- ✅ **안전한 데이터 조회 및 모니터링**

개발과 프로덕션을 효율적으로 관리할 수 있습니다!
