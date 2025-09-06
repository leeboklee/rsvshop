#!/usr/bin/env node

/**
 * Cursor IDE AI용 MCP 설정 스크립트
 * 필요한 MCP 도구들을 자동으로 설치하고 설정합니다.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Cursor IDE AI용 MCP 설정 시작...');

// 1. 필요한 MCP 패키지 설치
const mcpPackages = [
  '@modelcontextprotocol/server-filesystem',
  '@modelcontextprotocol/server-git',
  '@modelcontextprotocol/server-brave-search',
  '@modelcontextprotocol/server-postgres',
  '@modelcontextprotocol/server-sqlite',
  'mcp-server-vercel',
  'mcp-server-neon'
];

console.log('📦 MCP 패키지 설치 중...');
try {
  mcpPackages.forEach(pkg => {
    console.log(`  - ${pkg} 설치 중...`);
    execSync(`npm install ${pkg}`, { stdio: 'inherit' });
  });
  console.log('✅ MCP 패키지 설치 완료!');
} catch (error) {
  console.log('⚠️  일부 패키지 설치 실패 (선택적 패키지일 수 있음)');
}

// 2. Cursor IDE용 MCP 설정 파일 생성
const cursorMcpConfig = {
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-filesystem", "/"],
      "enabled": true,
      "description": "파일 시스템 접근"
    },
    "git": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-git", "--repository", "."],
      "enabled": true,
      "description": "Git 저장소 관리"
    },
    "brave-search": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": process.env.BRAVE_API_KEY || ""
      },
      "enabled": true,
      "description": "웹 검색"
    },
    "postgres": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": process.env.DATABASE_URL || ""
      },
      "enabled": true,
      "description": "PostgreSQL 데이터베이스"
    },
    "vercel": {
      "command": "npx",
      "args": ["mcp-server-vercel"],
      "env": {
        "VERCEL_TOKEN": process.env.VERCEL_TOKEN || ""
      },
      "enabled": true,
      "description": "Vercel 배포 관리"
    },
    "neon": {
      "command": "npx",
      "args": ["mcp-server-neon"],
      "env": {
        "NEON_API_KEY": process.env.NEON_API_KEY || "",
        "NEON_DATABASE_URL": process.env.DATABASE_URL || ""
      },
      "enabled": true,
      "description": "Neon 데이터베이스"
    },
    "browserTools": {
      "command": "node",
      "args": ["browser-tools-mcp.js"],
      "enabled": true,
      "autoApprove": true,
      "description": "브라우저 디버깅 도구"
    },
    "debugTools": {
      "command": "node",
      "args": ["debug-unified.js"],
      "enabled": true,
      "autoApprove": true,
      "description": "통합 디버깅 도구"
    }
  },
  "config": {
    "autoStart": true,
    "logLevel": "info",
    "logDirectory": "./logs",
    "port": 4700,
    "apiPort": 4710
  },
  "startup": {
    "openBrowser": true,
    "startServer": true,
    "startApi": true
  },
  "keywords": [
    "mcp",
    "파일 시스템",
    "git",
    "웹 검색",
    "데이터베이스",
    "vercel",
    "neon",
    "브라우저 로그",
    "브라우저 스크린샷",
    "네트워크 요청",
    "DOM 요소",
    "접근성 검사",
    "SEO 검사",
    "성능 검사",
    "디버거 모드"
  ],
  "server": {
    "port": 5000,
    "autoStart": true,
    "logDirectory": "logs",
    "debug": true
  },
  "browser": {
    "defaultUrl": "http://localhost:3000",
    "headless": false,
    "autoClose": true,
    "screenshotDirectory": "logs/screenshots"
  },
  "automation": {
    "enabled": true,
    "commands": {
      "파일 시스템 접근": "filesystem",
      "Git 저장소 관리": "git",
      "웹 검색": "brave-search",
      "데이터베이스 쿼리": "postgres",
      "Vercel 배포": "vercel",
      "Neon DB 관리": "neon",
      "브라우저 로그 확인": "simple-debug.js console",
      "브라우저 스크린샷 찍기": "simple-debug.js screenshot",
      "네트워크 요청 분석": "simple-debug.js network",
      "현재 DOM 요소 확인": "simple-debug.js dom",
      "접근성 검사 실행": "simple-debug.js accessibility",
      "SEO 검사 실행": "simple-debug.js seo",
      "성능 검사 실행": "simple-debug.js performance",
      "디버거 모드 실행": "mcp-debug.js"
    },
    "yoloMode": true
  },
  "tools": {
    "filesystem": {
      "enabled": true,
      "allowedPaths": ["./", "../"],
      "readOnly": false
    },
    "git": {
      "enabled": true,
      "repository": ".",
      "autoCommit": false
    },
    "search": {
      "enabled": true,
      "maxResults": 10,
      "safeSearch": true
    },
    "database": {
      "enabled": true,
      "connectionString": process.env.DATABASE_URL || "",
      "maxConnections": 5
    },
    "vercel": {
      "enabled": true,
      "projectId": "prj_dkJndydTSE2LiVEKrs0f5G0tELRJ",
      "autoDeploy": false
    },
    "neon": {
      "enabled": true,
      "databaseUrl": process.env.DATABASE_URL || "",
      "autoBackup": true
    },
    "screenshots": {
      "enabled": true,
      "fullPage": true,
      "format": "png",
      "quality": 100,
      "autoSave": true
    },
    "network": {
      "enabled": true,
      "captureHeaders": true,
      "captureContent": true,
      "filterTypes": ["xhr", "fetch", "websocket"]
    },
    "console": {
      "enabled": true,
      "captureTypes": ["log", "error", "warn", "info", "debug"]
    },
    "dom": {
      "enabled": true,
      "maxDepth": 5,
      "includeAttributes": true
    }
  }
};

// 3. 설정 파일 저장
fs.writeFileSync('cursor-mcp-config.json', JSON.stringify(cursorMcpConfig, null, 2));
console.log('✅ Cursor IDE용 MCP 설정 파일 생성 완료!');

// 4. 환경 변수 설정 파일 생성
const envTemplate = `# Cursor IDE AI용 MCP 환경 변수
# 필요한 API 키들을 설정하세요

# Brave Search API (선택사항)
# BRAVE_API_KEY=your_brave_api_key_here

# Vercel API (선택사항)
# VERCEL_TOKEN=your_vercel_token_here

# Neon API (선택사항)
# NEON_API_KEY=your_neon_api_key_here

# 데이터베이스 연결 (필수)
DATABASE_URL="postgresql://neondb_owner:npg_Sig2EyAk3vcI@ep-shiny-surf-a1fjnpy9-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# 기타 설정
NODE_ENV=development
LOG_LEVEL=info
`;

fs.writeFileSync('.env.mcp', envTemplate);
console.log('✅ MCP 환경 변수 템플릿 생성 완료!');

// 5. Cursor IDE 설정 가이드 생성
const cursorGuide = `# Cursor IDE AI용 MCP 설정 가이드

## 1. MCP 설정 파일 위치
- 설정 파일: \`cursor-mcp-config.json\`
- 환경 변수: \`.env.mcp\`

## 2. Cursor IDE에서 MCP 활성화
1. Cursor IDE 열기
2. 설정 (Settings) → Extensions → MCP
3. "Enable MCP" 체크
4. 설정 파일 경로: \`./cursor-mcp-config.json\`

## 3. 사용 가능한 MCP 도구들
- **파일 시스템**: 파일 읽기/쓰기/삭제
- **Git**: 저장소 관리, 커밋, 브랜치
- **웹 검색**: Brave Search API를 통한 웹 검색
- **데이터베이스**: PostgreSQL 쿼리 실행
- **Vercel**: 배포 관리, 환경 변수 설정
- **Neon**: 데이터베이스 관리, 백업
- **브라우저 도구**: 스크린샷, 로그, 네트워크 분석
- **디버깅 도구**: 통합 디버깅 및 모니터링

## 4. 환경 변수 설정
필요한 API 키들을 \`.env.mcp\` 파일에 설정하세요:
- BRAVE_API_KEY: 웹 검색용
- VERCEL_TOKEN: Vercel 관리용
- NEON_API_KEY: Neon DB 관리용

## 5. 사용 방법
Cursor IDE에서 AI와 대화할 때 다음과 같이 요청하세요:
- "파일 시스템을 사용해서 프로젝트 구조를 분석해줘"
- "Git을 사용해서 최근 커밋을 확인해줘"
- "데이터베이스에서 예약 데이터를 조회해줘"
- "Vercel에 새로운 배포를 실행해줘"
- "브라우저에서 스크린샷을 찍어줘"

## 6. 문제 해결
- MCP 서버가 시작되지 않으면 로그를 확인하세요: \`./logs/mcp.log\`
- 환경 변수가 제대로 설정되었는지 확인하세요
- 필요한 패키지가 설치되었는지 확인하세요: \`npm list\`
`;

fs.writeFileSync('CURSOR-MCP-GUIDE.md', cursorGuide);
console.log('✅ Cursor IDE 설정 가이드 생성 완료!');

// 6. 로그 디렉토리 생성
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
  console.log('✅ 로그 디렉토리 생성 완료!');
}

console.log('\n🎉 Cursor IDE AI용 MCP 설정 완료!');
console.log('\n📋 다음 단계:');
console.log('1. Cursor IDE에서 MCP 활성화');
console.log('2. 설정 파일 경로: ./cursor-mcp-config.json');
console.log('3. 환경 변수 설정: .env.mcp 파일 편집');
console.log('4. 가이드 확인: CURSOR-MCP-GUIDE.md');
console.log('\n🚀 이제 Cursor IDE AI에서 MCP 도구들을 사용할 수 있습니다!');
