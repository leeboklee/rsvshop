'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface OptimizedLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  prefetch?: boolean;
  onClick?: () => void;
}

export default function OptimizedLink({ 
  href, 
  children, 
  className = '', 
  prefetch = true,
  onClick 
}: OptimizedLinkProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Hydration 오류 방지
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleClick = () => {
    if (onClick) onClick();
    
    // 로딩 상태 표시 (빠른 피드백)
    setIsLoading(true);
    
    // 짧은 지연 후 로딩 상태 해제 (실제 페이지 전환은 Next.js가 처리)
    setTimeout(() => setIsLoading(false), 100);
  };

  return (
    <Link 
      href={href} 
      className={`${className} ${isLoading && mounted ? 'opacity-75' : ''}`}
      prefetch={prefetch}
      onClick={handleClick}
    >
      {children}
      {isLoading && mounted && (
        <span className="ml-2 inline-block w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
      )}
    </Link>
  );
}
