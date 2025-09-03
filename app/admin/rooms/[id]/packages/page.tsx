'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function RoomPackagesManagement() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;

  useEffect(() => {
    // 객실별 패키지 페이지를 전체 패키지 관리 페이지로 리다이렉트
    // roomId를 쿼리 파라미터로 전달하여 해당 객실로 필터링
    router.replace(`/admin/packages?roomId=${roomId}`);
  }, [roomId, router]);

  // 리다이렉트 중 로딩 표시
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">패키지 관리 페이지로 이동 중...</p>
        <p className="text-sm text-gray-500 mt-2">객실 ID: {roomId}</p>
      </div>
    </div>
  );
}