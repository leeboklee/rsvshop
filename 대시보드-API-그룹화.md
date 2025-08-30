# 🎯 대시보드 API 그룹화 가이드

## 📍 기본 정보
- **대시보드 URL**: `http://localhost:4900/dashboard`
- **API 기본 URL**: `http://localhost:4900/api`
- **포트**: 4900 (RSVShop Admin 서버)

---

## 📋 API 그룹별 탭 구조

### 🏠 **1. 핵심 관리 탭**
- **통계 & 대시보드**: `/api/admin/stats`
- **예약 현황**: `/api/admin/reservations`
- **호텔 & 객실**: `/api/admin/hotels`, `/api/admin/rooms`
- **패키지 & 상품**: `/api/admin/packages`

### 💰 **2. 매출 & 재무 탭**
- **매출 분석**: `/api/admin/sales`
- **부가세 관리**: `/api/admin/vat-settings`, `/api/admin/vat-reports`, `/api/admin/vat-transactions`

### 👥 **3. 고객 & 마케팅 탭**
- **고객 관리**: `/api/admin/customers`
- **쇼핑몰 연동**: `/api/admin/shopping-malls`

### 🔐 **4. 보안 & 인증 탭**
- **인증 관리**: `/api/auth/*`
- **API 키 관리**: `/api/admin/api-keys`

### 📊 **5. 모니터링 & 로그 탭**
- **로그 & 에러**: `/api/admin/logs/*`, `/api/admin/error-report`
- **데이터베이스**: `/api/admin/database/*`, `/api/admin/prisma-status`

### 🔄 **6. 외부 연동 탭**
- **외부 API**: `/api/external/*`
- **마켓플레이스**: `/api/integrations/*`

### 📱 **7. 모바일 & UX 탭**
- **모바일 대시보드**: `/api/mobile/dashboard`
- **알림 시스템**: `/api/notifications/*`

### 🔍 **8. 검색 & 리포트 탭**
- **통합 검색**: `/api/search/global`
- **리포트 생성**: `/api/reports/booking-summary`

### 🏥 **9. 시스템 상태 탭**
- **헬스체크**: `/api/health/*`
- **핑 & 테스트**: `/api/ping`, `/api/test`

---

## 🏠 핵심 관리 탭

### 📊 통계 & 대시보드 데이터
```http
GET /api/admin/stats
```
**기능**: 대시보드 메인 화면에 표시되는 핵심 통계
- 총 예약 수
- 오늘 예약 수  
- 이번 주 예약 수
- 활성 객실 수
- 패키지 수

**사용 시점**: 대시보드 로드 시, 실시간 업데이트

---

### 📅 예약 현황 관리
```http
GET /api/admin/reservations?page=1&limit=10&status=ALL
POST /api/admin/reservations
GET /api/admin/reservations/[id]
PUT /api/admin/reservations/[id]
DELETE /api/admin/reservations/[id]
```
**기능**: 예약 목록 조회, 생성, 수정, 삭제
- 페이지네이션 지원
- 상태별 필터링 (PENDING, CONFIRMED, CANCELLED)
- 검색 기능 (고객명, 이메일, 전화번호)
- 실시간 예약 현황 모니터링

**사용 시점**: 예약 관리 탭, 대시보드 예약 요약

---

### 🏨 호텔 & 객실 관리
```http
# 호텔 관리
GET /api/admin/hotels
POST /api/admin/hotels
GET /api/admin/hotels/[id]
PUT /api/admin/hotels/[id]
DELETE /api/admin/hotels/[id]

# 객실 관리  
GET /api/admin/rooms
POST /api/admin/rooms
GET /api/admin/rooms/[id]
PUT /api/admin/rooms/[id]
DELETE /api/admin/rooms/[id]
```
**기능**: 호텔 및 객실 정보 관리
- 호텔별 객실 현황
- 객실별 예약 상태
- 호텔별 통계 데이터

**사용 시점**: 호텔/객실 관리 탭, 대시보드 호텔 요약

---

### 📦 패키지 & 상품 관리
```http
GET /api/admin/packages?roomId=&page=1&limit=50
POST /api/admin/packages
GET /api/admin/packages/[id]
PUT /api/admin/packages/[id]
DELETE /api/admin/packages/[id]
```
**기능**: 패키지 및 상품 정보 관리
- 객실별 패키지 목록
- 패키지별 예약 통계
- 가격 및 설명 관리

**사용 시점**: 패키지 관리 탭, 대시보드 상품 요약

---

## 💰 매출 & 재무 탭

### 📈 매출 분석
```http
GET /api/admin/sales?period=monthly&range=3months
GET /api/admin/sales?customRange=true&startDate=2024-01-01&endDate=2024-12-31
```
**기능**: 매출 데이터 분석 및 리포트
- 월별/주간 매출 통계
- 커스텀 날짜 범위 지원
- 부가세, 수수료 계산
- 매출 트렌드 분석

**사용 시점**: 매출 관리 탭, 대시보드 매출 차트

---

### 🏛️ 부가세 관리
```http
# 부가세 설정
GET /api/admin/vat-settings
POST /api/admin/vat-settings

# 부가세 신고서
GET /api/admin/vat-reports
POST /api/admin/vat-reports

# 부가세 거래
GET /api/admin/vat-transactions
POST /api/admin/vat-transactions
```
**기능**: 부가세 관련 모든 기능
- 부가세 설정 관리
- 부가세 신고서 생성
- 거래별 부가세 계산
- 납부 세액 계산

**사용 시점**: 부가세 관리 탭, 대시보드 세무 요약

---

## 👥 고객 & 마케팅 탭

### 👤 고객 관리
```http
GET /api/admin/customers
```
**기능**: 고객 데이터 분석 및 관리
- 고객별 예약 통계
- 지출 패턴 분석
- 최근 예약 정보
- 고객 세분화

**사용 시점**: 고객 관리 탭, 대시보드 고객 인사이트

---

### 🛒 쇼핑몰 연동
```http
GET /api/admin/shopping-malls
POST /api/admin/shopping-malls
GET /api/admin/shopping-malls/[id]
PUT /api/admin/shopping-malls/[id]
DELETE /api/admin/shopping-malls/[id]
```
**기능**: 외부 쇼핑몰 연동 관리
- 쇼핑몰별 수수료율 설정
- 정산 주기 관리
- 연동 상태 모니터링

**사용 시점**: 쇼핑몰 연동 탭, 대시보드 연동 현황

---

## 🔐 보안 & 인증 탭

### 🔑 인증 관리
```http
# 로그인/로그아웃
POST /api/auth/login
POST /api/auth/logout

# 사용자 정보
GET /api/auth/me
POST /api/auth/refresh
```
**기능**: 사용자 인증 및 세션 관리
- JWT 토큰 기반 인증
- 자동 토큰 갱신
- 로그인 기록 저장
- 보안 쿠키 관리

**사용 시점**: 로그인 페이지, 세션 유지, 권한 확인

---

### 🔐 API 키 관리
```http
GET /api/admin/api-keys
POST /api/admin/api-keys
DELETE /api/admin/api-keys?key=
```
**기능**: 외부 API 접근 권한 관리
- API 키 생성/삭제
- 권한별 접근 제어
- 외부 서비스 연동

**사용 시점**: API 관리 탭, 외부 연동 설정

---

## 📊 모니터링 & 로그 탭

### 📝 로그 & 에러 모니터링
```http
# 실시간 로그 스트림
GET /api/admin/logs/stream

# 에러 리포트
GET /api/admin/error-report
POST /api/admin/error-report
```
**기능**: 시스템 모니터링 및 디버깅
- 실시간 로그 스트리밍 (SSE)
- 브라우저 에러 수집
- 에러 통계 및 분석
- 시스템 상태 모니터링

**사용 시점**: 로그 뷰어 탭, 에러 모니터링

---

### 🗄️ 데이터베이스 관리
```http
# DB 상태
GET /api/admin/database
GET /api/admin/prisma-status

# 백업/복원
POST /api/admin/database/backup
POST /api/admin/database/restore
```
**기능**: 데이터베이스 상태 및 관리
- DB 연결 상태 확인
- 테이블별 레코드 수
- 백업/복원 기능
- Prisma 스키마 정보

**사용 시점**: DB 관리 탭, 시스템 점검

---

## 🔄 외부 연동 탭

### 🔗 외부 API 연동
```http
# 패키지 (외부용)
GET /api/external/packages

# 객실 (외부용)
GET /api/external/rooms

# 예약 (외부용)
GET /api/external/reservations
POST /api/external/reservations
```
**기능**: 외부 서비스와의 API 연동
- API 키 인증
- 캐시 지원 (5분)
- 제한된 데이터 노출
- 외부 시스템 연동

**사용 시점**: 외부 연동, 파트너 사이트

---

### 🔄 마켓플레이스 연동
```http
# 주문 동기화
GET /api/integrations/sync
POST /api/integrations/sync

# 외부 주문
GET /api/integrations/orders

# 마켓플레이스 키
GET /api/integrations/marketplaces/keys
POST /api/integrations/marketplaces/keys
```
**기능**: 네이버, 지마켓 등 마켓플레이스 연동
- 주문 자동 동기화
- 재고 실시간 업데이트
- API 키 관리
- 연동 상태 모니터링

**사용 시점**: 마켓플레이스 연동 탭, 주문 동기화

---

## 📱 모바일 & UX 탭

### 📱 모바일 대시보드
```http
GET /api/mobile/dashboard?hotelId=&userId=
```
**기능**: 모바일 최적화된 대시보드
- 간소화된 통계
- 긴급 알림 (체크인 1시간 전)
- 최근 예약 목록
- 터치 친화적 UI

**사용 시점**: 모바일 앱, 반응형 웹

---

### 📧 알림 시스템
```http
# 알림 목록
GET /api/notifications?page=1&limit=20&type=&isRead=

# 알림 생성
POST /api/notifications

# 알림 읽음 처리
PUT /api/notifications/[id]/read
```
**기능**: 실시간 알림 및 알림 관리
- 시스템 알림 생성
- 사용자별 알림 관리
- 읽음/안읽음 상태
- 우선순위별 알림

**사용 시점**: 알림 센터, 실시간 알림

---

## 🔍 검색 & 리포트 탭

### 🔍 통합 검색
```http
GET /api/search/global?q=검색어&type=all&limit=20
```
**기능**: 전체 시스템 통합 검색
- 호텔, 객실, 패키지, 고객, 예약 통합 검색
- 검색어 하이라이트
- 타입별 필터링
- 검색 결과 요약

**사용 시점**: 검색바, 빠른 검색

---

### 📊 리포트 생성
```http
GET /api/reports/booking-summary?startDate=&endDate=&hotelId=&groupBy=daily
```
**기능**: 예약 데이터 리포트 생성
- 일별/주별/월별 그룹화
- 호텔별 필터링
- 상태별 통계
- 매출 분석

**사용 시점**: 리포트 탭, 데이터 분석

---

## 🏥 시스템 상태 탭

### 💚 헬스체크
```http
# 서버 상태
GET /api/health

# DB 상태
GET /api/health/db
```
**기능**: 시스템 상태 확인
- 서버 생존 확인
- DB 연결 상태
- 메모리 사용량
- 업타임 정보

**사용 시점**: 시스템 모니터링, 상태 점검

---

### 🏓 핑 & 테스트
```http
# 서버 생존 확인
GET /api/ping

# API 연결 테스트
GET /api/test
```
**기능**: 기본 연결 테스트
- 가벼운 응답 (DB 접속 없음)
- API 연결 상태 확인
- 기본 기능 테스트

**사용 시점**: 연결 테스트, 상태 확인

---

## 📋 탭별 API 사용 가이드

### 🏠 **핵심 관리 탭** - 메인 대시보드
```typescript
// 필수 API 호출 순서
1. GET /api/admin/stats          // 핵심 통계
2. GET /api/admin/reservations   // 최근 예약
3. GET /api/admin/hotels         // 호텔 현황
4. GET /api/admin/rooms          // 객실 현황
```

### 💰 **매출 & 재무 탭** - 매출 대시보드
```typescript
// 매출 관련 API
1. GET /api/admin/sales          // 매출 데이터
2. GET /api/admin/vat-reports    // 부가세 신고서
3. GET /api/admin/vat-transactions // 부가세 거래
4. GET /api/reports/booking-summary // 예약 리포트
```

### 👥 **고객 & 마케팅 탭** - 고객 대시보드
```typescript
// 고객 관련 API
1. GET /api/admin/customers      // 고객 분석
2. GET /api/admin/shopping-malls // 쇼핑몰 연동
3. GET /api/admin/reservations   // 고객별 예약
```

### 🔐 **보안 & 인증 탭** - 관리자 설정
```typescript
// 보안 관련 API
1. GET /api/auth/me              // 현재 사용자
2. GET /api/admin/api-keys       // API 키 목록
3. POST /api/auth/refresh        // 토큰 갱신
```

### 📊 **모니터링 & 로그 탭** - 시스템 관리
```typescript
// 모니터링 관련 API
1. GET /api/admin/logs/stream    // 실시간 로그
2. GET /api/admin/error-report   // 에러 리포트
3. GET /api/admin/database       // DB 상태
```

### 🔄 **외부 연동 탭** - 연동 관리
```typescript
// 연동 관련 API
1. GET /api/external/packages    // 외부 패키지
2. GET /api/integrations/sync    // 동기화 상태
3. GET /api/integrations/orders  // 외부 주문
```

### 📱 **모바일 & UX 탭** - 모바일 대시보드
```typescript
// 모바일 관련 API
1. GET /api/mobile/dashboard     // 모바일 대시보드
2. GET /api/notifications        // 알림 목록
3. GET /api/admin/stats          // 간소화된 통계
```

### 🔍 **검색 & 리포트 탭** - 데이터 분석
```typescript
// 검색 및 리포트 API
1. GET /api/search/global        // 통합 검색
2. GET /api/reports/booking-summary // 예약 리포트
3. GET /api/admin/sales          // 매출 분석
```

### 🏥 **시스템 상태 탭** - 상태 점검
```typescript
// 시스템 상태 API
1. GET /api/health               // 서버 상태
2. GET /api/health/db            // DB 상태
3. GET /api/ping                 // 연결 테스트
```

---

## 🔧 탭별 최적화 전략

### 🚀 **핵심 관리 탭** - 성능 최적화
- **병렬 요청**: 통계, 예약, 호텔 정보 동시 호출
- **실시간 업데이트**: WebSocket/SSE로 실시간 데이터
- **캐싱**: 자주 변경되지 않는 데이터는 5분 캐시

### 💰 **매출 & 재무 탭** - 데이터 최적화
- **점진적 로딩**: 차트 데이터를 단계별로 로드
- **집계 쿼리**: DB에서 미리 계산된 통계 사용
- **백그라운드 처리**: 대용량 리포트는 비동기 생성

### 👥 **고객 & 마케팅 탭** - 사용자 경험
- **검색 최적화**: 고객 검색 시 인덱스 활용
- **페이지네이션**: 대용량 고객 데이터는 페이지 단위
- **필터링**: 고객 세분화를 위한 다중 필터

### 🔐 **보안 & 인증 탭** - 보안 강화
- **토큰 자동 갱신**: 만료 전 자동 갱신
- **권한 검증**: API별 세밀한 접근 제어
- **감사 로그**: 모든 보안 관련 작업 기록

### 📊 **모니터링 & 로그 탭** - 시스템 안정성
- **실시간 스트리밍**: 로그 데이터 실시간 전송
- **에러 집계**: 에러 패턴 분석 및 알림
- **성능 모니터링**: API 응답 시간 추적

### 🔄 **외부 연동 탭** - 연동 안정성
- **재시도 로직**: 연동 실패 시 자동 재시도
- **상태 모니터링**: 연동 상태 실시간 확인
- **데이터 동기화**: 충돌 해결 및 데이터 일관성

### 📱 **모바일 & UX 탭** - 모바일 최적화
- **데이터 압축**: 모바일에서는 핵심 정보만
- **오프라인 지원**: 캐시된 데이터로 오프라인 동작
- **터치 최적화**: 모바일 터치에 최적화된 UI

### 🔍 **검색 & 리포트 탭** - 검색 성능
- **검색 인덱스**: 빠른 검색을 위한 DB 인덱스
- **검색어 하이라이트**: 검색 결과 강조 표시
- **검색 제안**: 자동완성 및 검색어 제안

### 🏥 **시스템 상태 탭** - 상태 모니터링
- **정기 점검**: 주기적인 시스템 상태 확인
- **알림 시스템**: 문제 발생 시 즉시 알림
- **복구 자동화**: 간단한 문제는 자동 복구

---

## 📊 탭별 API 호출 예시

```typescript
// 핵심 관리 탭 - 메인 대시보드
async function loadMainDashboard() {
  try {
    const [stats, reservations, hotels, rooms] = await Promise.all([
      fetch('/api/admin/stats'),
      fetch('/api/admin/reservations?limit=5'),
      fetch('/api/admin/hotels'),
      fetch('/api/admin/rooms')
    ]);
    
    return { stats, reservations, hotels, rooms };
  } catch (error) {
    console.error('메인 대시보드 로드 실패:', error);
  }
}

// 매출 & 재무 탭 - 매출 대시보드
async function loadSalesDashboard() {
  try {
    const [sales, vatReports, vatTransactions, bookingReport] = await Promise.all([
      fetch('/api/admin/sales?period=monthly'),
      fetch('/api/admin/vat-reports'),
      fetch('/api/admin/vat-transactions'),
      fetch('/api/reports/booking-summary?groupBy=monthly')
    ]);
    
    return { sales, vatReports, vatTransactions, bookingReport };
  } catch (error) {
    console.error('매출 대시보드 로드 실패:', error);
  }
}

// 모니터링 & 로그 탭 - 시스템 모니터링
async function loadSystemMonitoring() {
  try {
    const [logs, errors, dbStatus] = await Promise.all([
      fetch('/api/admin/logs/stream'),
      fetch('/api/admin/error-report'),
      fetch('/api/admin/database')
    ]);
    
    return { logs, errors, dbStatus };
  } catch (error) {
    console.error('시스템 모니터링 로드 실패:', error);
  }
}
```

이렇게 탭으로 구성하면 사용자가 원하는 기능을 직관적으로 찾을 수 있고, 각 탭별로 관련된 API들을 효율적으로 관리할 수 있습니다.
