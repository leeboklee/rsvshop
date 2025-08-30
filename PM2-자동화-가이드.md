# 🚀 RSVShop PM2 자동화 가이드

## ✅ 현재 설정 완료 상태
- **PM2 설치**: 완료
- **자동 시작 설정**: 완료
- **시스템 부팅 시 자동 실행**: 완료
- **포트 4900**: 정상 실행 중

## 📋 PM2 관리 명령어

### 🟢 서버 상태 확인
```bash
pm2 status          # 현재 실행 중인 프로세스 상태
pm2 logs RSVShop    # 실시간 로그 확인
pm2 monit           # 실시간 모니터링 대시보드
```

### 🔄 서버 제어
```bash
pm2 restart RSVShop     # 서버 재시작
pm2 stop RSVShop        # 서버 중지
pm2 start RSVShop       # 서버 시작
pm2 delete RSVShop      # 서버 프로세스 삭제
```

### 🚀 새로운 설정으로 시작
```bash
pm2 start ecosystem.config.js    # 설정 파일로 시작
pm2 reload RSVShop               # 무중단 재시작
```

### 💾 설정 저장 및 복원
```bash
pm2 save              # 현재 설정 저장
pm2 resurrect         # 저장된 설정 복원
pm2 startup           # 시스템 부팅 시 자동 시작 설정
```

## 🔧 자동화 기능

### 1. **자동 재시작**
- 서버가 충돌하면 자동으로 재시작
- 메모리 사용량이 1GB 초과 시 자동 재시작
- 최대 10회까지 재시작 시도

### 2. **로그 관리**
- 에러 로그: `./logs/pm2-error.log`
- 출력 로그: `./logs/pm2-out.log`
- 통합 로그: `./logs/pm2-combined.log`

### 3. **시스템 부팅 시 자동 시작**
- WSL 재시작 시 자동으로 RSVShop 서버 시작
- 수동으로 `npm run dev` 실행 불필요

## 🎯 사용 시나리오

### 📱 **일상적인 개발**
```bash
# 서버 상태만 확인
pm2 status

# 로그 확인
pm2 logs RSVShop --lines 20
```

### 🔄 **코드 업데이트 후**
```bash
# 무중단 재시작 (권장)
pm2 reload RSVShop

# 또는 일반 재시작
pm2 restart RSVShop
```

### 🚨 **문제 발생 시**
```bash
# 서버 강제 재시작
pm2 delete RSVShop
pm2 start ecosystem.config.js
```

## ⚠️ 주의사항

1. **포트 4900**: RSVShop 전용 포트
2. **데이터베이스**: PostgreSQL 연결 필요 (포트 5432)
3. **메모리 제한**: 1GB 초과 시 자동 재시작
4. **로그 파일**: `./logs/` 폴더에 저장됨

## 🎉 이제 할 일

✅ **PM2 설정 완료** - 더 이상 `npm run dev` 수동 실행 불필요!
✅ **자동 재시작** - 서버 충돌 시 자동 복구
✅ **부팅 시 자동 시작** - WSL 재시작 후에도 자동 실행

**RSVShop 서버가 포트 4900에서 자동으로 실행되고 있습니다!** 🚀
