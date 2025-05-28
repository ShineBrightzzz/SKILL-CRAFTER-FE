'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useVerifyEmailMutation } from '@/services/email.service';
import { toast } from 'react-toastify';
import { Spin } from 'antd';

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [verificationAttempted, setVerificationAttempted] = useState(false);
  
  const [verifyEmail] = useVerifyEmailMutation();

  useEffect(() => {
    const verify = async () => {
      if (!token || verificationAttempted) return;

      try {
        await verifyEmail({ token }).unwrap();
        toast.success('Email đã được xác thực thành công');
        router.push('/login');
      } catch (error: any) {
        console.error('Email verification error:', error);
        toast.error(error.data?.message || 'Có lỗi xảy ra khi xác thực email');
      } finally {
        setVerificationAttempted(true);
      }
    };

    verify();
  }, [token, router, verifyEmail, verificationAttempted]);

  if (!token) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Liên kết không hợp lệ</h2>
          <p className="text-gray-600">
            Liên kết xác thực này không hợp lệ hoặc đã hết hạn.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 text-blue-500 hover:text-blue-600 font-medium"
          >
            Quay lại đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <Spin size="large" />
        <p className="mt-4 text-gray-600">Đang xác thực email của bạn...</p>
      </div>
    </div>
  );
}
