# 🚨 메모리 누수 방지 가이드

## 📋 개요
RSVShop 프로젝트에서 메모리 누수를 방지하고 최적화하는 방법을 설명합니다.

## 🔍 주요 메모리 누수 원인

### 1. **useEffect Cleanup 누락**
```typescript
// ❌ 잘못된 예시
useEffect(() => {
  const interval = setInterval(() => {
    // 작업 수행
  }, 1000);
  // cleanup 함수 없음!
}, []);

// ✅ 올바른 예시
useEffect(() => {
  const interval = setInterval(() => {
    // 작업 수행
  }, 1000);
  
  return () => clearInterval(interval); // cleanup 함수
}, []);
```

### 2. **이벤트 리스너 정리 누락**
```typescript
// ❌ 잘못된 예시
useEffect(() => {
  const handleClick = () => console.log('clicked');
  document.addEventListener('click', handleClick);
  // cleanup 함수 없음!
}, []);

// ✅ 올바른 예시
useEffect(() => {
  const handleClick = () => console.log('clicked');
  document.addEventListener('click', handleClick);
  
  return () => document.removeEventListener('click', handleClick);
}, []);
```

### 3. **AbortController 누락**
```typescript
// ❌ 잘못된 예시
useEffect(() => {
  fetch('/api/data'); // 취소할 수 없음
}, []);

// ✅ 올바른 예시
useEffect(() => {
  const controller = new AbortController();
  
  fetch('/api/data', { signal: controller.signal });
  
  return () => controller.abort();
}, []);
```

## 🛠️ 해결 방법

### 1. **useMemoryLeakPrevention 훅 사용**
```typescript
import { useMemoryLeakPrevention } from '@/hooks/useMemoryLeakPrevention';

function MyComponent() {
  const { registerTimer, createAbortController, cleanup } = useMemoryLeakPrevention({
    checkInterval: 30000, // 30초마다 체크
    memoryThreshold: 0.8, // 80% 임계값
    enableAutoCleanup: true
  });

  useEffect(() => {
    const interval = setInterval(() => {
      // 작업 수행
    }, 1000);
    
    registerTimer(interval, 'interval');
    
    return () => clearInterval(interval);
  }, [registerTimer]);

  // 수동 정리
  const handleCleanup = () => {
    cleanup();
  };
}
```

### 2. **전역 메모리 유틸리티 사용**
```typescript
// 타이머 등록
const interval = setInterval(() => {}, 1000);
window.__rsvshopMemoryUtils?.registerTimer(interval);

// 이벤트 리스너 등록
const handler = () => {};
element.addEventListener('click', handler);
window.__rsvshopMemoryUtils?.registerEventListener(element, 'click', handler);

// WebSocket 등록
const ws = new WebSocket('ws://...');
window.__rsvshopMemoryUtils?.registerWebSocket(ws);
```

## 📊 메모리 모니터링

### 1. **브라우저 개발자 도구**
- **Memory 탭**: 힙 스냅샷으로 메모리 사용량 확인
- **Performance 탭**: 메모리 사용량 그래프 모니터링
- **Console**: 메모리 관련 경고 메시지 확인

### 2. **자동 모니터링**
- 1분마다 자동으로 메모리 사용량 체크
- 80% 이상 사용 시 경고 메시지 출력
- 자동 정리 옵션으로 즉시 메모리 해제

## 🧹 정리 시점

### 1. **컴포넌트 언마운트**
```typescript
useEffect(() => {
  // 초기화 코드
  
  return () => {
    // cleanup 코드
  };
}, []);
```

### 2. **페이지 전환 시**
- `beforeunload` 이벤트로 모든 리소스 정리
- 진행 중인 요청 취소
- 타이머 및 이벤트 리스너 정리

### 3. **페이지 숨김 시**
- `visibilitychange` 이벤트로 백그라운드 타이머 정리
- 불필요한 리소스 사용 방지

## 🚀 최적화 팁

### 1. **React.memo 사용**
```typescript
const MyComponent = React.memo(({ data }) => {
  // 컴포넌트 로직
});
```

### 2. **useCallback과 useMemo 활용**
```typescript
const memoizedCallback = useCallback(() => {
  // 콜백 함수
}, [dependency]);

const memoizedValue = useMemo(() => {
  // 계산된 값
}, [dependency]);
```

### 3. **가상화 (Virtualization)**
```typescript
import { FixedSizeList as List } from 'react-window';

const VirtualizedList = ({ items }) => (
  <List
    height={400}
    itemCount={items.length}
    itemSize={35}
  >
    {({ index, style }) => (
      <div style={style}>
        {items[index]}
      </div>
    )}
  </List>
);
```

## 🔧 문제 해결

### 1. **메모리 사용량이 계속 증가하는 경우**
1. useEffect cleanup 함수 확인
2. 이벤트 리스너 정리 확인
3. 타이머 정리 확인
4. AbortController 사용 확인

### 2. **페이지 전환 시 느려지는 경우**
1. 컴포넌트 언마운트 시 정리 확인
2. 전역 상태 정리 확인
3. 캐시된 데이터 정리 확인

### 3. **백그라운드에서 메모리 사용량 증가**
1. visibilitychange 이벤트 처리 확인
2. 백그라운드 타이머 정리 확인
3. 불필요한 API 호출 중단 확인

## 📝 체크리스트

- [ ] 모든 useEffect에 cleanup 함수 추가
- [ ] 이벤트 리스너 정리 확인
- [ ] 타이머 정리 확인
- [ ] AbortController 사용 확인
- [ ] useMemoryLeakPrevention 훅 사용
- [ ] 전역 메모리 유틸리티 활용
- [ ] 정기적인 메모리 사용량 모니터링
- [ ] 페이지 전환 시 정리 확인

## 🎯 결론

메모리 누수는 성능 저하와 사용자 경험 악화의 주요 원인입니다. 
위의 가이드를 따라 체계적으로 메모리 관리를 하면 안정적이고 빠른 애플리케이션을 만들 수 있습니다.

**기억하세요: "예방이 치료보다 낫습니다!"** 🚀
