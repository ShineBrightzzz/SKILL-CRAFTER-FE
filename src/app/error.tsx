'use client';

import { useEffect } from 'react';
import ErrorHandler from '@/components/ErrorHandler';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <ErrorHandler 
        status={500} 
        message="Đã xảy ra lỗi. Vui lòng thử lại sau."
      />
      <div className="mt-6">
        <button
          onClick={reset}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Thử lại
        </button>
      </div>
    </div>
  );
} 