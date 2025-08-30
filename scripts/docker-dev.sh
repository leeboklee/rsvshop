#!/bin/bash

# RSVShop Docker 개발 환경 관리 스크립트

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 포트 확인 함수
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_warning "포트 $port가 이미 사용 중입니다."
        return 1
    fi
    return 0
}

# 도커 상태 확인
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker가 실행되지 않았습니다. Docker를 시작해주세요."
        exit 1
    fi
}

# 개발 환경 시작
start_dev() {
    log_info "RSVShop 개발 환경을 시작합니다..."
    
    check_docker
    
    # 포트 확인
    if ! check_port 4900; then
        log_warning "포트 4900을 사용하는 프로세스를 종료합니다..."
        docker-compose -f docker-compose.dev.yml down
    fi
    
    if ! check_port 5432; then
        log_warning "포트 5432를 사용하는 프로세스를 종료합니다..."
        docker-compose -f docker-compose.dev.yml down
    fi
    
    # 컨테이너 빌드 및 시작
    log_info "컨테이너를 빌드하고 시작합니다..."
    docker-compose -f docker-compose.dev.yml up --build
    
    # 헬스체크 대기
    log_info "서비스가 준비될 때까지 대기 중..."
    sleep 10
    
    # 상태 확인
    if docker-compose -f docker-compose.dev.yml ps | grep -q "Up"; then
        log_success "개발 환경이 성공적으로 시작되었습니다!"
        log_info "애플리케이션: http://localhost:4900"
        log_info "데이터베이스: localhost:5432"
    else
        log_error "서비스 시작에 실패했습니다."
        docker-compose -f docker-compose.dev.yml logs
        exit 1
    fi
}

# 개발 환경 중지
stop_dev() {
    log_info "개발 환경을 중지합니다..."
    docker-compose -f docker-compose.dev.yml down
    log_success "개발 환경이 중지되었습니다."
}

# 개발 환경 재시작
restart_dev() {
    log_info "개발 환경을 재시작합니다..."
    stop_dev
    sleep 2
    start_dev
}

# 로그 확인
show_logs() {
    log_info "서비스 로그를 확인합니다..."
    docker-compose -f docker-compose.dev.yml logs -f
}

# 컨테이너 상태 확인
status() {
    log_info "서비스 상태를 확인합니다..."
    docker-compose -f docker-compose.dev.yml ps
}

# 컨테이너 내부 접속
exec_bash() {
    log_info "개발 컨테이너에 접속합니다..."
    docker-compose -f docker-compose.dev.yml exec rsvshop-dev sh
}

# 완전 초기화
clean() {
    log_warning "모든 컨테이너와 볼륨을 삭제합니다..."
    docker-compose -f docker-compose.dev.yml down -v
    docker system prune -f
    log_success "정리 완료"
}

# 도움말
show_help() {
    echo "RSVShop Docker 개발 환경 관리 스크립트"
    echo ""
    echo "사용법: $0 [명령어]"
    echo ""
    echo "명령어:"
    echo "  start     - 개발 환경 시작"
    echo "  stop      - 개발 환경 중지"
    echo "  restart   - 개발 환경 재시작"
    echo "  logs      - 로그 확인"
    echo "  status    - 상태 확인"
    echo "  exec      - 컨테이너 접속"
    echo "  clean     - 완전 초기화"
    echo "  help      - 도움말 표시"
    echo ""
}

# 메인 로직
case "${1:-help}" in
    start)
        start_dev
        ;;
    stop)
        stop_dev
        ;;
    restart)
        restart_dev
        ;;
    logs)
        show_logs
        ;;
    status)
        status
        ;;
    exec)
        exec_bash
        ;;
    clean)
        clean
        ;;
    help|*)
        show_help
        ;;
esac 