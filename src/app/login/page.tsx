'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useLazyGetUserInfoQuery, useLoginMutation } from '@/services/user.service';
import { useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/slices/userSlice';
import { setAbility } from '@/store/slices/abilitySlice';

export default function Login() {
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchUserInfo] = useLazyGetUserInfoQuery();
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Ngăn chặn submit nhiều lần
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    const formData = new FormData(event.target as HTMLFormElement);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    try {
      const data = await login({ username, password }).unwrap();
      const user = await fetchUserInfo({ userId : username }).unwrap();
      
      if (!user) {
        console.log('Error', 'Không tìm thấy người dùng');
        setIsSubmitting(false);
        return;
      }
      dispatch(setUser({
        ...user.data,
        isAuthenticated: true
      }));
      dispatch(setAbility(data?.data?.role?.permissions || []));
      window.location.href = '/';
    } catch (err: any) {
      setError('Tên đăng nhập hoặc mật khẩu không hợp lệ');
      console.error('Đăng nhập thất bại:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen px-4 sm:px-2" style={{ backgroundColor: "#f8f9fa" }}>
      <div className="p-4 shadow-lg rounded w-full sm:max-w-sm md:max-w-md">
        <div className="flex justify-center mb-4">
          <Image 
            src="/logo.png" 
            alt="Logo Học viện Ngân hàng" 
            width={150} 
            height={150}
            priority
          />
        </div>
        <h2 className="text-center mb-4 text-xl font-bold">Đăng Nhập</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="block mb-1">Tên đăng nhập</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded" 
              id="username" 
              name="username"
              placeholder="Nhập tên đăng nhập"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="block mb-1">Mật khẩu</label>
            <input 
              type="password" 
              className="w-full p-2 border rounded" 
              id="password" 
              name="password"
              placeholder="Nhập mật khẩu"
              required
            />
          </div>
          <div className="mb-3 flex items-center">
            <input type="checkbox" className="mr-2" id="rememberMe" />
            <label className="text-sm" htmlFor="rememberMe">Ghi nhớ đăng nhập</label>
          </div>
          <button 
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            disabled={isLoading || isSubmitting}
          >
            {isLoading || isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
          {error && <p className="text-red-500 mt-2 text-sm text-center">{error}</p>}
        </form>
      </div>
    </div>
  );
}
