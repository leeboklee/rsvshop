# Cursor IDE AI용 MCP 설정 가이드

## 1. MCP 설정 파일 위치
- 설정 파일: `cursor-mcp-config.json`
- 환경 변수: `.env.mcp`

## 2. Cursor IDE에서 MCP 활성화
1. Cursor IDE 열기
2. 설정 (Settings) → Extensions → MCP
3. "Enable MCP" 체크
4. 설정 파일 경로: `./cursor-mcp-config.json`

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
필요한 API 키들을 `.env.mcp` 파일에 설정하세요:
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
- MCP 서버가 시작되지 않으면 로그를 확인하세요: `./logs/mcp.log`
- 환경 변수가 제대로 설정되었는지 확인하세요
- 필요한 패키지가 설치되었는지 확인하세요: `npm list`
