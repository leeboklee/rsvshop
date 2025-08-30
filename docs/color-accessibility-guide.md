# 색상 접근성 가이드

## 문제점 분석

### 1. 현재 문제
- **통계 카드**: 연한 배경색(blue-50, green-50 등)에 연한 글자색(blue-600, green-600 등) 사용
- **가독성 저하**: 배경과 글자색의 대비가 부족하여 텍스트가 잘 보이지 않음
- **접근성 문제**: 색맹 사용자나 시력이 좋지 않은 사용자에게 불편함

### 2. 원인
- **Tailwind CSS 색상 팔레트**: 50-600 범위의 색상 조합이 대비가 부족
- **디자인 우선**: 시각적 아름다움을 위해 가독성 희생
- **일관성 부족**: 색상 사용 기준이 명확하지 않음

## 개선 방안

### 1. 즉시 적용 (완료)
```css
/* 기존 */
text-blue-600, text-green-600, text-yellow-600, text-red-600, text-purple-600

/* 개선 */
text-gray-900 (숫자), text-gray-700 (라벨)
```

### 2. 향후 개선 사항

#### A. 색상 대비 기준
- **최소 대비율**: WCAG AA 기준 4.5:1 이상
- **권장 대비율**: 7:1 이상
- **테스트 도구**: WebAIM Contrast Checker 사용

#### B. 색상 팔레트 재정의
```css
/* 주요 텍스트 */
text-gray-900 (가장 어두운 회색)

/* 보조 텍스트 */
text-gray-700 (중간 어두운 회색)

/* 비활성 텍스트 */
text-gray-500 (중간 회색)

/* 배경색 */
bg-gray-50, bg-blue-50, bg-green-50 (연한 배경)
```

#### C. 상태별 색상 가이드
```css
/* 성공/확정 */
bg-green-50 + text-gray-900 (숫자) + text-gray-700 (라벨)

/* 경고/대기 */
bg-yellow-50 + text-gray-900 (숫자) + text-gray-700 (라벨)

/* 오류/취소 */
bg-red-50 + text-gray-900 (숫자) + text-gray-700 (라벨)

/* 정보/전체 */
bg-blue-50 + text-gray-900 (숫자) + text-gray-700 (라벨)
```

### 3. 개발 가이드라인

#### A. 컴포넌트 설계 시
1. **텍스트 우선**: 색상보다는 텍스트 내용으로 의미 전달
2. **대비 확인**: 배경색과 글자색 조합 테스트 필수
3. **접근성 검증**: 색맹 시뮬레이터로 테스트

#### B. 코드 리뷰 체크리스트
- [ ] 텍스트와 배경의 대비율 확인
- [ ] 색상만으로 정보 전달하지 않음
- [ ] WCAG AA 기준 준수
- [ ] 다양한 디스플레이 환경에서 테스트

### 4. 자동화 도구

#### A. 개발 시
```bash
# 색상 대비 검사 스크립트
npm run check-contrast

# 접근성 검사
npm run accessibility-test
```

#### B. CI/CD 파이프라인
- 색상 대비 자동 검사
- 접근성 기준 미달 시 빌드 실패
- 시각적 회귀 테스트

## 적용 예시

### Before (문제)
```jsx
<div className="bg-blue-50 p-6 rounded-lg">
  <div className="text-2xl font-bold text-blue-600">123</div>
  <div className="text-sm text-blue-500">전체 예약</div>
</div>
```

### After (개선)
```jsx
<div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
  <div className="text-2xl font-bold text-gray-900">123</div>
  <div className="text-sm text-gray-700">전체 예약</div>
</div>
```

## 모니터링

### 1. 정기 검사
- 월 1회 전체 페이지 색상 대비 검사
- 사용자 피드백 수집 및 반영
- 접근성 도구 업데이트

### 2. 성과 지표
- 색상 관련 사용자 불만 감소
- 접근성 테스트 통과율 향상
- 개발자 색상 사용 패턴 개선

---

**참고 자료**
- [WCAG 2.1 색상 대비 가이드라인](https://www.w3.org/WAI/WCAG21/quickref/#contrast-minimum)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Tailwind CSS 색상 팔레트](https://tailwindcss.com/docs/customizing-colors) 