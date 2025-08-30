'use client';

import { useState } from 'react';

interface ErrorComponentProps {
  shouldError: boolean;
}

export default function ErrorComponent({ shouldError }: ErrorComponentProps) {
  const [count, setCount] = useState(0);

  // 의도적으로 오류 발생
  if (shouldError) {
    throw new Error('ErrorComponent에서 의도적으로 발생시킨 오류입니다.');
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <h3 className="text-green-900 font-semibold mb-2">
        🟢 정상 동작 컴포넌트
      </h3>
      <p className="text-green-700 text-sm mb-3">
        이 컴포넌트는 정상적으로 렌더링됩니다.
      </p>
      <div className="flex items-center space-x-3">
        <span className="text-green-600">카운터: {count}</span>
        <button
          onClick={() => setCount(count + 1)}
          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
        >
          증가
        </button>
      </div>
    </div>
  );
}
