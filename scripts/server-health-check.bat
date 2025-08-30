@echo off
:: 무적서버 자동 상태 확인 및 복구
echo 🔍 무적서버 상태 자동 점검 시작...

:: Docker 컨테이너 상태 확인
echo [1단계] Docker 컨테이너 상태 확인...
docker-compose -f docker-compose.dev.yml ps

:: 포트 4900 상태 확인
echo [2단계] 포트 4900 상태 확인...
netstat -ano | findstr :4900
if errorlevel 1 (
    echo ❌ 포트 4900에서 서버가 실행되지 않음
    goto restart_server
) else (
    echo ✅ 포트 4900에서 서버 실행 중
)

:: API 헬스체크
echo [3단계] API 헬스체크...
curl -f http://localhost:4900/api/health
if errorlevel 1 (
    echo ❌ API 응답 없음 - 서버 재시작 필요
    goto restart_server
) else (
    echo ✅ API 정상 응답
)

:: Admin 페이지 접근 테스트
echo [4단계] Admin 페이지 접근 테스트...
curl -f http://localhost:4900/admin
if errorlevel 1 (
    echo ❌ Admin 페이지 접근 불가
    goto restart_server
) else (
    echo ✅ Admin 페이지 접근 가능
    echo 🎉 모든 상태 정상! http://localhost:4900/admin
    goto end
)

:restart_server
echo 🔧 서버 자동 복구 시작...

:: 기존 컨테이너 정리
echo [복구 1단계] 기존 컨테이너 정리...
docker-compose -f docker-compose.dev.yml down

:: 이미지 재빌드 및 시작
echo [복구 2단계] 컨테이너 재빌드 및 시작...
docker-compose -f docker-compose.dev.yml up --build -d

:: 시작 대기
echo [복구 3단계] 서버 시작 대기 중... (30초)
ping -n 31 127.0.0.1 >nul

:: 재확인
echo [복구 4단계] 복구 상태 재확인...
curl -f http://localhost:4900/admin
if errorlevel 1 (
    echo ❌ 복구 실패 - 로그 확인 필요
    echo 📋 컨테이너 로그:
    docker-compose -f docker-compose.dev.yml logs --tail=20 rsvshop-dev
) else (
    echo ✅ 복구 성공! http://localhost:4900/admin
)

:end
echo 📊 최종 상태:
docker-compose -f docker-compose.dev.yml ps
pause
