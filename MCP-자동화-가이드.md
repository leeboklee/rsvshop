# MCP 자동화 및 디버깅 가이드

## MCP란?
MCP(Model Context Protocol)는 Cursor에서 브라우저 디버깅 및 자동화 작업을 수행하기 위한 도구입니다. 브라우저 로그 확인, 스크린샷 캡처, DOM 요소 검사 등 다양한 작업을 자동화할 수 있습니다.

## 필요 파일
- `browser-tools-mcp.js`: MCP 서버 (포트 4950 사용)
- `mcp-auto.js`: MCP 자동 실행 스크립트
- `run-debug.bat`: CMD를 통해 MCP 서버를 실행하는 배치 파일

## 포트 설정
- 기본 포트: 4950
- 대체 포트: 3900, 4900
- 변경 방법: `browser-tools-mcp.js` 파일에서 `const PORT = 4950;` 수정

## 자동화 명령어
Cursor IDE에서 다음 명령어를 입력하면 자동으로 MCP 도구가 실행됩니다:

1. **브라우저 로그 확인**
   - 현재 페이지의 콘솔 로그를 수집합니다.
   - 자동 실행: `mcp.log`

2. **브라우저 스크린샷 찍기**
   - 현재 페이지의 스크린샷을 캡처합니다.
   - 자동 실행: `mcp.screenshot`

3. **네트워크 요청 분석**
   - 페이지의 네트워크 요청을 분석합니다.
   - 자동 실행: `mcp.network`

4. **현재 DOM 요소 확인**
   - 페이지의 DOM 구조를 검사합니다.
   - 자동 실행: `mcp.dom`

5. **접근성 검사 실행**
   - 페이지의 접근성 문제를 검사합니다.
   - 자동 실행: `mcp.a11y`

6. **디버거 모드 실행**
   - 브라우저 디버거를 실행합니다.
   - 자동 실행: `mcp.debug`

## 디버깅 방법

### MCP 서버 디버깅
1. `run-debug.bat` 파일 실행
   - CMD에서 직접 실행: `run-debug.bat`
   - Cursor에서 실행: "run-debug.bat 실행"

2. 로그 확인
   - 디버그 로그: `logs/mcp-debug.log`
   - 오류 로그: `logs/mcp-error.log`
   - 상태 확인: `logs/mcp-status.json`

### 서버 상태 확인
```
curl http://localhost:4950/status
```

## 문제 해결

### 포트 충돌 해결
1. 이미 사용 중인 포트 확인
```
netstat -ano | findstr ":4950"
```

2. 해당 프로세스 종료
```
taskkill /PID [프로세스ID] /F
```

3. 포트 변경 (선택 사항)
`browser-tools-mcp.js` 파일에서 포트 번호 변경:
```javascript
const PORT = 새포트번호;
```

### PowerShell 실행 정책 오류
PowerShell에서 스크립트 실행 오류가 발생하는 경우:

1. CMD 사용 (권장)
```
cmd /c "node browser-tools-mcp.js"
```

2. PowerShell 실행 정책 변경 (관리자 권한 필요)
```
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Node.js 관련 오류

1. npm 경로 문제 해결
`mcp-auto.js` 파일에서 npm 경로 명시:
```javascript
const npmPath = process.env.npm_node_execpath || process.execPath;
// npm 실행 시 올바른 경로 사용
```

2. Playwright 설치 확인
```
npx playwright install
```

## 최적 실행 명령어
```
cmd /c "node browser-tools-mcp.js"
```

## 규칙 설정
`.cursor/rules/mcp-yolo.md` 파일을 통해 MCP 자동화 규칙을 설정할 수 있습니다. 