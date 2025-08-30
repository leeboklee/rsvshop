#!/bin/bash

# RSVShop 자동 복구 스크립트
# 서버와 데이터베이스 문제를 자동으로 진단하고 해결

echo "🔧 RSVShop 자동 복구 시작..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. PostgreSQL 상태 확인 및 시작
echo -e "${BLUE}📊 PostgreSQL 상태 확인 중...${NC}"
if ! sudo service postgresql status | grep -q "online"; then
    echo -e "${YELLOW}⚠️  PostgreSQL이 실행되지 않음. 시작 중...${NC}"
    sudo service postgresql start
    sleep 3
    
    if sudo service postgresql status | grep -q "online"; then
        echo -e "${GREEN}✅ PostgreSQL 시작 완료${NC}"
    else
        echo -e "${RED}❌ PostgreSQL 시작 실패${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ PostgreSQL 정상 실행 중${NC}"
fi

# 2. 포트 4900 상태 확인
echo -e "${BLUE}🔌 포트 4900 상태 확인 중...${NC}"
if ss -tlnp | grep -q ":4900"; then
    echo -e "${GREEN}✅ 포트 4900 사용 중${NC}"
    PORT_PID=$(ss -tlnp | grep ":4900" | awk '{print $7}' | cut -d',' -f1 | cut -d'=' -f2)
    echo -e "${BLUE}📋 프로세스 ID: $PORT_PID${NC}"
else
    echo -e "${YELLOW}⚠️  포트 4900이 사용되지 않음${NC}"
fi

# 3. Next.js 프로세스 확인
echo -e "${BLUE}🚀 Next.js 프로세스 확인 중...${NC}"
NEXT_PROCESSES=$(ps aux | grep -E "(next-server|next dev)" | grep -v grep)
if [ -n "$NEXT_PROCESSES" ]; then
    echo -e "${GREEN}✅ Next.js 프로세스 실행 중${NC}"
    echo "$NEXT_PROCESSES"
else
    echo -e "${YELLOW}⚠️  Next.js 프로세스가 실행되지 않음${NC}"
fi

# 4. 데이터베이스 연결 테스트 및 복구
echo -e "${BLUE}🗄️  데이터베이스 연결 테스트 및 복구 중...${NC}"
if bash ./scripts/check-db-connection.sh; then
    echo -e "${GREEN}✅ 데이터베이스 연결 정상${NC}"
else
    echo -e "${RED}❌ 데이터베이스 연결 복구 실패${NC}"
    echo -e "${YELLOW}⚠️  수동 확인이 필요합니다.${NC}"
fi

# 5. 서버 자동 시작 (필요시)
echo -e "${BLUE}🚀 서버 상태 확인 중...${NC}"
if ! ss -tlnp | grep -q ":4900"; then
    echo -e "${YELLOW}⚠️  서버가 실행되지 않음. 자동 시작 중...${NC}"
    echo -e "${BLUE}📝 백그라운드에서 서버 시작...${NC}"
    nohup npm run dev:simple > dev-server.log 2>&1 &
    SERVER_PID=$!
    echo -e "${GREEN}✅ 서버 시작됨 (PID: $SERVER_PID)${NC}"
    
    # 서버 시작 대기
    echo -e "${BLUE}⏳ 서버 시작 대기 중...${NC}"
    for i in {1..30}; do
        if ss -tlnp | grep -q ":4900"; then
            echo -e "${GREEN}✅ 서버가 포트 4900에서 정상 실행 중${NC}"
            break
        fi
        echo -n "."
        sleep 1
    done
    
    if ! ss -tlnp | grep -q ":4900"; then
        echo -e "${RED}❌ 서버 시작 실패${NC}"
    fi
else
    echo -e "${GREEN}✅ 서버가 정상 실행 중${NC}"
fi

# 6. 최종 상태 확인
echo -e "${BLUE}🔍 최종 상태 확인 중...${NC}"
echo -e "${BLUE}📊 PostgreSQL: $(sudo service postgresql status | grep -o 'online\|offline' || echo 'unknown')${NC}"
echo -e "${BLUE}🔌 포트 4900: $(ss -tlnp | grep -q ":4900" && echo '사용 중' || echo '사용 안함')${NC}"
echo -e "${BLUE}🚀 Next.js: $(ps aux | grep -q "next-server" && echo '실행 중' || echo '실행 안함')${NC}"

echo -e "${GREEN}🎉 자동 복구 완료!${NC}"
echo -e "${BLUE}🌐 http://localhost:4900 에서 서비스 확인 가능${NC}"
