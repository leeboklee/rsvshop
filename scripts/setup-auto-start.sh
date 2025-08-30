#!/bin/bash

# RSVShop 자동 시작 설정 스크립트

echo "🔧 RSVShop 자동 시작 설정 중..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. PostgreSQL 자동 시작 설정 (WSL 전용)
echo -e "${BLUE}📊 PostgreSQL 자동 시작 설정 중...${NC}"
echo -e "${YELLOW}⚠️  WSL 환경에서는 systemctl이 제한적입니다. 대안 방법을 사용합니다.${NC}"

# WSL 전용 PostgreSQL 자동 시작 설정
if [ -f /etc/wsl.conf ]; then
    echo -e "${BLUE}📋 WSL 설정 파일 확인됨${NC}"
    
    # wsl.conf에 PostgreSQL 자동 시작 설정 추가
    if ! grep -q "command.*postgresql" /etc/wsl.conf; then
        echo "" >> /etc/wsl.conf
        echo "# PostgreSQL 자동 시작" >> /etc/wsl.conf
        echo "[boot]" >> /etc/wsl.conf
        echo "command = sudo service postgresql start" >> /etc/wsl.conf
        echo -e "${GREEN}✅ WSL 설정에 PostgreSQL 자동 시작 추가 완료${NC}"
    else
        echo -e "${YELLOW}⚠️  WSL 설정에 이미 PostgreSQL 자동 시작이 있습니다${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  WSL 설정 파일을 찾을 수 없습니다${NC}"
fi

# systemctl 시도 (권한이 있다면)
if sudo systemctl enable postgresql 2>/dev/null; then
    echo -e "${GREEN}✅ systemctl PostgreSQL 자동 시작 설정 완료${NC}"
else
    echo -e "${BLUE}📝 systemctl 설정 실패 (정상적인 WSL 동작)${NC}"
fi

# 2. WSL 시작 스크립트 생성
echo -e "${BLUE}🚀 WSL 시작 스크립트 생성 중...${NC}"
cat > ~/.bashrc.rsvshop << 'EOF'
# RSVShop 자동 시작 설정
if [ -f ~/projects/rsvshop/scripts/check-db-connection.sh ]; then
    echo "🔍 RSVShop 데이터베이스 상태 확인 중..."
    cd ~/projects/rsvshop
    bash ./scripts/check-db-connection.sh > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ RSVShop 데이터베이스 정상"
    else
        echo "⚠️  RSVShop 데이터베이스 문제 감지됨"
    fi
fi
EOF

# 3. .bashrc에 추가
if ! grep -q "RSVShop 자동 시작 설정" ~/.bashrc; then
    echo "" >> ~/.bashrc
    echo "# RSVShop 자동 시작 설정" >> ~/.bashrc
    echo "source ~/.bashrc.rsvshop" >> ~/.bashrc
    echo -e "${GREEN}✅ .bashrc에 RSVShop 설정 추가 완료${NC}"
else
    echo -e "${YELLOW}⚠️  .bashrc에 이미 RSVShop 설정이 있습니다${NC}"
fi

# 4. cron 작업 설정 (선택사항)
echo -e "${BLUE}⏰ 정기 점검 cron 작업 설정 중...${NC}"
read -p "매일 자동으로 RSVShop 상태를 점검하시겠습니까? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # cron 작업 추가
    CRON_JOB="0 9 * * * cd ~/projects/rsvshop && bash ./scripts/check-db-connection.sh >> ~/rsvshop-daily-check.log 2>&1"
    
    if (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -; then
        echo -e "${GREEN}✅ 일일 점검 cron 작업 설정 완료 (매일 오전 9시)${NC}"
    else
        echo -e "${YELLOW}⚠️  cron 작업 설정 실패${NC}"
    fi
else
    echo -e "${BLUE}📝 cron 작업 설정을 건너뜁니다${NC}"
fi

# 5. 완료 메시지
echo -e "${GREEN}🎉 RSVShop 자동 시작 설정 완료!${NC}"
echo -e "${BLUE}📋 설정된 내용:${NC}"
echo -e "${BLUE}   - PostgreSQL 자동 시작${NC}"
echo -e "${BLUE}   - WSL 시작 시 데이터베이스 상태 확인${NC}"
echo -e "${BLUE}   - 정기 점검 cron 작업 (선택사항)${NC}"
echo ""
echo -e "${BLUE}🚀 이제 다음 명령어로 안전하게 서버를 시작할 수 있습니다:${NC}"
echo -e "${GREEN}   npm run start:safe${NC}"
echo -e "${GREEN}   npm run start:auto${NC}"
echo ""
echo -e "${BLUE}🔧 문제 발생 시 자동 복구:${NC}"
echo -e "${GREEN}   npm run fix:all${NC}"
echo -e "${GREEN}   npm run fix:db${NC}"
