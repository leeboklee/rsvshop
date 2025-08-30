export default function SalesPage() {
  return (
    <div className="min-h-[50vh] bg-white rounded-2xl border p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-2">매출 관리</h1>
      <p className="text-gray-600 mb-6">매출 대시보드는 준비 중입니다. 필요한 위젯/지표를 알려주시면 구성하겠습니다.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
        <div className="p-4 rounded-xl border bg-gray-50">총 매출</div>
        <div className="p-4 rounded-xl border bg-gray-50">월 매출</div>
        <div className="p-4 rounded-xl border bg-gray-50">주간 매출</div>
        <div className="p-4 rounded-xl border bg-gray-50">평균 객단가</div>
        <div className="p-4 rounded-xl border bg-gray-50">예약 수</div>
        <div className="p-4 rounded-xl border bg-gray-50">취소 수</div>
      </div>
    </div>
  )
}


