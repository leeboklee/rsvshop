'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RoomsRedirect() {
  const router = useRouter();

  useEffect(() => {
    // 기존 /admin/rooms를 /admin/hotel-rooms로 리다이렉트
    router.replace('/admin/hotel-rooms');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">호텔객실관리 페이지로 이동 중...</p>
      </div>
    </div>
  );
}
