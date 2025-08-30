'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function PageTransition() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // 경로 변경 시 로딩 상태 표시
    setIsLoading(true);
    
    // 짧은 지연 후 로딩 상태 해제 (실제 페이지 로드 완료 시점)
    const timer = setTimeout(() => setIsLoading(false), 300);
    
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-blue-600 z-50 animate-pulse">
      <div className="h-full bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 animate-shimmer"></div>
    </div>
  );
}
