# CSS & UI 스타일 가이드

## 1. 공통 원칙
- Tailwind CSS 유틸리티 우선, @apply 적극 활용
- 커스텀 class(.btn, .card, .title, .emoji 등)는 @apply로 통합, 중복/불필요 스타일 금지
- h1/h2/h3 등 헤더는 .title class 일괄 적용, 시각적 일관성 유지
- 버튼/카드/이모티콘 등 주요 UI 요소는 공통 class 사용, 직접 스타일 최소화
- 반응형(@media)·접근성(aria-label 등) 필수 적용
- !important, 중복/충돌 스타일 금지, Tailwind 우선순위 명확화
- **CSS 변수(--color-primary 등)로 색상/스페이싱/테마 관리, 글로벌 스타일 일원화**
- **다크모드: prefers-color-scheme 기반 자동 전환, Tailwind dark: 활용**
- **motion/애니메이션: prefers-reduced-motion 지원, 불필요한 motion 최소화**

## 2. 코드 예시
```css
/* 공통 유틸리티 */
:root {
  --color-primary: #2563eb;
  --color-bg: #fff;
  --color-bg-dark: #18181b;
  --color-text: #222;
  --color-text-dark: #eee;
}
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: var(--color-bg-dark);
    --color-text: var(--color-text-dark);
  }
}
.emoji, .emoticon { @apply inline-block align-middle select-none text-[2rem] leading-[1.2]; }
.title { @apply font-bold leading-[1.2] mb-2 tracking-tight; font-size:clamp(1.5rem,2vw,2.5rem); }
.btn { @apply font-semibold px-5 py-2 rounded transition outline-none min-w-[120px] shadow-none; }
.card { @apply rounded-2xl shadow-lg overflow-hidden bg-white dark:bg-zinc-900; }

@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; animation-duration: 0.01ms !important; }
}
```

## 3. 실무 체크리스트
- 중복/불필요/충돌 CSS 즉시 제거
- Tailwind @apply로 커스텀 class 통합, 직접 스타일 최소화
- 모든 주요 UI 요소 className 일관 적용
- 모바일/반응형/접근성 자동화 우선
- **다크모드/모션/접근성 prefers-* 자동 적용**
- 신규 UI/아이콘 추가 시 시각 리그레션 테스트 필수

## 4. 개선/확장
- 컴포넌트별 스타일 분리, 자동화 도구 적극 활용
- 스타일 가이드 지속 업데이트, 코드 리뷰 시 준수 필수
- **CSS 변수/다크모드/모션/접근성 등 글로벌 표준 반영**

## 5. 시각 리그레션 & 자동화
- Playwright 등으로 주요 페이지 스크린샷 자동 캡처 및 이전 이미지와 픽셀 diff 비교
- 디자인/스타일 변경 시 자동 리그레션 테스트 필수, diff 발생 시 코드 리뷰/수정
- 리그레션 리포트/이미지 diff 결과 문서화, 배포 전 자동 검증
- **실패 시 자동 알림/로그 기록, 주요 diff는 docs/headless-test/에 저장**

## 6. 신규 UI/스타일 적용 프로세스
- 신규 UI/스타일 추가 시 Playwright 기반 시각 리그레션·디버깅 자동화 파이프라인 필수 적용
- 주요 페이지/컴포넌트별 스크린샷 캡처 및 diff, 콘솔/네트워크/DOM 자동 진단
- 모든 변경사항은 자동화 리포트로 검증 후 코드 리뷰/배포
- 실무 적용 체크리스트: 1) 공통 class 적용 2) @apply 활용 3) 반응형/접근성 4) 자동 리그레션/디버깅 통과

## 7. SVG/이모티콘 스타일 가이드
- SVG/이모티콘 등 아이콘은 반드시 인라인 style 속성으로 width/height/fill/object-fit/overflow 등 명시
- Tailwind/글로벌 CSS 영향 최소화, 클래스명 충돌·스타일 오버라이드 방지
- 예시:
```tsx
<svg style={{ width: '48px', height: '48px', fill: 'currentColor', objectFit: 'contain', overflow: 'visible', display: 'block' }} ...>
```
- viewBox, width/height, fill, object-fit, overflow 등 속성 명확히 지정
- SVG export 시 Style Attributes(인라인) 옵션 사용 권장
- 참고: [SVG 인라인 스타일 적용](https://www.seancdavis.com/posts/inline-style-attributes-svg-elements/) · [SVG 디버깅 체크리스트](https://css-tricks.com/6-common-svg-fails-and-how-to-fix-them/)
- 참고: [CSS 다크모드 가이드](https://web.dev/prefers-color-scheme/) · [CSS 변수 글로벌 적용](https://css-tricks.com/a-complete-guide-to-custom-properties/) · [접근성 motion 가이드](https://web.dev/prefers-reduced-motion/) 