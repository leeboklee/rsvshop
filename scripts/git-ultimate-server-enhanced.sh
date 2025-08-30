#!/bin/bash
# RSVShop Git Bash 무적 브라우저 매니저 (향상된 버전)
# 실시간 로깅 + 상태 모니터링 + 에러 추적 + 서버 자동 시작

echo "🛡️ RSVShop Git Bash 무적 브라우저 매니저 (향상된 버전)를 시작합니다..."
echo "💡 실시간 로깅 + 상태 모니터링 + 에러 추적 + 서버 자동 시작 기능 포함!"

PORT=4900
APP_URL="http://localhost:4900"
ADMIN_URL="http://localhost:4900/admin"
CHECK_INTERVAL=30  # 30초로 단축 (실시간 모니터링)
BROWSER_OPENED=0
SERVER_STARTED=0
MAX_RESTARTS=10
RESTART_COUNT=0

# 로그 파일 설정
LOG_DIR="logs"
LOG_FILE="$LOG_DIR/git-ultimate-server.log"
ERROR_LOG="$LOG_DIR/git-ultimate-server-error.log"
STATUS_LOG="$LOG_DIR/git-ultimate-server-status.log"

# 로그 디렉토리 생성
mkdir -p "$LOG_DIR"

# 로깅 함수
log_message() {
    local message="$1"
    local level="${2:-INFO}"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local log_entry="[${timestamp}] [${level}] ${message}"
    
    echo "$log_entry"
    echo "$log_entry" >> "$LOG_FILE"
}

log_error() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local error_entry="[${timestamp}] [ERROR] ${message}"
    
    echo "$error_entry" | tee -a "$ERROR_LOG"
    log_message "$message" "ERROR"
}

log_status() {
    local status="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[${timestamp}] ${status}" >> "$STATUS_LOG"
}

# 시작 로그
log_message "🛡️ Git Bash 무적서버 시작" "START"
log_message "📍 앱 URL: $APP_URL" "INFO"
log_message "📍 관리자 URL: $ADMIN_URL" "INFO"
log_message "⏰ 체크 주기: ${CHECK_INTERVAL}초" "INFO"
log_message "📁 로그 파일: $LOG_FILE" "INFO"
log_message "📁 에러 로그: $ERROR_LOG" "INFO"
log_message "📁 상태 로그: $STATUS_LOG" "INFO"

# 포트 사용 여부 확인 함수 (향상된 버전)
check_port() {
    local port=$1
    local result=1
    
    if netstat -ano | grep -q ":$port "; then
        result=0
        log_status "포트 $port: 사용 중"
    else
        log_status "포트 $port: 사용 안함"
    fi
    
    return $result
}

# Next.js 서버 시작 함수
start_nextjs_server() {
    if [ $SERVER_STARTED -eq 1 ]; then
        log_message "✅ 서버가 이미 시작되어 있습니다" "INFO"
        return 0
    fi
    
    if [ $RESTART_COUNT -ge $MAX_RESTARTS ]; then
        log_error "❌ 최대 재시작 횟수($MAX_RESTARTS)에 도달했습니다"
        return 1
    fi
    
    RESTART_COUNT=$((RESTART_COUNT + 1))
    log_message "🚀 Next.js 서버 시작 시도 #$RESTART_COUNT/$MAX_RESTARTS" "START"
    
    # 포트 충돌 해결
    if check_port $PORT; then
        log_message "🔧 포트 $PORT 충돌 해결 중..." "INFO"
        netstat -ano | grep ":$PORT " | awk '{print $5}' | xargs -r taskkill /F /PID
        sleep 2
    fi
    
        # Next.js 서버 포그라운드 시작 (백그라운드 실행 방지)
    log_message "🚀 Next.js 서버를 포그라운드에서 시작합니다..." "INFO"
    log_message "⚠️  백그라운드 실행이 비활성화되었습니다. Ctrl+C로 서버를 종료하세요." "WARNING"
    
    # 포그라운드 실행 (백그라운드 방지)
    npm run dev
    SERVER_STARTED=1
    RESTART_COUNT=0  # 성공 시 카운터 리셋
    
    # 서버 시작 대기
    sleep 5
    
    return 0
}

# 브라우저 열기 함수 (향상된 버전)
open_browser() {
    local url=$1
    local success=false
    
    log_message "🌐 브라우저 열기 시도: $url" "INFO"
    
    if command -v start >/dev/null 2>&1; then
        if start "$url" 2>/dev/null; then
            success=true
            log_message "✅ Windows start 명령어로 브라우저 열기 성공" "SUCCESS"
        else
            log_error "❌ Windows start 명령어로 브라우저 열기 실패"
        fi
    elif command -v xdg-open >/dev/null 2>&1; then
        if xdg-open "$url" 2>/dev/null; then
            success=true
            log_message "✅ xdg-open 명령어로 브라우저 열기 성공" "SUCCESS"
        else
            log_error "❌ xdg-open 명령어로 브라우저 열기 실패"
        fi
    elif command -v open >/dev/null 2>&1; then
        if open "$url" 2>/dev/null; then
            success=true
            log_message "✅ open 명령어로 브라우저 열기 성공" "SUCCESS"
        else
            log_error "❌ open 명령어로 브라우저 열기 실패"
        fi
    else
        log_error "❌ 지원하는 브라우저 열기 명령어가 없습니다"
    fi
    
    return $([ "$success" = true ] && echo 0 || echo 1)
}

# 시스템 상태 확인 함수
check_system_status() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local uptime=$(uptime 2>/dev/null || echo "N/A")
    local memory=$(free -h 2>/dev/null || echo "N/A")
    
    log_message "🖥️ 시스템 상태 확인" "STATUS"
    log_message "⏰ 현재 시간: $timestamp" "STATUS"
    log_message "🔄 시스템 가동시간: $uptime" "STATUS"
    log_message "💾 메모리 상태: $memory" "STATUS"
}

# 메인 모니터링 루프 (향상된 버전)
loop_count=0
while true; do
    loop_count=$((loop_count + 1))
    
    log_message "🔄 모니터링 루프 #$loop_count 시작" "LOOP"
    log_message "🔍 포트 $PORT 상태를 확인합니다..." "CHECK"
    
    # 포트 상태 확인
    if check_port $PORT; then
        if [ $BROWSER_OPENED -eq 0 ]; then
            log_message "🚀 서버가 실행 중입니다. 브라우저를 엽니다..." "SUCCESS"
            
            if open_browser "$APP_URL"; then
                sleep 2
                if open_browser "$ADMIN_URL"; then
                    BROWSER_OPENED=1
                    log_message "✅ 모든 브라우저가 성공적으로 열렸습니다!" "SUCCESS"
                    log_status "브라우저 상태: 열림"
                else
                    log_error "❌ 관리자 페이지 브라우저 열기 실패"
                fi
            else
                log_error "❌ 앱 페이지 브라우저 열기 실패"
            fi
        else
            log_message "✅ 브라우저가 이미 열려있습니다" "INFO"
        fi
    else
        if [ $BROWSER_OPENED -eq 1 ]; then
            log_message "📴 서버가 중단되었습니다. 브라우저를 다시 열 준비 중..." "WARN"
            BROWSER_OPENED=0
            SERVER_STARTED=0
            log_status "브라우저 상태: 닫힘"
        fi
        
        # 서버가 없으면 자동 시작
        if [ $SERVER_STARTED -eq 0 ]; then
            log_message "⏳ 서버가 없습니다. 자동으로 시작합니다..." "START"
            if start_nextjs_server; then
                log_message "✅ 서버 자동 시작 성공" "SUCCESS"
            else
                log_message "❌ 서버 자동 시작 실패" "ERROR"
            fi
        else
            log_message "⏳ 서버 대기 중..." "WAIT"
        fi
    fi
    
    # 주기적으로 시스템 상태 확인 (10번째 루프마다)
    if [ $((loop_count % 10)) -eq 0 ]; then
        check_system_status
    fi
    
    log_message "💤 ${CHECK_INTERVAL}초 후 다시 확인합니다... (루프 #$loop_count 완료)" "SLEEP"
    log_status "루프 완료: #$loop_count"
    
    sleep $CHECK_INTERVAL
done 