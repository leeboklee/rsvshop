export default function AdminLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-20 w-20 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600 font-medium">관리자 페이지 로딩 중...</p>
        <p className="mt-2 text-sm text-gray-500">데이터를 불러오고 있습니다</p>
      </div>
    </div>
  )
}
