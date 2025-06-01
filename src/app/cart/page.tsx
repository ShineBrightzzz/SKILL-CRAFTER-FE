'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/store/hooks';
import { useGetCartByUserIdQuery, useRemoveFromCartMutation, CartItem } from '@/services/cart.service';
import { useCreatePaymentMutation } from '@/services/payment.service';
import { skipToken } from '@reduxjs/toolkit/query';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function CartPage() {
  const { user } = useAuth();
  const { data: cartData, isLoading, error } = useGetCartByUserIdQuery(
    user?.id ?? skipToken
  );
  const [removeFromCart, { isLoading: isRemoving }] = useRemoveFromCartMutation();
  const [createPayment, { isLoading: isCreatingPayment }] = useCreatePaymentMutation();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (cartData?.data) {
      setCartItems(cartData.data);
      // Initialize all items as selected
      const newSelected = new Set(cartData.data.map(item => item.id));
      setSelectedItems(newSelected);
      
      // Calculate total price based on selected items
      calculateTotalPrice(cartData.data, newSelected);
    }
  }, [cartData]);

  const calculateTotalPrice = (items: CartItem[], selected: Set<string>) => {
    const total = items
      .filter(item => selected.has(item.id))
      .reduce((sum, item) => sum + (item.price || 0), 0);
    setTotalPrice(total);
  };

  const handleSelectItem = (itemId: string, isChecked: boolean) => {
    const newSelected = new Set(selectedItems);
    
    if (isChecked) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    
    setSelectedItems(newSelected);
    calculateTotalPrice(cartItems, newSelected);
  };

  const handleSelectAll = (isChecked: boolean) => {
    if (isChecked) {
      const allIds = new Set(cartItems.map(item => item.id));
      setSelectedItems(allIds);
      calculateTotalPrice(cartItems, allIds);
    } else {
      setSelectedItems(new Set());
      setTotalPrice(0);
    }
  };

  const isAllSelected = cartItems.length > 0 && selectedItems.size === cartItems.length;

  const handleRemoveFromCart = async (courseId: string) => {
    if (!user) return;

    try {
      await removeFromCart({
        userId: user.id,
        courseId: courseId
      }).unwrap();
      toast.success('Đã xóa khóa học khỏi giỏ hàng');
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      toast.error('Có lỗi xảy ra khi xóa khóa học khỏi giỏ hàng');
    }
  };  // Create payment URL with total amount
  const handlePayment = async () => {
    if (selectedItems.size === 0) return;

    try {      // Create an array of course IDs from selected items
      const courseIds = cartItems
        .filter(item => selectedItems.has(item.id))
        .map(item => item.courseId);
      console.log('Selected course IDs:', courseIds);
      console.log('Total price:', totalPrice);  
      const response = await createPayment({
          courseIds: courseIds, // Send array of course IDs
          amount: totalPrice,
          locale: 'vn'
      }).unwrap();
      

      if (response.success && response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      } else {
        toast.error('Có lỗi xảy ra khi tạo giao dịch thanh toán');
      }
    } catch (error) {
      console.error('Failed to create payment:', error);
      toast.error('Có lỗi xảy ra khi tạo giao dịch thanh toán');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Giỏ hàng</h1>
            <p className="mt-4 text-lg text-gray-600">
              Vui lòng đăng nhập để xem giỏ hàng của bạn.
            </p>
            <div className="mt-8">
              <Link
                href="/login"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition"
              >
                Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Giỏ hàng</h1>
            <p className="mt-4 text-lg text-gray-600">
              Đang tải thông tin giỏ hàng...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Giỏ hàng</h1>
            <p className="mt-4 text-lg text-red-600">
              Có lỗi xảy ra khi tải thông tin giỏ hàng.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Giỏ hàng của tôi</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-lg text-gray-600 mb-6">Giỏ hàng của bạn đang trống</p>
            <Link
              href="/learning"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition"
            >
              Khám phá khóa học
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Cart Header with Select All option */}
            <div className="md:col-span-2 bg-white rounded-lg shadow p-4 mb-4 flex items-center">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="selectAll"
                  checked={isAllSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="selectAll" className="ml-2 text-gray-700 font-medium">
                  Chọn tất cả ({selectedItems.size}/{cartItems.length})
                </label>
              </div>
            </div>
            
            {/* Placeholder for select all alignment */}
            <div className="hidden md:block"></div>
            
            {/* Cart Items - Left Side */}
            <div className="md:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow flex overflow-hidden">
                  <div className="p-4 flex items-center">
                    <input
                      type="checkbox"
                      id={`item-${item.id}`}
                      checked={selectedItems.has(item.id)}
                      onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                      className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </div>
                  <div className="w-48 h-32 relative flex-shrink-0">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.courseTitle}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        <Link href={`/course-detail/${item.courseId}`} className="hover:text-blue-600">
                          {item.courseTitle}
                        </Link>
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Thêm vào lúc: {new Date(item.addedAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-lg font-bold text-blue-700">
                        {new Intl.NumberFormat('vi-VN').format(item.price || 0)}đ
                      </span>
                      <button
                        onClick={() => handleRemoveFromCart(item.courseId)}
                        disabled={isRemoving}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary - Right Side */}
            <div className="bg-white rounded-lg shadow p-6 h-fit">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Tổng đơn hàng</h2>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Khóa học đã chọn</span>
                  <span className="font-medium">{selectedItems.size}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="font-medium">{new Intl.NumberFormat('vi-VN').format(totalPrice)}đ</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Giảm giá</span>
                  <span className="font-medium">0đ</span>
                </div>
                <div className="border-t border-gray-200 my-4 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Tổng cộng</span>
                    <span className="text-xl font-bold text-blue-700">{new Intl.NumberFormat('vi-VN').format(totalPrice)}đ</span>
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    onClick={handlePayment}
                    disabled={selectedItems.size === 0 || isCreatingPayment}
                    className={`w-full block text-center ${
                      selectedItems.size > 0 && !isCreatingPayment
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-gray-400 cursor-not-allowed'
                    } text-white py-3 px-4 rounded-md font-medium transition`}
                  >
                    {isCreatingPayment
                      ? 'Đang xử lý...'
                      : selectedItems.size > 0
                      ? 'Thanh toán'
                      : 'Vui lòng chọn khóa học'}
                  </button>
                  <Link
                    href="/learning"
                    className="w-full block text-center mt-4 border border-gray-300 text-gray-700 py-3 px-4 rounded-md font-medium hover:bg-gray-50 transition"
                  >
                    Tiếp tục mua sắm
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
