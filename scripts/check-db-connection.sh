#!/bin/bash

# 데이터베이스 연결 상태 확인 및 자동 복구 스크립트

DB_HOST="127.0.0.1"
DB_PORT="5432"
DB_NAME="rsvshop"
MAX_RETRIES=3
RETRY_DELAY=5

echo "🔍 데이터베이스 연결 상태 확인 중..."

# PostgreSQL 서비스 상태 확인
check_postgresql_service() {
    if sudo service postgresql status | grep -q "online"; then
        echo "✅ PostgreSQL 서비스 정상 실행 중"
        return 0
    else
        echo "❌ PostgreSQL 서비스 실행 안됨"
        return 1
    fi
}

# 데이터베이스 연결 테스트
test_db_connection() {
    echo "🗄️  데이터베이스 연결 테스트 중..."
    
    # Prisma를 통한 연결 테스트
    if npx prisma db push --accept-data-loss > /dev/null 2>&1; then
        echo "✅ 데이터베이스 연결 성공"
        return 0
    else
        echo "❌ 데이터베이스 연결 실패"
        return 1
    fi
}

# PostgreSQL 재시작
restart_postgresql() {
    echo "🔄 PostgreSQL 재시작 중..."
    sudo service postgresql restart
    sleep $RETRY_DELAY
}

# 메인 복구 로직
main() {
    local retry_count=0
    
    while [ $retry_count -lt $MAX_RETRIES ]; do
        echo "🔄 시도 $((retry_count + 1))/$MAX_RETRIES"
        
        # PostgreSQL 서비스 확인
        if check_postgresql_service; then
            # 데이터베이스 연결 테스트
            if test_db_connection; then
                echo "🎉 데이터베이스 연결 복구 완료!"
                return 0
            fi
        fi
        
        # PostgreSQL 재시작
        restart_postgresql
        
        retry_count=$((retry_count + 1))
        
        if [ $retry_count -lt $MAX_RETRIES ]; then
            echo "⏳ 다음 시도까지 대기 중... ($RETRY_DELAY초)"
            sleep $RETRY_DELAY
        fi
    done
    
    echo "💥 최대 재시도 횟수 초과. 수동 확인 필요."
    return 1
}

# 스크립트 실행
main
exit_code=$?

if [ $exit_code -eq 0 ]; then
    echo "✅ 데이터베이스 상태 정상"
    exit 0
else
    echo "❌ 데이터베이스 연결 실패"
    exit 1
fi
