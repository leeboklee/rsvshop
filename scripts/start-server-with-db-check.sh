#!/bin/bash

# 서버 시작 전 데이터베이스 연결 확인 및 자동 복구 스크립트

echo "🚀 RSVShop 서버 시작 준비 중..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. PostgreSQL 자동 시작 확인
echo -e "${BLUE}📊 PostgreSQL 자동 시작 확인 중...${NC}"
if ! sudo service postgresql status | grep -q "online"; then
    echo -e "${YELLOW}⚠️  PostgreSQL이 실행되지 않음. 자동 시작 중...${NC}"
    sudo service postgresql start
    sleep 3
    
    if sudo service postgresql status | grep -q "online"; then
        echo -e "${GREEN}✅ PostgreSQL 자동 시작 완료${NC}"
    else
        echo -e "${RED}❌ PostgreSQL 자동 시작 실패${NC}"
        echo -e "${YELLOW}🔄 수동으로 PostgreSQL을 시작해주세요: sudo service postgresql start${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ PostgreSQL 정상 실행 중${NC}"
fi

# 2. 데이터베이스 연결 확인 및 복구
echo -e "${BLUE}🗄️  데이터베이스 연결 확인 중...${NC}"
if ! bash ./scripts/check-db-connection.sh; then
    echo -e "${RED}❌ 데이터베이스 연결 복구 실패${NC}"
    echo -e "${YELLOW}🔄 수동으로 데이터베이스를 확인해주세요${NC}"
    exit 1
fi

# 3. 포트 4900 충돌 확인 및 해결
echo -e "${BLUE}🔌 포트 4900 충돌 확인 중...${NC}"
if ss -tlnp | grep -q ":4900"; then
    echo -e "${YELLOW}⚠️  포트 4900이 이미 사용 중입니다. 기존 프로세스를 종료합니다.${NC}"
    PORT_PID=$(ss -tlnp | grep ":4900" | awk '{print $7}' | cut -d',' -f1 | cut -d'=' -f2)
    echo -e "${BLUE}📋 종료할 프로세스 ID: $PORT_PID${NC}"
    
    if kill -9 $PORT_PID 2>/dev/null; then
        echo -e "${GREEN}✅ 기존 프로세스 종료 완료${NC}"
        sleep 2
    else
        echo -e "${RED}❌ 프로세스 종료 실패${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ 포트 4900 사용 가능${NC}"
fi

# 4. 서버 시작
echo -e "${BLUE}🚀 서버 시작 중...${NC}"
echo -e "${BLUE}📝 백그라운드에서 서버 시작...${NC}"

# 서버 시작
nohup npm run dev:simple > dev-server.log 2>&1 &
SERVER_PID=$!
echo -e "${GREEN}✅ 서버 시작됨 (PID: $SERVER_PID)${NC}"

# 5. 서버 시작 대기 및 확인
echo -e "${BLUE}⏳ 서버 시작 대기 중...${NC}"
for i in {1..30}; do
    if ss -tlnp | grep -q ":4900"; then
        echo -e "${GREEN}✅ 서버가 포트 4900에서 정상 실행 중${NC}"
        
        # 서버 응답 테스트
        echo -e "${BLUE}🔍 서버 응답 테스트 중...${NC}"
        if curl -s http://localhost:4900 > /dev/null 2>&1; then
            echo -e "${GREEN}✅ 서버 응답 정상${NC}"
            echo -e "${GREEN}🎉 RSVShop 서버 시작 완료!${NC}"
            echo -e "${BLUE}🌐 http://localhost:4900 에서 서비스 확인 가능${NC}"
            echo -e "${BLUE}📋 서버 PID: $SERVER_PID${NC}"
            echo -e "${BLUE}📝 로그 파일: dev-server.log${NC}"
            exit 0
        else
            echo -e "${YELLOW}⚠️  서버는 실행 중이지만 응답이 없습니다. 잠시 더 기다립니다...${NC}"
        fi
        break
    fi
    echo -n "."
    sleep 1
done

if ! ss -tlnp | grep -q ":4900"; then
    echo -e "${RED}❌ 서버 시작 실패${NC}"
    echo -e "${BLUE}📝 로그 확인: tail -f dev-server.log${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 RSVShop 서버 시작 완료!${NC}"
echo -e "${BLUE}🌐 http://localhost:4900 에서 서비스 확인 가능${NC}"
