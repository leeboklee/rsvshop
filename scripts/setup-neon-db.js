const https = require('https');
const { execSync } = require('child_process');

// Neon API 키 (환경 변수에서 가져오거나 직접 입력)
const NEON_API_KEY = process.env.NEON_API_KEY;
const PROJECT_NAME = 'rsvshop-db';

if (!NEON_API_KEY) {
  console.error('NEON_API_KEY 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const options = {
  hostname: 'console.neon.tech',
  path: '/api/v2/projects',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${NEON_API_KEY}`,
    'Content-Type': 'application/json',
  },
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    if (res.statusCode >= 400) {
      console.error(`Error: ${res.statusCode}`);
      console.error(data);
      return;
    }
    const project = JSON.parse(data);
    const dbInfo = project.databases[0];
    const roleInfo = project.roles[0];
    const host = project.endpoints[0].host;

    const dbUrl = `postgresql://${roleInfo.name}:${roleInfo.password}@${host}/${dbInfo.name}?sslmode=require`;

    console.log('Neon DB 생성 성공!');
    console.log('DATABASE_URL:', dbUrl);
    
    // 이 URL을 사용하여 next.config.js를 업데이트하거나 .env 파일에 저장하세요.
    // 예: fs.writeFileSync('.env', `DATABASE_URL=${dbUrl}`);
  });
});

req.on('error', (error) => {
  console.error(error);
});

const postData = JSON.stringify({
  project: {
    name: PROJECT_NAME,
  },
});

req.write(postData);
req.end(); 