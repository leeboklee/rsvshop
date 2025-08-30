import { useState, useEffect } from 'react';

/**
 * Hydration 오류를 방지하기 위한 커스텀 훅
 * 서버와 클라이언트의 상태 불일치를 방지
 */
export function useHydrationSafe<T>(initialValue: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(initialValue);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const safeSetValue = (newValue: T) => {
    if (mounted) {
      setValue(newValue);
    }
  };

  return [mounted ? value : initialValue, safeSetValue];
}

/**
 * 클라이언트 사이드에서만 실행되는 useEffect
 */
export function useClientEffect(effect: () => void | (() => void), deps: React.DependencyList = []) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      return effect();
    }
  }, [mounted, ...deps]);

  return mounted;
}

/**
 * 안전한 상태 업데이트를 위한 래퍼
 */
export function useSafeState<T>(initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(initialValue);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const safeSetValue = (newValue: T | ((prev: T) => T)) => {
    if (mounted) {
      setValue(newValue);
    }
  };

  return [value, safeSetValue];
}

/**
 * Hydration 안전한 boolean 상태
 */
export function useHydrationSafeBoolean(initialValue: boolean = false): [boolean, (value: boolean) => void] {
  return useHydrationSafe(initialValue);
}

/**
 * Hydration 안전한 string 상태
 */
export function useHydrationSafeString(initialValue: string = ''): [string, (value: string) => void] {
  return useHydrationSafe(initialValue);
}

/**
 * Hydration 안전한 number 상태
 */
export function useHydrationSafeNumber(initialValue: number = 0): [number, (value: number) => void] {
  return useHydrationSafe(initialValue);
}
