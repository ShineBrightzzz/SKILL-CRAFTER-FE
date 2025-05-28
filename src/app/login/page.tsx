'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLoginMutation } from '@/services/user.service';
import { useGoogleAuthMutation } from '@/services/google-auth.service';
import { useAuth } from '@/store/hooks';
import { toast } from 'react-toastify';
import ReCAPTCHA from "react-google-recaptcha";
import { GoogleLogin } from '@react-oauth/google';

interface LoginAttempts {
  count: number;
  timestamp: number;
}

export default function Login() {
  const [login, { isLoading: apiLoading }] = useLoginMutation();
  const [googleAuth] = useGoogleAuthMutation();
  const router = useRouter();  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);  const RESET_DURATION = 3600000; // 1 giờ tính bằng milliseconds

  // Kiểm tra và load số lần đăng nhập thất bại khi component mount
  useEffect(() => {
    const storedData = localStorage.getItem('loginAttempts');
    if (storedData) {
      const data: LoginAttempts = JSON.parse(storedData);
      const now = Date.now();
      
      // Reset nếu đã qua RESET_DURATION
      if (now - data.timestamp > RESET_DURATION) {
        localStorage.removeItem('loginAttempts');
        setFailedAttempts(0);
        setShowCaptcha(false);
      } else {
        setFailedAttempts(data.count);
        if (data.count >= 3) {
          setShowCaptcha(true);
        }
      }
    }
  }, []);

  // Cập nhật localStorage khi có đăng nhập thất bại
  const updateFailedAttempts = (count: number) => {
    const attempts: LoginAttempts = {
      count,
      timestamp: Date.now()
    };
    localStorage.setItem('loginAttempts', JSON.stringify(attempts));
    setFailedAttempts(count);

    // Hiện captcha nếu số lần thất bại >= 3
    if (count >= 3) {
      setShowCaptcha(true);
    }
  };

  const handleCaptchaChange = (value: string | null) => {
    setCaptchaValue(value);
  };
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting) return;
    
    // Kiểm tra captcha nếu cần thiết
    if (showCaptcha && !captchaValue) {
      setError('Vui lòng xác nhận Captcha');
      return;
    }
    
    setIsSubmitting(true);
    const formData = new FormData(event.target as HTMLFormElement);
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    try {
      const response = await login({ 
        username, 
        email,
        password,
        recaptchaToken: captchaValue
      }).unwrap();

      if (!response) {
        const newAttempts = failedAttempts + 1;
        updateFailedAttempts(newAttempts);
        setError('Tên đăng nhập hoặc mật khẩu không hợp lệ');
        setIsSubmitting(false);
        return;
      }

      // Xóa thông tin đăng nhập thất bại khi đăng nhập thành công
      localStorage.removeItem('loginAttempts');
      setFailedAttempts(0);
      router.replace('/');
    } catch (err: any) {
      const newAttempts = failedAttempts + 1;
      updateFailedAttempts(newAttempts);
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
            <label htmlFor="email" className="block mb-1">Email</label>
            <input 
              type="email" 
              className="w-full p-2 border rounded" 
              id="email" 
              name="email"
              placeholder="Nhập địa chỉ email"
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
          {showCaptcha && (
            <div className="mb-4 flex justify-center">
              <ReCAPTCHA
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
                onChange={handleCaptchaChange}
              />
            </div>
          )}          <button 
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mb-3"
            disabled={apiLoading || isSubmitting || (showCaptcha && !captchaValue)}
          >
            {apiLoading || isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
          
          <div className="flex justify-center mt-4 mb-3">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  console.log('Google login response:', credentialResponse);
                  
                  if (credentialResponse.credential) {
                    // Send ID token directly to backend
                    await googleAuth({
                      idToken: credentialResponse.credential,
                      // Note: email and name are already included in the JWT, backend will decode them
                    }).unwrap();
                    
                    // Reset failed attempts on successful login
                    localStorage.removeItem('loginAttempts');
                    setFailedAttempts(0);
                    
                    // Redirect to home page
                    router.replace('/');
                  }
                } catch (err) {
                  console.error('Google login failed:', err);
                  toast.error('Đăng nhập với Google thất bại');
                }
              }}
              onError={() => {
                console.error('Google login failed');
                toast.error('Đăng nhập với Google thất bại');
              }}
              useOneTap
              locale="vi"
              text="signin_with"
              theme="outline"
              shape="rectangular"
              logo_alignment="center"
              width="240"
            />
          </div>
          
          {error && <p className="text-red-500 mt-2 text-sm text-center">{error}</p>}
        </form>
      </div>
    </div>
  );
}
