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
      className="flex justify-center items-center min-h-screen px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "#f8f9fa" }}
    >
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Xác thực email</h2>
          <p className="text-gray-600 mb-6">
            Chúng tôi đã gửi email xác thực đến địa chỉ {email}. Vui lòng kiểm tra hộp thư và nhấp vào liên kết xác thực để kích hoạt tài khoản của bạn.
          </p>
          
          <Button
            type="primary"
            onClick={handleResendVerification}
            disabled={isLoading || resendTimer > 0}
            className="w-full mb-4"
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
            className="text-blue-500 hover:text-blue-600 font-medium"
          >
            Quay lại đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
}
