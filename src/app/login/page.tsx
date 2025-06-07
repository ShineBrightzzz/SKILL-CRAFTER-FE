'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLoginMutation } from '@/services/user.service';
import { useGoogleAuthMutation } from '@/services/google-auth.service';
import { useDispatch } from 'react-redux';
import { setAbility } from '@/store/slices/abilitySlice';
import { toast } from 'react-toastify';
import ReCAPTCHA from "react-google-recaptcha";
import { GoogleLogin } from '@react-oauth/google';

// Tạo CSS cho các hiệu ứng animation
const styles = {
  '@keyframes blob': {
    '0%': { transform: 'translate(0px, 0px) scale(1)' },
    '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
    '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
    '100%': { transform: 'translate(0px, 0px) scale(1)' }
  }
};

interface LoginAttempts {
  count: number;
  timestamp: number;
}

export default function Login() {
  const [login, { isLoading: apiLoading }] = useLoginMutation();
  const [googleAuth] = useGoogleAuthMutation();
  const router = useRouter();
  const dispatch = useDispatch();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  const RESET_DURATION = 3600000; // 1 giờ tính bằng milliseconds

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
    
    setIsSubmitting(true);    const formData = new FormData(event.target as HTMLFormElement);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    
    try {
      const response = await login({ 
        username,
        password,
        recaptchaToken: captchaValue
      }).unwrap();

      if (!response) {
        const newAttempts = failedAttempts + 1;
        updateFailedAttempts(newAttempts);
        setError('Tên đăng nhập hoặc mật khẩu không hợp lệ');
        setIsSubmitting(false);
        return;
      }      // Clear failed login attempts when login successful
      localStorage.removeItem('loginAttempts');
      setFailedAttempts(0);      
      if (response.data.isAdmin) {
        router.replace('/admin');
      } else {
        router.replace('/');
      }
    } catch (err: any) {
      const newAttempts = failedAttempts + 1;
      updateFailedAttempts(newAttempts);
      setError('Tên đăng nhập hoặc mật khẩu không hợp lệ');
      console.error('Đăng nhập thất bại:', err);
      setIsSubmitting(false);
    }
  };  return (
    <div className="flex justify-center items-center min-h-screen px-4 bg-gradient-to-b from-gray-100 to-gray-200 relative overflow-hidden">
      {/* Decorative elements for background - more subtle */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute w-96 h-96 bg-blue-100 opacity-20 rounded-full -top-20 -left-20"></div>
        <div className="absolute w-80 h-80 bg-blue-100 opacity-20 rounded-full bottom-0 right-0"></div>
      </div>
      
      <div className="bg-white p-8 rounded-xl shadow-lg w-full sm:max-w-md md:max-w-lg z-10 border border-gray-100 transition-all duration-300 hover:shadow-md">        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">Chào mừng trở lại</h1>
          <div className="h-1 w-16 bg-blue-500 mx-auto rounded-full mb-4"></div>
          <p className="text-gray-600 text-base">Đăng nhập để tiếp tục hành trình học tập</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="block text-gray-700 font-medium">Tên đăng nhập</label>
            <div className="relative">
              <input 
                type="text" 
                className="w-full p-3 pl-10 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 placeholder-gray-400 transition-all" 
                id="username" 
                name="username"
                placeholder="Nhập tên đăng nhập"
                required
              />              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
            <div className="space-y-2">
            <label htmlFor="password" className="block text-gray-700 font-medium">Mật khẩu</label>
            <div className="relative">
              <input 
                type="password"
                className="w-full p-3 pl-10 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 placeholder-gray-400 transition-all" 
                id="password" 
                name="password"
                placeholder="Nhập mật khẩu"
                required
              />
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <input 
              type="checkbox" 
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" 
              id="rememberMe" 
            />
            <label className="ml-2 text-sm text-gray-600" htmlFor="rememberMe">Ghi nhớ đăng nhập</label>
          </div>
          
          {showCaptcha && (
            <div className="flex justify-center p-2 bg-gray-50 rounded-lg border border-gray-200">
              <ReCAPTCHA
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
                onChange={handleCaptchaChange}
              />
            </div>
          )}
          
          <button 
            type="submit"
            className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg shadow hover:bg-blue-700 transition-all duration-300 disabled:opacity-70 disabled:bg-blue-400"
            disabled={apiLoading || isSubmitting || (showCaptcha && !captchaValue)}
          >            {apiLoading || isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang đăng nhập...
              </span>
            ) : 'Đăng nhập'}
          </button>
          
          <div className="relative flex items-center justify-center py-3">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-500">hoặc</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          
          <div className="flex justify-center">
            <div className="custom-google-button">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {                
                  try {
                    
                    if (credentialResponse.credential) {                      // Send ID token directly to backend
                      const response = await googleAuth({
                        idToken: credentialResponse.credential,
                        // Note: email and name are already included in the JWT, backend will decode them
                      }).unwrap();
                      
                      // Reset failed attempts on successful login
                      localStorage.removeItem('loginAttempts');
                      setFailedAttempts(0);
                 // Check if user is admin and redirect accordingly  
                      if (response.data.isAdmin) {
                        router.replace('/admin');
                      } else {
                        router.replace('/');
                      }
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
          </div>
          
          {error && (
            <div className="bg-red-50 p-3 rounded-lg border border-red-200 text-red-600 text-center mt-4">
              <p>{error}</p>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Chưa có tài khoản? <a href="../register" className="text-blue-600 font-medium hover:underline">Đăng ký</a>
            </p>
          </div>
        </form>
      </div>
      
      {/* Decorative circles - more subtle */}
      <div className="hidden lg:block absolute -bottom-16 -left-16 w-80 h-80 bg-blue-100 opacity-30 rounded-full filter blur-xl animate-blob"></div>
      <div className="hidden lg:block absolute -top-16 -right-16 w-80 h-80 bg-gray-100 opacity-30 rounded-full filter blur-xl animate-blob animation-delay-2000"></div>
    </div>
  );
}
