# RSVShop - 호텔 예약 관리 시스템

## 🚀 최신 업데이트

### PostgreSQL 마이그레이션 완료 ✅
- **SQLite 지원 종료**: 더 이상 SQLite를 지원하지 않습니다
- **PostgreSQL 전용**: 안정성과 성능을 위해 PostgreSQL만 사용
- **향상된 기능**: 더 나은 데이터베이스 관리 및 모니터링

자세한 내용은 [PostgreSQL 마이그레이션 가이드](docs/postgresql-migration-guide.md)를 참조하세요.

## 📋 프로젝트 개요

RSVShop은 호텔 예약을 관리하는 웹 애플리케이션입니다. 관리자와 고객을 위한 직관적인 인터페이스를 제공합니다.

## ✨ 주요 기능

- 🏨 **객실 관리**: 객실 정보 및 가용성 관리
- 📅 **예약 시스템**: 체크인/아웃 날짜 기반 예약 관리
- 💰 **패키지 관리**: 다양한 숙박 패키지 및 가격 설정
- 👥 **고객 관리**: 고객 정보 및 예약 이력 관리
- 📊 **대시보드**: 실시간 통계 및 분석
- 🔌 **API 연동**: 외부 시스템과의 연동 지원

## 🛠️ 기술 스택

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Prisma ORM)
- **Styling**: Tailwind CSS
- **Deployment**: Netlify, Vercel

## 🚀 빠른 시작

### 1. 환경 설정

#### WSL2/Linux
```bash
# PostgreSQL 설정 스크립트 실행
chmod +x scripts/setup-postgresql.sh
./scripts/setup-postgresql.sh
```

#### Windows
```cmd
# PostgreSQL 설정 스크립트 실행
scripts\setup-postgresql.bat
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 개발 서버 시작
```bash
npm run dev
```

### 4. 브라우저에서 확인
```
http://localhost:4900
```

## 📁 프로젝트 구조

```
rsvshop/
├── app/                    # Next.js 14 App Router
│   ├── admin/             # 관리자 페이지
│   ├── api/               # API 엔드포인트
│   ├── components/        # 공통 컴포넌트
│   └── site/              # 고객용 사이트
├── prisma/                # 데이터베이스 스키마
├── scripts/               # 설정 및 유틸리티 스크립트
├── docs/                  # 문서
└── public/                # 정적 파일
```

## 🔧 데이터베이스 설정

### PostgreSQL 필수 요구사항
- PostgreSQL 12+ 설치
- `rsvshop` 데이터베이스 생성
- 환경 변수 설정

### 환경 변수 (.env)
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/rsvshop"
NODE_ENV="development"
```

## 📚 API 문서

### 주요 엔드포인트
- `GET /api/health/db` - 데이터베이스 상태 확인
- `GET /api/admin/reservations` - 예약 목록 조회
- `POST /api/admin/reservations` - 새 예약 생성
- `GET /api/rooms` - 객실 목록 조회
- `GET /api/packages` - 패키지 목록 조회

## 🧪 테스트

```bash
# 테스트 실행
npm test

# 테스트 커버리지
npm run test:coverage
```

## 📦 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 시작
npm start
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 지원

문제가 발생하거나 질문이 있으시면:
- [Issues](../../issues) 페이지에 등록
- [PostgreSQL 마이그레이션 가이드](docs/postgresql-migration-guide.md) 참조
- [트러블슈팅 가이드](docs/troubleshooting-guide.md) 확인

---

**RSVShop** - 호텔 예약 관리의 새로운 표준 🏨✨
