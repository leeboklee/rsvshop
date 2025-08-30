#!/bin/bash
# Git Bash 무적서버 실시간 모니터링 도구
# 별도 터미널에서 실행하여 서버 상태를 실시간으로 확인

echo "📊 Git Bash 무적서버 실시간 모니터링을 시작합니다..."
echo "💡 이 도구는 별도 터미널에서 실행하여 서버 상태를 실시간으로 확인합니다"

# 로그 파일 경로
LOG_FILE="logs/git-ultimate-server.log"
ERROR_LOG="logs/git-ultimate-server-error.log"
STATUS_LOG="logs/git-ultimate-server-status.log"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 상태 확인 함수
check_server_status() {
    local port=4900
    
    # 포트 상태 확인
    if netstat -ano | grep -q ":$port "; then
        echo -e "${GREEN}✅ 포트 $port: 서버 실행 중${NC}"
        return 0
    else
        echo -e "${RED}❌ 포트 $port: 서버 중단됨${NC}"
        return 1
    fi
}

# 프로세스 상태 확인
check_process_status() {
    local bash_count=$(tasklist | findstr bash | wc -l)
    echo -e "${BLUE}🖥️ 실행 중인 bash.exe 프로세스: $bash_count개${NC}"
    
    if [ $bash_count -gt 0 ]; then
        echo -e "${GREEN}✅ Git Bash 프로세스 정상 실행 중${NC}"
        return 0
    else
        echo -e "${RED}❌ Git Bash 프로세스 없음${NC}"
        return 1
    fi
}

# 로그 파일 모니터링
monitor_logs() {
    echo -e "${CYAN}📋 로그 파일 모니터링:${NC}"
    
    if [ -f "$LOG_FILE" ]; then
        local log_size=$(wc -l < "$LOG_FILE" 2>/dev/null || echo "0")
        echo -e "${GREEN}📄 메인 로그: $log_size줄${NC}"
        
        # 최근 5줄 표시
        echo -e "${YELLOW}📝 최근 로그 (최대 5줄):${NC}"
        tail -n 5 "$LOG_FILE" 2>/dev/null | while read line; do
            echo -e "  $line"
        done
    else
        echo -e "${RED}❌ 로그 파일 없음: $LOG_FILE${NC}"
    fi
    
    if [ -f "$ERROR_LOG" ]; then
        local error_count=$(wc -l < "$ERROR_LOG" 2>/dev/null || echo "0")
        echo -e "${RED}🚨 에러 로그: $error_count개${NC}"
        
        if [ $error_count -gt 0 ]; then
            echo -e "${YELLOW}⚠️ 최근 에러 (최대 3개):${NC}"
            tail -n 3 "$ERROR_LOG" 2>/dev/null | while read line; do
                echo -e "  $line"
            done
        fi
    fi
}

# 실시간 모니터링 루프
monitor_loop() {
    local loop_count=0
    local check_interval=7200  # 2시간마다 체크
    
    echo -e "${PURPLE}🔄 실시간 모니터링 시작 (${check_interval}초 간격)${NC}"
    echo -e "${YELLOW}💡 Ctrl+C로 종료할 수 있습니다${NC}"
    echo ""
    
    while true; do
        loop_count=$((loop_count + 1))
        local timestamp=$(date '+%H:%M:%S')
        
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BLUE}🕐 [$timestamp] 모니터링 #$loop_count${NC}"
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        
        # 서버 상태 확인
        check_server_status
        
        # 프로세스 상태 확인
        check_process_status
        
        # 로그 모니터링
        monitor_logs
        
        echo ""
        echo -e "${YELLOW}⏳ ${check_interval}초 후 다시 확인...${NC}"
        echo ""
        
        sleep $check_interval
    done
}

# 대화형 모드
interactive_mode() {
    echo -e "${CYAN}🎮 대화형 모드${NC}"
    echo -e "${YELLOW}사용 가능한 명령어:${NC}"
    echo -e "  ${GREEN}status${NC} - 현재 상태 확인"
    echo -e "  ${GREEN}logs${NC} - 로그 파일 보기"
    echo -e "  ${GREEN}errors${NC} - 에러 로그 보기"
    echo -e "  ${GREEN}monitor${NC} - 실시간 모니터링 시작"
    echo -e "  ${GREEN}quit${NC} - 종료"
    echo ""
    
    while true; do
        echo -n -e "${BLUE}명령어 입력: ${NC}"
        read -r command
        
        case $command in
            "status")
                echo -e "${CYAN}📊 현재 상태 확인:${NC}"
                check_server_status
                check_process_status
                ;;
            "logs")
                echo -e "${CYAN}📋 로그 파일 내용:${NC}"
                if [ -f "$LOG_FILE" ]; then
                    cat "$LOG_FILE"
                else
                    echo -e "${RED}❌ 로그 파일 없음${NC}"
                fi
                ;;
            "errors")
                echo -e "${CYAN}🚨 에러 로그 내용:${NC}"
                if [ -f "$ERROR_LOG" ]; then
                    cat "$ERROR_LOG"
                else
                    echo -e "${RED}❌ 에러 로그 없음${NC}"
                fi
                ;;
            "monitor")
                monitor_loop
                ;;
            "quit"|"exit")
                echo -e "${GREEN}👋 모니터링을 종료합니다${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}❌ 알 수 없는 명령어: $command${NC}"
                ;;
        esac
        echo ""
    done
}

# 메인 실행
if [ "$1" = "monitor" ]; then
    monitor_loop
elif [ "$1" = "status" ]; then
    echo -e "${CYAN}📊 현재 상태 확인:${NC}"
    check_server_status
    check_process_status
    monitor_logs
elif [ "$1" = "interactive" ] || [ -z "$1" ]; then
    interactive_mode
else
    echo -e "${RED}❌ 사용법: $0 [monitor|status|interactive]${NC}"
    echo -e "${YELLOW}  monitor: 실시간 모니터링${NC}"
    echo -e "${YELLOW}  status: 현재 상태 확인${NC}"
    echo -e "${YELLOW}  interactive: 대화형 모드 (기본값)${NC}"
    exit 1
fi 