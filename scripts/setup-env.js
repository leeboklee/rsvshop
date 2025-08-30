const fs = require('fs');
const path = require('path');

// 환경 변수 설정
const envContent = `# Database
DATABASE_URL="postgresql://username:password@localhost:5432/rsvshop"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:4900"

# Toss Payments
TOSS_PAYMENTS_SECRET_KEY="test_sk_D4yKeq5bgrpKRd0JYbLVGX0lzW6Y"
TOSS_PAYMENTS_CLIENT_KEY="test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq"

# Development
NODE_ENV="development"
PORT=4900

# Cursor Safety
CURSOR_SAFE_MODE=1
NODE_KILL_PROTECTION=1
`;

// .env 파일 생성
const envPath = path.join(__dirname, '..', '.env');
fs.writeFileSync(envPath, envContent);

console.log('✅ 환경 설정 파일이 생성되었습니다.');
console.log('📁 파일 위치:', envPath);
console.log('🔧 포트 설정: 4900');
console.log('🌐 서버 URL: http://localhost:4900'); 