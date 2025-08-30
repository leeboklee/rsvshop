---
name: "MCP 자동화 설정"
description: "MCP 도구의 자동화 실행을 위한 설정"
---

# MCP 자동화 설정

MCP 도구가 자동으로 실행되도록 YOLO 모드를 활성화합니다.

```rules
mcpAutoRun: true
mcpAutoApprove: true
```

MCP 디버깅 도구에 대한 자동 승인과 실행을 설정합니다.

```rules
설정:
  - 브라우저 디버깅이 필요할 때 BrowserTools MCP를 자동으로 실행합니다.
  - 다음 명령어를 인식하고 BrowserTools MCP 도구를 자동으로 실행합니다:
    - "브라우저 로그 확인"
    - "브라우저 스크린샷 찍기"
    - "네트워크 요청 분석"
    - "현재 DOM 요소 확인"
    - "접근성 검사 실행"
    - "SEO 검사 실행"
    - "성능 검사 실행"
    - "디버거 모드 실행"
    - "mcp"
    - "mcp 실행"
    - "mcp auto run"
``` 