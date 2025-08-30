# PostgreSQL 마이그레이션 가이드

## 개요

RSVShop 프로젝트에서 SQLite를 PostgreSQL로 완전히 마이그레이션했습니다. 이제 모든 관리 페이지에서 PostgreSQL만 사용합니다.

## 주요 변경사항

### 1. 데이터베이스 설정
- **이전**: SQLite + PostgreSQL 선택 가능
- **현재**: PostgreSQL만 지원
- **이유**: 안정성, 성능, 확장성 향상

### 2. 제거된 기능
- SQLite 데이터베이스 전환 옵션
- SQLite 관련 UI 컴포넌트
- SQLite 데이터베이스 파일 관리

### 3. 개선된 기능
- PostgreSQL 전용 데이터베이스 헬스 체크
- 향상된 오류 메시지 및 해결 방법
- 안정적인 데이터베이스 연결

## 설정 방법

### WSL2/Linux 환경
```bash
# 스크립트 실행 권한 부여
chmod +x scripts/setup-postgresql.sh

# PostgreSQL 설정 실행
./scripts/setup-postgresql.sh
```

### Windows 환경
```cmd
# PostgreSQL 설정 실행
scripts\setup-postgresql.bat
```

### 수동 설정
1. PostgreSQL 서비스 시작
   ```bash
   sudo service postgresql start
   ```

2. 데이터베이스 생성
   ```bash
   sudo -u postgres createdb rsvshop
   ```

3. 환경 변수 설정 (.env 파일)
   ```
   DATABASE_URL="postgresql://postgres:qhraksgdl07@localhost:5432/rsvshop"
   NODE_ENV="development"
   ```

4. Prisma 설정
   ```bash
   npx prisma generate
   npx prisma db push
   ```

## 데이터베이스 상태 확인

### 웹 인터페이스
- 관리자 페이지 → 예약 관리 → 데이터베이스 상태 카드 클릭
- 현재 연결 상태 및 통계 정보 확인

### API 엔드포인트
```bash
# 데이터베이스 상태 확인
curl http://localhost:4900/api/health/db

# 응답 예시
{
  "status": "connected",
  "message": "PostgreSQL 데이터베이스 연결 성공",
  "dbType": "postgresql",
  "data": {
    "roomCount": 5,
    "packageCount": 12,
    "bookingCount": 25,
    "databaseUrl": "postgresql://***:***@localhost:5432/rsvshop"
  }
}
```

## 문제 해결

### 1. PostgreSQL 서비스가 시작되지 않는 경우
```bash
# 서비스 상태 확인
sudo service postgresql status

# 서비스 시작
sudo service postgresql start

# 로그 확인
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### 2. 데이터베이스 연결 실패
```bash
# PostgreSQL 프로세스 확인
ps aux | grep postgres

# 포트 확인
sudo netstat -tlnp | grep 5432

# PostgreSQL 재시작
sudo service postgresql restart
```

### 3. 권한 문제
```bash
# PostgreSQL 사용자 확인
sudo -u postgres psql -c "\du"

# 데이터베이스 권한 확인
sudo -u postgres psql -c "\l"
```

## 성능 최적화

### 1. PostgreSQL 설정
```bash
# postgresql.conf 최적화
sudo nano /etc/postgresql/*/main/postgresql.conf

# 주요 설정
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
```

### 2. 인덱스 최적화
```sql
-- 자주 사용되는 쿼리에 대한 인덱스 생성
CREATE INDEX idx_booking_dates ON booking(check_in_date, check_out_date);
CREATE INDEX idx_booking_status ON booking(status);
CREATE INDEX idx_room_name ON room(name);
```

## 백업 및 복구

### 1. 데이터베이스 백업
```bash
# 전체 데이터베이스 백업
pg_dump -U postgres -h localhost rsvshop > backup_$(date +%Y%m%d_%H%M%S).sql

# 특정 테이블만 백업
pg_dump -U postgres -h localhost -t booking rsvshop > booking_backup.sql
```

### 2. 데이터베이스 복구
```bash
# 백업에서 복구
psql -U postgres -h localhost rsvshop < backup_file.sql
```

## 모니터링

### 1. 성능 모니터링
```sql
-- 활성 연결 수 확인
SELECT count(*) FROM pg_stat_activity;

-- 느린 쿼리 확인
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

### 2. 로그 모니터링
```bash
# PostgreSQL 로그 실시간 확인
sudo tail -f /var/log/postgresql/postgresql-*.log

# 오류 로그만 확인
sudo grep ERROR /var/log/postgresql/postgresql-*.log
```

## 결론

PostgreSQL 마이그레이션을 통해 다음과 같은 이점을 얻었습니다:

1. **안정성**: 엔터프라이즈급 데이터베이스의 안정성
2. **성능**: 대용량 데이터 처리 성능 향상
3. **확장성**: 수평/수직 확장 가능
4. **기능**: 고급 SQL 기능 및 트랜잭션 지원
5. **유지보수**: 표준화된 데이터베이스 관리

SQLite는 더 이상 지원되지 않으며, 모든 새로운 기능은 PostgreSQL을 기반으로 개발됩니다.
