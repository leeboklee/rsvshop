#!/bin/bash

# RSVShop 성능 모니터링 스크립트
# 페이지 로드 속도 및 서버 성능 모니터링

echo "📊 RSVShop 성능 모니터링 시작..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 성능 체크 함수
check_server_status() {
    echo -e "${BLUE}🔍 서버 상태 확인 중...${NC}"
    
    if curl -s http://localhost:4900 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 서버가 정상적으로 실행 중입니다${NC}"
        return 0
    else
        echo -e "${RED}❌ 서버가 실행되지 않았습니다${NC}"
        return 1
    fi
}

check_response_time() {
    echo -e "${BLUE}⏱️  응답 시간 측정 중...${NC}"
    
    local start_time=$(date +%s%N)
    local response=$(curl -s -w "%{http_code}" http://localhost:4900 -o /dev/null)
    local end_time=$(date +%s%N)
    
    local duration=$(( (end_time - start_time) / 1000000 ))
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ 응답 시간: ${duration}ms${NC}"
    else
        echo -e "${RED}❌ 응답 오류: HTTP $response${NC}"
    fi
    
    return $duration
}

check_memory_usage() {
    echo -e "${BLUE}💾 메모리 사용량 확인 중...${NC}"
    
    local node_processes=$(ps aux | grep "next-server" | grep -v grep)
    if [ -n "$node_processes" ]; then
        local memory=$(echo "$node_processes" | awk '{print $6}')
        local memory_mb=$((memory / 1024))
        echo -e "${GREEN}✅ 메모리 사용량: ${memory_mb}MB${NC}"
    else
        echo -e "${YELLOW}⚠️  Node.js 프로세스를 찾을 수 없습니다${NC}"
    fi
}

check_port_usage() {
    echo -e "${BLUE}🌐 포트 사용량 확인 중...${NC}"
    
    local ports=$(ss -tlnp | grep -E ":4900|:4901" | head -5)
    if [ -n "$ports" ]; then
        echo -e "${GREEN}✅ 활성 포트:${NC}"
        echo "$ports"
    else
        echo -e "${YELLOW}⚠️  활성 포트가 없습니다${NC}"
    fi
}

check_cache_status() {
    echo -e "${BLUE}🗂️  캐시 상태 확인 중...${NC}"
    
    if [ -d ".next/cache" ]; then
        local cache_size=$(du -sh .next/cache 2>/dev/null | cut -f1)
        echo -e "${GREEN}✅ Next.js 캐시 크기: ${cache_size}${NC}"
    else
        echo -e "${YELLOW}⚠️  Next.js 캐시가 없습니다${NC}"
    fi
    
    if [ -d "node_modules/.cache" ]; then
        local node_cache_size=$(du -sh node_modules/.cache 2>/dev/null | cut -f1)
        echo -e "${GREEN}✅ Node.js 캐시 크기: ${node_cache_size}${NC}"
    else
        echo -e "${YELLOW}⚠️  Node.js 캐시가 없습니다${NC}"
    fi
}

performance_test() {
    echo -e "${BLUE}🧪 성능 테스트 실행 중...${NC}"
    
    local total_time=0
    local test_count=5
    
    for i in {1..5}; do
        echo -n "테스트 $i/5: "
        local start_time=$(date +%s%N)
        curl -s http://localhost:4900 > /dev/null 2>&1
        local end_time=$(date +%s%N)
        local duration=$(( (end_time - start_time) / 1000000 ))
        total_time=$((total_time + duration))
        echo -e "${GREEN}${duration}ms${NC}"
        sleep 0.5
    done
    
    local avg_time=$((total_time / test_count))
    echo -e "${BLUE}📊 평균 응답 시간: ${avg_time}ms${NC}"
    
    if [ $avg_time -lt 100 ]; then
        echo -e "${GREEN}🎉 성능이 매우 좋습니다!${NC}"
    elif [ $avg_time -lt 300 ]; then
        echo -e "${GREEN}✅ 성능이 양호합니다${NC}"
    elif [ $avg_time -lt 500 ]; then
        echo -e "${YELLOW}⚠️  성능이 보통입니다${NC}"
    else
        echo -e "${RED}❌ 성능이 느립니다${NC}"
    fi
}

show_optimization_tips() {
    echo -e "${BLUE}💡 성능 최적화 팁:${NC}"
    echo "1. 빠른 개발 서버 시작: ./start-fast-dev.sh"
    echo "2. 캐시 정리: npm run clean"
    echo "3. 메모리 제한 설정: NODE_OPTIONS='--max-old-space-size=1024'"
    echo "4. 소스맵 비활성화: NEXT_DEV_SOURCEMAP=false"
    echo "5. 빠른 새로고침: NEXT_DEV_FAST_REFRESH=true"
}

# 메인 실행
main() {
    echo "=================================="
    echo "🚀 RSVShop 성능 모니터링"
    echo "=================================="
    
    check_server_status
    if [ $? -eq 0 ]; then
        check_response_time
        check_memory_usage
        check_port_usage
        check_cache_status
        echo ""
        performance_test
    else
        echo -e "${RED}❌ 서버가 실행되지 않아 성능 테스트를 건너뜁니다${NC}"
    fi
    
    echo ""
    show_optimization_tips
    echo ""
    echo "=================================="
}

# 스크립트 실행
main "$@"
