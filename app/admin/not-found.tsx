import Link from 'next/link'

export default function AdminNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        <div className="text-6xl mb-4">🛠️</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          관리자 페이지를 찾을 수 없습니다
        </h1>
        <p className="text-gray-600 mb-6">
          요청하신 관리자 페이지가 존재하지 않습니다.
        </p>
        <div className="space-y-3">
          <Link
            href="/admin"
            className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            관리자 홈
          </Link>
          <Link
            href="/"
            className="block w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
          >
            메인 홈
          </Link>
        </div>
      </div>
    </div>
  )
}
