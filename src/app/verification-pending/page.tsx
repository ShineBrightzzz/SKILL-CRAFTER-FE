'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useResendVerificationMutation } from '@/services/email.service';
import { toast } from 'react-toastify';
import { Button } from 'antd';

export default function VerificationPending() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [resendTimer, setResendTimer] = useState(0);
  
  const [resendVerification, { isLoading }] = useResendVerificationMutation();
  const handleResendVerification = async () => {
    if (resendTimer > 0) return;

    try {
      await resendVerification(email).unwrap();
      toast.success('Email xác thực đã được gửi lại');
      
      // Start a 60-second countdown
      setResendTimer(60);
      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (error: any) {
      console.error('Resend verification error:', error);
      toast.error(error.data?.message || 'Có lỗi xảy ra khi gửi lại email xác thực');
    }
  };
  return (
    <div
      className="flex justify-center items-center min-h-screen px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-100 to-gray-200"
    >
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Xác thực email</h2>
          <div className="h-1 w-16 bg-blue-500 mx-auto rounded-full mb-4"></div>
          
          <p className="text-gray-600 mb-6">
            Chúng tôi đã gửi email xác thực đến <span className="font-medium text-blue-600">{email}</span>. Vui lòng kiểm tra hộp thư và nhấp vào liên kết xác thực để kích hoạt tài khoản của bạn.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
            <p className="text-sm text-blue-700">
              <span className="font-semibold">Lưu ý:</span> Đôi khi email có thể bị chuyển vào thư mục Spam hoặc Quảng cáo. Vui lòng kiểm tra tất cả các thư mục nếu bạn không tìm thấy email trong hộp thư đến.
            </p>
          </div>
          
          <Button
            type="primary"
            onClick={handleResendVerification}
            disabled={isLoading || resendTimer > 0}
            className="w-full mb-4 h-10 bg-blue-600 hover:bg-blue-700"
          >
            {resendTimer > 0 
              ? `Gửi lại sau ${resendTimer}s` 
              : isLoading 
                ? 'Đang gửi...'
                : 'Gửi lại email xác thực'
            }
          </Button>

          <button
            onClick={() => router.push('/login')}
            className="text-blue-500 hover:text-blue-600 font-medium transition-colors"
          >
            Quay lại đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
}
