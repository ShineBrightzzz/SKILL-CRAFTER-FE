'use client';

import { useEffect } from 'react';
import ErrorHandler from '@/components/ErrorHandler';

export default function GlobalError({
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
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <ErrorHandler 
            status={500} 
            message="Đã xảy ra lỗi nghiêm trọng. Vui lòng thử lại sau."
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
      </body>
    </html>
  );
}
