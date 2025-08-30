#!/bin/bash

# RSVShop 오류 모니터링 스크립트
# 서버 로그와 브라우저 콘솔 로그를 실시간으로 모니터링

LOG_DIR="logs"
DEV_SERVER_LOG="dev-server.log"
CONSOLE_LOGS="console-logs.json"

echo "🚀 RSVShop 오류 모니터링 시작..."
echo "📁 로그 디렉토리: $LOG_DIR"
echo "🔍 모니터링 대상:"
echo "   - 서버 로그: $DEV_SERVER_LOG"
echo "   - 브라우저 콘솔: $CONSOLE_LOGS"
echo ""

# 로그 디렉토리 생성
mkdir -p "$LOG_DIR"

# 서버 로그 모니터링 (백그라운드)
echo "📡 서버 로그 모니터링 시작..."
tail -f "$DEV_SERVER_LOG" | grep -E "(POST|error|fail|exception|reservations|console-logs)" > "$LOG_DIR/server-errors.log" &
SERVER_MONITOR_PID=$!

# 콘솔 로그 모니터링 (백그라운드)
echo "📱 브라우저 콘솔 로그 모니터링 시작..."
if [ -f "$LOG_DIR/$CONSOLE_LOGS" ]; then
    tail -f "$LOG_DIR/$CONSOLE_LOGS" | jq -r '.logs[-1] | "\(.timestamp) [\(.type)] \(.message)"' 2>/dev/null > "$LOG_DIR/console-errors.log" &
    CONSOLE_MONITOR_PID=$!
else
    echo "⚠️  콘솔 로그 파일이 아직 생성되지 않았습니다."
    CONSOLE_MONITOR_PID=""
fi

# 실시간 오류 요약 (메인 프로세스)
echo "🎯 실시간 오류 요약 모니터링 시작..."
echo ""

while true; do
    clear
    echo "🕐 $(date '+%Y-%m-%d %H:%M:%S') - RSVShop 오류 모니터링"
    echo "=================================================="
    
    # 서버 오류 요약
    echo "📡 서버 오류 (최근 10개):"
    if [ -f "$LOG_DIR/server-errors.log" ]; then
        tail -10 "$LOG_DIR/server-errors.log" | while read line; do
            echo "   $line"
        done
    else
        echo "   로그 파일이 없습니다."
    fi
    
    echo ""
    
    # 콘솔 오류 요약
    echo "📱 브라우저 콘솔 오류 (최근 10개):"
    if [ -f "$LOG_DIR/console-errors.log" ]; then
        tail -10 "$LOG_DIR/console-errors.log" | while read line; do
            echo "   $line"
        done
    else
        echo "   로그 파일이 없습니다."
    fi
    
    echo ""
    echo "💡 제어: Ctrl+C로 종료"
    echo "🔄 5초마다 자동 새로고침..."
    
    sleep 5
done

# 정리 함수
cleanup() {
    echo ""
    echo "🛑 모니터링 종료 중..."
    
    if [ ! -z "$SERVER_MONITOR_PID" ]; then
        kill $SERVER_MONITOR_PID 2>/dev/null
        echo "✅ 서버 모니터링 종료"
    fi
    
    if [ ! -z "$CONSOLE_MONITOR_PID" ]; then
        kill $CONSOLE_MONITOR_PID 2>/dev/null
        echo "✅ 콘솔 모니터링 종료"
    fi
    
    echo "🎯 모니터링이 완전히 종료되었습니다."
    exit 0
}

# 시그널 핸들러 등록
trap cleanup SIGINT SIGTERM
