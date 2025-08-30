'use client';

import Link from 'next/link';

export default function CustomerSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-2xl mx-4">
        {/* 성공 아이콘 */}
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* 성공 메시지 */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">예약이 완료되었습니다!</h1>
        <p className="text-gray-600 mb-8 text-lg">
          고객님의 예약이 성공적으로 접수되었습니다.<br />
          확인 후 연락드리겠습니다.
        </p>

        {/* 예약 번호 */}
        <div className="bg-gray-50 rounded-lg p-4 mb-8">
          <p className="text-sm text-gray-600 mb-2">예약 번호</p>
          <p className="text-xl font-mono font-bold text-blue-600">
            RSV-{Date.now().toString().slice(-8)}
          </p>
        </div>

        {/* 안내 사항 */}
        <div className="bg-blue-50 rounded-lg p-4 mb-8 text-left">
          <h3 className="font-semibold text-blue-800 mb-3">📋 예약 확인 안내</h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li>• 예약 확인은 24시간 이내에 완료됩니다</li>
            <li>• 연락처로 확인 문자를 발송드립니다</li>
            <li>• 문의사항이 있으시면 관리자에게 연락해주세요</li>
          </ul>
        </div>

        {/* 버튼들 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/customer"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            추가 예약하기
          </Link>
          <Link
            href="/admin"
            className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
          >
            관리자 페이지
          </Link>
        </div>
      </div>
    </div>
  );
}
