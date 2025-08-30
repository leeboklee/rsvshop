'use client';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body>
        <div style={{ minHeight: '100vh' }} className="bg-gray-50 flex items-center justify-center p-6">
          <div className="max-w-xl w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 5a7 7 0 100 14 7 7 0 000-14z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">문제가 발생했습니다</h1>
            <p className="text-gray-600 mb-6">일시적인 오류일 수 있습니다. 다시 시도하거나 다른 페이지로 이동해 주세요.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => reset()} className="px-5 py-2.5 rounded-md bg-gray-900 text-white hover:bg-black">다시 시도</button>
              <a href="/hotel-admin" className="px-5 py-2.5 rounded-md bg-blue-600 text-white hover:bg-blue-700">호텔 관리자</a>
              <a href="/customer" className="px-5 py-2.5 rounded-md bg-green-600 text-white hover:bg-green-700">고객 예약</a>
              <a href="/admin" className="px-5 py-2.5 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300">관리자</a>
            </div>
            {process.env.NODE_ENV !== 'production' && (
              <pre className="text-left mt-6 bg-gray-50 border border-gray-200 p-3 rounded-md text-xs text-gray-700 overflow-auto max-h-48">
                {error?.message}
                {error?.digest ? `\n#${error.digest}` : ''}
              </pre>
            )}
          </div>
        </div>
      </body>
    </html>
  );
} 