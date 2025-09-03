export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">RSVShop 시스템</h1>
              <p className="text-gray-600 mt-1">호텔 예약 및 관리 시스템</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 환영 메시지 */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-8 mb-8">
          <h2 className="text-3xl font-bold mb-4">🚀 RSVShop에 오신 것을 환영합니다!</h2>
          <p className="text-xl mb-6">호텔 예약 및 관리 시스템의 모든 기능을 한 곳에서 관리하세요.</p>
          <div className="flex space-x-4">
            <a href="/admin" className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              관리자 페이지 시작하기
            </a>
            <a href="/hotel-admin" className="px-6 py-3 bg-blue-400 text-white rounded-lg font-semibold hover:bg-blue-300 transition-colors">
              호텔 관리자 페이지
            </a>
          </div>
        </div>

        {/* 주요 기능 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">🏨 호텔 관리</h3>
            <p className="text-gray-600 mb-4">호텔 정보 및 객실 관리</p>
            <a href="/admin/hotels" className="text-blue-600 hover:text-blue-800 font-medium">관리하기 →</a>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📅 예약 관리</h3>
            <p className="text-gray-600 mb-4">예약 생성, 수정, 삭제</p>
            <a href="/admin/reservations" className="text-blue-600 hover:text-blue-800 font-medium">관리하기 →</a>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">💰 결제 관리</h3>
            <p className="text-gray-600 mb-4">결제 내역 및 처리</p>
            <a href="/admin/payments" className="text-blue-600 hover:text-blue-800 font-medium">관리하기 →</a>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 대시보드</h3>
            <p className="text-gray-600 mb-4">시스템 통계 및 개요</p>
            <a href="/admin/dashboard" className="text-blue-600 hover:text-blue-800 font-medium">보기 →</a>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">🛍️ 쇼핑몰 연동</h3>
            <p className="text-gray-600 mb-4">외부 쇼핑몰 연동 관리</p>
            <a href="/admin/shopping-malls" className="text-blue-600 hover:text-blue-800 font-medium">관리하기 →</a>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">🔧 시스템 모니터링</h3>
            <p className="text-gray-600 mb-4">시스템 상태 및 로그</p>
            <a href="/admin/monitoring" className="text-blue-600 hover:text-blue-800 font-medium">모니터링 →</a>
          </div>
        </div>
      </div>
    </div>
  );
}
