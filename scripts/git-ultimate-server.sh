#!/bin/bash
# RSVShop Git Bash 무적 브라우저 매니저
# Git Bash 기반 (taskkill 완전 보호)

echo "🛡️ RSVShop Git Bash 무적 브라우저 매니저를 시작합니다..."
echo "💡 이 스크립트는 taskkill /f /im node.exe에도 영향받지 않습니다!"

PORT=4900
APP_URL="http://localhost:4900"
ADMIN_URL="http://localhost:4900/admin"
CHECK_INTERVAL=3600  # 1시간으로 변경
BROWSER_OPENED=0

# 포트 사용 여부 확인 함수
check_port() {
    local port=$1
    if netstat -ano | grep -q ":$port "; then
        return 0  # 포트 사용 중
    else
        return 1  # 포트 사용 안함
    fi
}

# 브라우저 열기 함수
open_browser() {
    local url=$1
    echo "🌐 브라우저를 엽니다: $url"
    if command -v start >/dev/null 2>&1; then
        start "$url" 2>/dev/null
    elif command -v xdg-open >/dev/null 2>&1; then
        xdg-open "$url" 2>/dev/null
    elif command -v open >/dev/null 2>&1; then
        open "$url" 2>/dev/null
    else
        echo "❌ 브라우저 열기 실패: 지원하는 명령어가 없습니다"
        return 1
    fi
}

echo "📍 앱 URL: $APP_URL"
echo "📍 관리자 URL: $ADMIN_URL"
echo "💡 서버가 시작되면 자동으로 브라우저가 열립니다."
echo "💡 Ctrl+C로 종료할 수 있습니다."
echo "⏰ 체크 주기: ${CHECK_INTERVAL}초 (1시간)"

# 메인 모니터링 루프
while true; do
    echo ""
    echo "🔍 포트 $PORT 상태를 확인합니다..."
    
    if check_port $PORT; then
        if [ $BROWSER_OPENED -eq 0 ]; then
            echo "🚀 서버가 실행 중입니다. 브라우저를 엽니다..."
            if open_browser "$APP_URL"; then
                sleep 2
                open_browser "$ADMIN_URL"
                BROWSER_OPENED=1
                echo "✅ 브라우저가 열렸습니다!"
            fi
        fi
    else
        if [ $BROWSER_OPENED -eq 1 ]; then
            echo "📴 서버가 중단되었습니다. 브라우저를 다시 열 준비 중..."
            BROWSER_OPENED=0
        fi
    fi
    
    echo "💤 ${CHECK_INTERVAL}초 후 다시 확인합니다..."
    sleep $CHECK_INTERVAL
done 