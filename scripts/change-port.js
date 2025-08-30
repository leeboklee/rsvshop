const fs = require('fs');
const path = require('path');

// 포트 변경 스크립트
function changePort(newPort) {
  console.log(`🔄 포트를 ${newPort}로 변경 중...\n`);
  
  // 1. 환경 변수 파일 업데이트
  const envPath = path.join(__dirname, '..', '.env');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // PORT 설정 추가/업데이트
  if (envContent.includes('PORT=')) {
    envContent = envContent.replace(/PORT=\d+/, `PORT=${newPort}`);
  } else {
    envContent += `\nPORT=${newPort}`;
  }
  
  // NEXTAUTH_URL 업데이트
  if (envContent.includes('NEXTAUTH_URL=')) {
    envContent = envContent.replace(/NEXTAUTH_URL="http:\/\/localhost:\d+"/, `NEXTAUTH_URL="http://localhost:${newPort}"`);
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log(`✅ .env 파일 업데이트 완료 (포트: ${newPort})`);
  
  // 2. 포트 설정 파일 업데이트
  const configPath = path.join(__dirname, '..', 'config', 'port-config.js');
  const configContent = `// 포트 설정 중앙 관리
const PORT_CONFIG = {
  // 기본 포트 설정
  SERVER_PORT: process.env.PORT || ${newPort},
  API_PORT: process.env.API_PORT || ${newPort},
  TEST_PORT: process.env.TEST_PORT || ${newPort},
  
  // 브라우저 설정
  BROWSER_URL: \`http://localhost:\${process.env.PORT || ${newPort}}\`,
  
  // API 엔드포인트
  API_BASE_URL: \`http://localhost:\${process.env.PORT || ${newPort}}/api\`,
  
  // 테스트 URL
  TEST_BASE_URL: \`http://localhost:\${process.env.PORT || ${newPort}}\`,
  
  // 환경별 설정
  getUrl: (path = '') => {
    const baseUrl = \`http://localhost:\${process.env.PORT || ${newPort}}\`;
    return path ? \`\${baseUrl}\${path}\` : baseUrl;
  },
  
  getApiUrl: (endpoint = '') => {
    const baseUrl = \`http://localhost:\${process.env.PORT || ${newPort}}/api\`;
    return endpoint ? \`\${baseUrl}\${endpoint}\` : baseUrl;
  }
};

module.exports = PORT_CONFIG;
`;
  
  fs.writeFileSync(configPath, configContent);
  console.log(`✅ 포트 설정 파일 업데이트 완료 (포트: ${newPort})`);
  
  // 3. package.json 스크립트 업데이트 (필요시)
  const packagePath = path.join(__dirname, '..', 'package.json');
  if (fs.existsSync(packagePath)) {
    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // dev 스크립트에 포트 설정 추가
    if (packageContent.scripts && packageContent.scripts.dev) {
      packageContent.scripts.dev = `PORT=${newPort} node scripts/enhanced-error-monitor.js`;
    }
    
    fs.writeFileSync(packagePath, JSON.stringify(packageContent, null, 2));
    console.log(`✅ package.json 업데이트 완료 (포트: ${newPort})`);
  }
  
  console.log(`\n🎉 포트 변경 완료!`);
  console.log(`📋 변경된 포트: ${newPort}`);
  console.log(`🌐 서버 URL: http://localhost:${newPort}`);
  console.log(`🔧 다음 명령어로 서버를 시작하세요: npm run dev`);
}

// 명령행 인수 처리
const newPort = process.argv[2];

if (!newPort) {
  console.log('❌ 사용법: node scripts/change-port.js <새포트번호>');
  console.log('💡 예시: node scripts/change-port.js 3000');
  process.exit(1);
}

if (isNaN(newPort) || newPort < 1 || newPort > 65535) {
  console.log('❌ 유효하지 않은 포트 번호입니다. (1-65535)');
  process.exit(1);
}

changePort(parseInt(newPort)); 