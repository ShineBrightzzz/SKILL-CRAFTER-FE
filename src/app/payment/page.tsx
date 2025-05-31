'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function PaymentPage() {  const searchParams = useSearchParams();
  const totalAmount = searchParams.get('total');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    if (totalAmount) {      // VietQR parameters
      const bankId = '970436'; // Example: VCB bank ID
      const accountNo = '1234567890'; // Replace with your actual account number
      const accountName = 'BAV ITDE'; // Replace with your actual account name
      const amount = totalAmount;
      const content = 'Payment for BAV ITDE courses';

      // Generate VietQR URL using Quick Link format
      const vietQrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact.png?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(accountName)}`;
      setQrCodeUrl(vietQrUrl);
    }
  }, [totalAmount]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Thanh toán khóa học
          </h1>

          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Quét mã QR để thanh toán
              </h2>
              <p className="text-gray-600 mb-4">
                Sử dụng ứng dụng ngân hàng để quét mã QR bên dưới
              </p>
              {qrCodeUrl && (
                <div className="flex justify-center mb-4">
                  <div className="relative w-64 h-64">
                    <Image
                      src={qrCodeUrl}
                      alt="VietQR Payment Code"
                      fill
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                </div>
              )}              <div className="text-sm text-gray-500 mt-4">
                <p>Số tiền: {new Intl.NumberFormat('vi-VN').format(Number(totalAmount))}đ</p>
                <p className="mt-1">Nội dung chuyển khoản: Payment for BAV ITDE courses</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-center space-x-4">
                <Link
                  href="/cart"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Quay lại giỏ hàng
                </Link>
                <Link
                  href="/learning"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Đi đến khóa học
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
