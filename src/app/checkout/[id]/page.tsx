'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGetCourseByIdQuery } from '@/services/course.service';
import { useAuth } from '@/store/hooks';
import { Spin } from 'antd';
import Image from 'next/image';

export default function CheckoutPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch course data
  const { data: courseData, isLoading: courseLoading } = useGetCourseByIdQuery(params.id);
  const course = courseData?.data;
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('vietqr');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  // Handle course payment
  const handlePayment = async () => {
    setIsProcessing(true);
    // TODO: Implement payment integration here
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      router.push(`/learning/${params.id}`);
    } catch (error) {
      console.error('Payment error:', error);
      setIsProcessing(false);
    }
  };

  // Handle promo code
  const handleApplyPromoCode = () => {
    // TODO: Implement promo code validation
    if (promoCode) {
      // Simulate promo code validation
      setDiscount(50000); // Example discount amount
    }
  };

  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
    }
  }, [currentUser, router]);

  if (courseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-red-600">Không tìm thấy thông tin khóa học</p>
      </div>
    );
  }

  return (    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-6 px-8">
            <h1 className="text-2xl font-bold text-white">Thanh toán khóa học</h1>
          </div>

          {/* Course Info */}
          <div className="p-8 border-b">
            <div className="flex items-start space-x-6">
              {course.imageUrl && (
                <div className="flex-shrink-0">
                  <Image
                    src={course.imageUrl}
                    alt={course.title}
                    width={120}
                    height={80}
                    className="rounded-lg object-cover shadow"
                  />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">{course.title}</h2>
                <p className="mt-1 text-sm text-gray-500">{course.description}</p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {course.categoryName || 'Khóa học'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Promo Code */}
          <div className="p-6 border-b">
            <div className="flex space-x-4">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Nhập mã giảm giá"
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleApplyPromoCode}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                  transition-colors"
              >
                Áp dụng
              </button>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Phương thức thanh toán</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div 
                className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-all
                  ${selectedPaymentMethod === 'vietqr' ? 'border-blue-500 bg-blue-50' : 'hover:border-blue-200'}`}
                onClick={() => setSelectedPaymentMethod('vietqr')}
              >
                <Image src="/VietQR.png" alt="VietQR" width={60} height={60} />
                <span className="mt-2 text-sm font-medium">VietQR</span>
              </div>

              <div 
                className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-all
                  ${selectedPaymentMethod === 'shopeepay' ? 'border-blue-500 bg-blue-50' : 'hover:border-blue-200'}`}
                onClick={() => setSelectedPaymentMethod('shopeepay')}
              >
                <Image src="/ShopeePay.png" alt="Shopee Pay" width={60} height={60} />
                <span className="mt-2 text-sm font-medium">Shopee Pay</span>
              </div>

              <div 
                className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-all
                  ${selectedPaymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'hover:border-blue-200'}`}
                onClick={() => setSelectedPaymentMethod('card')}
              >
                <Image src="/BankCard.png" alt="Thẻ ATM" width={60} height={60} />
                <span className="mt-2 text-sm font-medium">Thẻ nội địa</span>
              </div>

              <div 
                className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-all
                  ${selectedPaymentMethod === 'mobilebanking' ? 'border-blue-500 bg-blue-50' : 'hover:border-blue-200'}`}
                onClick={() => setSelectedPaymentMethod('mobilebanking')}
              >
                <Image src="/MobileBanking.png" alt="Mobile Banking" width={60} height={60} />
                <span className="mt-2 text-sm font-medium">Mobile Banking</span>
              </div>

              <div 
                className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-all
                  ${selectedPaymentMethod === 'intcard' ? 'border-blue-500 bg-blue-50' : 'hover:border-blue-200'}`}
                onClick={() => setSelectedPaymentMethod('intcard')}
              >
                <Image src="/IntCard.png" alt="Thẻ quốc tế" width={60} height={60} />
                <span className="mt-2 text-sm font-medium">Thẻ quốc tế</span>
              </div>

              <div 
                className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-all
                  ${selectedPaymentMethod === 'vnpay' ? 'border-blue-500 bg-blue-50' : 'hover:border-blue-200'}`}
                onClick={() => setSelectedPaymentMethod('vnpay')}
              >
                <Image src="/VNPay.png" alt="VNPay" width={60} height={60} />
                <span className="mt-2 text-sm font-medium">VNPay</span>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="p-6 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin thanh toán</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Giá gốc</span>
                <span>{new Intl.NumberFormat('vi-VN').format(course.price || 0)} VNĐ</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Giảm giá</span>
                  <span className="text-green-600">-{new Intl.NumberFormat('vi-VN').format(discount)} VNĐ</span>
                </div>
              )}
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center text-lg font-medium">
                  <span>Tổng thanh toán</span>
                  <span className="text-blue-600">{new Intl.NumberFormat('vi-VN').format((course.price || 0) - discount)} VNĐ</span>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full mt-6 bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <Spin size="small" />
                  <span className="ml-2">Đang xử lý...</span>
                </div>
              ) : (
                'Thanh toán ngay'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
