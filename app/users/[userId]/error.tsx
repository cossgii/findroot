'use client';

import { useEffect } from 'react';

export default function UserProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
      <h2 className="text-2xl font-bold text-gray-800">프로필을 불러올 수 없습니다</h2>
      <p className="text-gray-500">사용자 정보를 가져오는 중 오류가 발생했습니다.</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
      >
        다시 시도
      </button>
    </div>
  );
}
