# RSVShop API 엔드포인트 정리

## 📍 기본 정보
- **기본 URL**: `http://localhost:4900`
- **API 버전**: v1
- **인증 방식**: API Key (외부 API), 세션 기반 (관리자)

---

## 🔐 관리자 API (`/api/admin/*`)

### 📊 대시보드 & 통계
- **GET** `/api/admin/stats` - 대시보드 통계 데이터
  - 총 예약 수, 오늘 예약 수, 이번 주 예약 수
  - 활성 객실 수, 패키지 수

### 🏨 호텔 관리
- **GET** `/api/admin/hotels` - 호텔 목록 조회
- **POST** `/api/admin/hotels` - 신규 호텔 생성
- **GET** `/api/admin/hotels/[id]` - 특정 호텔 상세 정보
- **PUT** `/api/admin/hotels/[id]` - 호텔 정보 수정
- **DELETE** `/api/admin/hotels/[id]` - 호텔 삭제

### 🏠 객실 관리
- **GET** `/api/admin/rooms` - 객실 목록 조회
- **POST** `/api/admin/rooms` - 신규 객실 생성
- **GET** `/api/admin/rooms/[id]` - 특정 객실 상세 정보
- **PUT** `/api/admin/rooms/[id]` - 객실 정보 수정
- **DELETE** `/api/admin/rooms/[id]` - 객실 삭제

### 📦 패키지 관리
- **GET** `/api/admin/packages` - 패키지 목록 조회 (객실별)
- **POST** `/api/admin/packages` - 신규 패키지 생성
- **GET** `/api/admin/packages/[id]` - 특정 패키지 상세 정보
- **PUT** `/api/admin/packages/[id]` - 패키지 정보 수정
- **DELETE** `/api/admin/packages/[id]` - 패키지 삭제

### 📅 예약 관리
- **GET** `/api/admin/reservations` - 예약 목록 조회 (관리자용)
- **POST** `/api/admin/reservations` - 신규 예약 생성
- **GET** `/api/admin/reservations/[id]` - 특정 예약 상세 정보
- **PUT** `/api/admin/reservations/[id]` - 예약 정보 수정
- **DELETE** `/api/admin/reservations/[id]` - 예약 삭제

### 👥 고객 관리
- **GET** `/api/admin/customers` - 고객 목록 조회 (ERP용)
  - 고객별 예약 통계, 지출 분석
  - 최근 예약 정보

### 💰 매출 관리
- **GET** `/api/admin/sales` - 매출 데이터 조회
  - 월별/주간 매출 통계
  - 커스텀 날짜 범위 지원
  - 부가세, 수수료 계산

### 🏛️ 부가세 관리
- **GET** `/api/admin/vat-settings` - 부가세 설정 조회
- **POST** `/api/admin/vat-settings` - 부가세 설정 생성/수정
- **GET** `/api/admin/vat-reports` - 부가세 신고서 목록
- **POST** `/api/admin/vat-reports` - 부가세 신고서 생성
- **GET** `/api/admin/vat-transactions` - 부가세 거래 목록
- **POST** `/api/admin/vat-transactions` - 부가세 거래 생성

### 🛒 쇼핑몰 연동
- **GET** `/api/admin/shopping-malls` - 쇼핑몰 목록 조회
- **POST** `/api/admin/shopping-malls` - 신규 쇼핑몰 등록
- **GET** `/api/admin/shopping-malls/[id]` - 특정 쇼핑몰 상세 정보
- **PUT** `/api/admin/shopping-malls/[id]` - 쇼핑몰 정보 수정
- **DELETE** `/api/admin/shopping-malls/[id]` - 쇼핑몰 삭제

### 🔑 API 키 관리
- **GET** `/api/admin/api-keys` - API 키 목록 조회
- **POST** `/api/admin/api-keys` - 새로운 API 키 생성
- **DELETE** `/api/admin/api-keys` - API 키 삭제

### 📝 로그 & 모니터링
- **GET** `/api/admin/logs/stream` - 실시간 로그 스트림 (SSE)
- **GET** `/api/admin/error-report` - 브라우저 오류 목록
- **POST** `/api/admin/error-report` - 클라이언트 오류 수신

### 🗄️ 데이터베이스 관리
- **GET** `/api/admin/database` - 현재 DB 상태 조회
- **POST** `/api/admin/database/backup` - 데이터베이스 백업
- **POST** `/api/admin/database/restore` - 데이터베이스 복원
- **GET** `/api/admin/prisma-status` - Prisma 상태 및 스키마 정보

---

## 🔐 인증 API (`/api/auth/*`)

- **POST** `/api/auth/login` - 관리자 로그인
  - JWT 토큰 생성 및 쿠키 설정
  - 로그인 기록 저장
- **POST** `/api/auth/logout` - 로그아웃
  - 인증 쿠키 제거
- **GET** `/api/auth/me` - 현재 사용자 정보 조회
  - 토큰 검증 및 사용자 정보 반환
- **POST** `/api/auth/refresh` - 토큰 갱신
  - 만료된 토큰도 허용하여 갱신

---

## 📧 알림 API (`/api/notifications/*`)

- **GET** `/api/notifications` - 알림 목록 조회
  - 페이지네이션, 타입별 필터링 지원
- **POST** `/api/notifications` - 새 알림 생성
  - 우선순위, 관련 ID 설정 가능
- **PUT** `/api/notifications/[id]/read` - 알림 읽음 처리
  - 읽은 시간 기록

---

## 📊 리포트 API (`/api/reports/*`)

- **GET** `/api/reports/booking-summary` - 예약 요약 리포트
  - 일별/주별/월별 그룹화
  - 호텔별 필터링
  - 상태별 통계

---

## 🔍 검색 API (`/api/search/*`)

- **GET** `/api/search/global` - 통합 검색
  - 호텔, 객실, 패키지, 고객, 예약 통합 검색
  - 검색어 하이라이트 처리
  - 타입별 필터링

---

## 📱 모바일 API (`/api/mobile/*`)

- **GET** `/api/mobile/dashboard` - 모바일 대시보드
  - 오늘/내일/이번 주 예약 현황
  - 긴급 알림 (체크인 1시간 전)
  - 최근 예약 목록

---

## 🛍️ 고객용 API (`/api/customer/*`)

### 📋 주문 관리
- **GET** `/api/customer/orders` - 주문 목록 조회
- **POST** `/api/customer/orders` - 신규 주문 생성
- **GET** `/api/customer/orders/[id]` - 특정 주문 상세 정보

### 🎁 상품 관리
- **GET** `/api/customer/products` - 상품 목록 조회
- **GET** `/api/customer/products/[id]` - 특정 상품 상세 정보
- **GET** `/api/customer/categories` - 카테고리 목록 조회

### 📊 데이터 가져오기/내보내기
- **GET** `/api/customer/import` - 데이터 가져오기
- **GET** `/api/customer/export` - 데이터 내보내기

---

## 🏨 호텔 API (`/api/hotels/*`)

- **GET** `/api/hotels` - 호텔 목록 조회
- **POST** `/api/hotels` - 신규 호텔 생성
- **GET** `/api/hotels/[id]` - 특정 호텔 상세 정보
- **PUT** `/api/hotels/[id]` - 호텔 정보 수정
- **DELETE** `/api/hotels/[id]` - 호텔 삭제

---

## 📅 예약 API (`/api/reservations/*`)

- **GET** `/api/reservations` - 예약 목록 조회
- **POST** `/api/reservations` - 신규 예약 생성
- **GET** `/api/reservations/[id]` - 특정 예약 상세 정보
- **PUT** `/api/reservations/[id]` - 예약 정보 수정
- **DELETE** `/api/reservations/[id]` - 예약 삭제
- **GET** `/api/reservations/check` - 예약 가능 여부 확인

---

## 💳 결제 API (`/api/payments/*`)

- **POST** `/api/payments/confirm` - 결제 확인 및 처리
  - 토스페이먼츠 연동
  - 예약 상태 업데이트

---

## 🏠 객실 API (`/api/rooms/*`)

- **GET** `/api/rooms` - 객실 목록 조회
- **POST** `/api/rooms` - 신규 객실 생성
- **GET** `/api/rooms/[id]` - 특정 객실 상세 정보
- **PUT** `/api/rooms/[id]` - 객실 정보 수정
- **DELETE** `/api/rooms/[id]` - 객실 삭제

---

## 📦 패키지 API (`/api/packages/*`)

- **GET** `/api/packages` - 패키지 목록 조회
- **POST** `/api/packages` - 신규 패키지 생성
- **GET** `/api/packages/[id]` - 특정 패키지 상세 정보
- **PUT** `/api/packages/[id]` - 패키지 정보 수정
- **DELETE** `/api/packages/[id]` - 패키지 삭제

---

## 🔗 외부 연동 API (`/api/external/*`)

### 📦 패키지 (외부용)
- **GET** `/api/external/packages` - 패키지 목록 조회 (API 키 인증)
  - 캐시 지원 (5분)

### 🏠 객실 (외부용)
- **GET** `/api/external/rooms` - 객실 목록 조회 (API 키 인증)
  - 캐시 지원 (5분)

### 📅 예약 (외부용)
- **GET** `/api/external/reservations` - 예약 목록 조회 (API 키 인증)
- **POST** `/api/external/reservations` - 신규 예약 생성 (API 키 인증)

---

## 🔄 통합 연동 API (`/api/integrations/*`)

### 🔄 동기화
- **GET** `/api/integrations/sync` - 주문 동기화 결과 조회
- **POST** `/api/integrations/sync` - 마켓플레이스 주문 동기화
  - 네이버, 지마켓 연동

### 📋 주문 관리
- **GET** `/api/integrations/orders` - 외부 주문 목록 조회

### 🏪 마켓플레이스
- **GET** `/api/integrations/marketplaces/keys` - 마켓플레이스 API 키 조회
- **POST** `/api/integrations/marketplaces/keys` - 마켓플레이스 API 키 저장

---

## 📊 재고 관리 API (`/api/inventory/*`)

- **GET** `/api/inventory` - 재고 목록 조회
  - 연도/월별, 호텔/객실/패키지별 필터링
- **PUT** `/api/inventory` - 재고 일괄 업데이트
- **GET** `/api/inventory/summary` - 재고 요약 정보
  - 호텔별 재고 현황, 이용률

---

## 📊 재고 상세 API (`/api/inventories/*`)

- **GET** `/api/inventories` - 재고 상세 목록 조회
- **POST** `/api/inventories` - 신규 재고 생성
- **GET** `/api/inventories/[id]` - 특정 재고 상세 정보
- **PUT** `/api/inventories/[id]` - 재고 정보 수정
- **DELETE** `/api/inventories/[id]` - 재고 삭제

---

## 💰 가격 계산 API (`/api/pricing/*`)

- **GET** `/api/pricing/quote` - 가격 견적 계산
  - 날짜별 기본가 + 추가요금 계산
  - 재고 상태 확인

---

## 🏪 사이트 연동 API (`/api/site/*`)

- **GET** `/api/site/bookings` - 사이트별 예약 목록 조회
- **POST** `/api/site/bookings` - 사이트 예약 생성
- **PATCH** `/api/site/bookings` - 예약 상태 업데이트

---

## 📋 추가요금 규칙 API (`/api/surcharge-rules/*`)

- **GET** `/api/surcharge-rules` - 추가요금 규칙 목록 조회
- **POST** `/api/surcharge-rules` - 신규 추가요금 규칙 생성
- **PUT** `/api/surcharge-rules` - 추가요금 규칙 수정
- **DELETE** `/api/surcharge-rules` - 추가요금 규칙 삭제

---

## 🏥 헬스체크 API

- **GET** `/api/health` - 서버 상태 확인
  - 데이터베이스 연결 상태
  - 메모리 사용량, 업타임
- **GET** `/api/health/db` - 데이터베이스 전용 상태 확인
  - PostgreSQL 연결 테스트
  - 테이블별 레코드 수

---

## 🏓 핑 API

- **GET** `/api/ping` - 서버 생존 확인
  - 가벼운 응답 (DB 접속 없음)
  - 업타임 정보

---

## 🧪 테스트 API

- **GET** `/api/test` - API 연결 테스트
  - 기본 연결 상태 확인

---

## 🔧 API 사용 가이드

### 📋 공통 헤더
```http
Content-Type: application/json
Authorization: Bearer {API_KEY}  # 외부 API용
```

### 📊 응답 형식
```json
{
  "success": true,
  "data": {...},
  "message": "성공적으로 처리되었습니다.",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### ⚠️ 에러 응답
```json
{
  "success": false,
  "error": "에러 메시지",
  "details": "상세 에러 정보"
}
```

### 🔒 권한 레벨
- **관리자**: 모든 API 접근 가능
- **외부 API**: API 키 기반 인증
- **고객**: 제한된 API 접근

---

## 📈 성능 최적화

### 🚀 캐싱 전략
- 외부 API: 5분 캐시
- 정적 데이터: 1시간 캐시
- 동적 데이터: 캐시 없음

### 📊 데이터베이스 최적화
- 인덱스 활용
- 페이지네이션 지원
- 필요한 필드만 선택

### 🔄 비동기 처리
- 로그 스트리밍 (SSE)
- 배치 작업 지원
- 실시간 업데이트

---

## 🔐 인증 및 보안

### JWT 토큰 관리
- **토큰 만료**: 24시간
- **자동 갱신**: 만료된 토큰도 갱신 가능
- **쿠키 기반**: httpOnly, secure 설정

### API 키 인증
- **외부 API**: API 키 기반 인증
- **권한 관리**: 기능별 권한 설정
- **키 관리**: 생성, 조회, 삭제

---

## 📱 모바일 최적화

### 모바일 대시보드
- **간소화된 통계**: 핵심 정보만 표시
- **긴급 알림**: 체크인 1시간 전 알림
- **빠른 액세스**: 최근 예약 목록

### 터치 친화적 UI
- **큰 버튼**: 모바일 터치에 최적화
- **스와이프 제스처**: 좌우 스와이프 지원
- **반응형 디자인**: 다양한 화면 크기 지원
