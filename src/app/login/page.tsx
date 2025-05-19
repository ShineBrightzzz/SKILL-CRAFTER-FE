'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLoginMutation } from '@/services/user.service';
import { useAuth } from '@/store/hooks';
import { toast } from 'react-toastify';

export default function Login() {
  const [login, { isLoading: apiLoading }] = useLoginMutation();
  const { login: authLogin, loading: authLoading, error: authError } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    const formData = new FormData(event.target as HTMLFormElement);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    
    try {
      // Call API to login
      const response = await login({ username, password }).unwrap();
      
      if (!response || response.statusCode !== 200) {
        setError('Tên đăng nhập hoặc mật khẩu không hợp lệ');
        setIsSubmitting(false);
        return;
      }
      
      // Save user in Redux and localStorage
      const result = await authLogin(response);
      
      if (result.success) {
        // Show success message and redirect
        toast.success('Đăng nhập thành công!');
        router.push('/');
      } else {
        setError(result.error || 'Đăng nhập không thành công');
        setIsSubmitting(false);
      }
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
          </div>          <button 
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            disabled={apiLoading || authLoading || isSubmitting}
          >
            {apiLoading || authLoading || isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
          {error && <p className="text-red-500 mt-2 text-sm text-center">{error}</p>}
        </form>
      </div>
    </div>
  );
}
