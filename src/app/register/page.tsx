'use client';

import { useRouter } from "next/navigation";
import { useRegisterMutation } from '@/services/auth.service';
import { toast } from 'react-toastify';
import React, { useState, useEffect } from 'react';

export default function Register() {
  const router = useRouter();
  const [register, { isLoading }] = useRegisterMutation();
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordMessage, setPasswordMessage] = useState('');

  // Kiểm tra độ mạnh của mật khẩu
  const checkPasswordStrength = (password: string) => {
    // Khởi tạo điểm
    let strength = 0;
    
    // Nếu mật khẩu trống
    if (password.length === 0) {
      setPasswordStrength(0);
      setPasswordMessage('');
      return;
    }
    
    // Nếu độ dài mật khẩu < 6, trả về 0
    if (password.length < 6) {
      setPasswordStrength(1);
      setPasswordMessage('Yếu - Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    
    // Nếu độ dài mật khẩu >= 6, +1 điểm
    if (password.length >= 6) strength += 1;
    
    // Nếu độ dài mật khẩu >= 8, +1 điểm
    if (password.length >= 8) strength += 1;
    
    // Nếu có ít nhất 1 chữ số, +1 điểm
    if (/\d/.test(password)) strength += 1;
    
    // Nếu có ít nhất 1 ký tự đặc biệt, +1 điểm
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
    
    // Nếu có ít nhất 1 chữ cái viết hoa, +1 điểm
    if (/[A-Z]/.test(password)) strength += 1;
    
    // Nếu có ít nhất 1 chữ cái viết thường, +1 điểm
    if (/[a-z]/.test(password)) strength += 1;
    
    // Thiết lập thông báo dựa trên điểm
    let message = '';
    if (strength <= 2) {
      message = 'Yếu - Thêm chữ hoa, chữ thường, số và ký tự đặc biệt';
    } else if (strength <= 4) {
      message = 'Trung bình - Cải thiện bằng cách thêm chữ hoa, số hoặc ký tự đặc biệt';
    } else {
      message = 'Mạnh - Mật khẩu đủ an toàn';
    }
    
    setPasswordStrength(strength);
    setPasswordMessage(message);
  };

  // Cập nhật độ mạnh mật khẩu khi mật khẩu thay đổi
  useEffect(() => {
    checkPasswordStrength(password);
  }, [password]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const username = formData.get('username') as string;
    const formPassword = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const email = formData.get('email') as string;
    const familyName = formData.get('familyName') as string;
    const givenName = formData.get('givenName') as string;

    // Kiểm tra độ mạnh mật khẩu
    if (passwordStrength <= 2) {
      setError('Mật khẩu quá yếu. Vui lòng sử dụng mật khẩu mạnh hơn.');
      return;
    }

    if (formPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }    
    
    try {
      setError(''); // Clear previous errors
      
      await register({ 
        username, 
        password: formPassword, 
        email,
        familyName,
        givenName
      }).unwrap();

      toast.success('Đăng ký thành công!');
      router.push(`/verification-pending?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.data?.message || 'Có lỗi xảy ra trong quá trình đăng ký');
      toast.error(error.data?.message || 'Có lỗi xảy ra trong quá trình đăng ký');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen px-4 bg-gradient-to-b from-gray-100 to-gray-200 relative overflow-hidden">
      {/* Decorative elements for background - more subtle */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute w-96 h-96 bg-blue-100 opacity-20 rounded-full -top-20 -left-20"></div>
        <div className="absolute w-80 h-80 bg-blue-100 opacity-20 rounded-full bottom-0 right-0"></div>
      </div>
      
      <div className="bg-white p-8 rounded-xl shadow-lg w-full sm:max-w-md md:max-w-lg z-10 border border-gray-100 transition-all duration-300 hover:shadow-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">Đăng ký tài khoản</h1>
          <div className="h-1 w-16 bg-blue-500 mx-auto rounded-full mb-4"></div>
          <p className="text-gray-600 text-base">Tạo tài khoản để trở thành thành viên</p>
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
              />
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="familyName" className="block text-gray-700 font-medium">Họ</label>
            <div className="relative">
              <input 
                type="text" 
                className="w-full p-3 pl-10 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 placeholder-gray-400 transition-all" 
                id="familyName" 
                name="familyName"
                placeholder="Nhập họ của bạn"
              />
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="givenName" className="block text-gray-700 font-medium">Tên</label>
            <div className="relative">
              <input 
                type="text" 
                className="w-full p-3 pl-10 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 placeholder-gray-400 transition-all" 
                id="givenName" 
                name="givenName"
                placeholder="Nhập tên của bạn"
              />
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="email" className="block text-gray-700 font-medium">Email</label>
            <div className="relative">
              <input 
                type="email" 
                className="w-full p-3 pl-10 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 placeholder-gray-400 transition-all" 
                id="email" 
                name="email"
                placeholder="Nhập địa chỉ email"
                required
              />
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">            <label htmlFor="password" className="block text-gray-700 font-medium">Mật khẩu</label>
            <div className="relative">
              <input 
                type="password" 
                className="w-full p-3 pl-10 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 placeholder-gray-400 transition-all" 
                id="password" 
                name="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            {password.length > 0 && (
              <div className="mt-2">
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      passwordStrength <= 2 ? 'bg-red-500' : 
                      passwordStrength <= 4 ? 'bg-yellow-500' : 'bg-green-500'
                    }`} 
                    style={{ width: `${(passwordStrength / 6) * 100}%` }}
                  ></div>
                </div>
                <p className={`text-xs mt-1 ${
                  passwordStrength <= 2 ? 'text-red-500' : 
                  passwordStrength <= 4 ? 'text-yellow-500' : 'text-green-500'
                }`}>
                  {passwordMessage}
                </p>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-gray-700 font-medium">Xác nhận mật khẩu</label>
            <div className="relative">
              <input 
                type="password" 
                className="w-full p-3 pl-10 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 placeholder-gray-400 transition-all" 
                id="confirmPassword" 
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu"
                required
              />
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 p-3 rounded-lg border border-red-200 text-red-600 text-center">
              <p>{error}</p>
            </div>
          )}
          
          <button 
            type="submit"
            className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg shadow hover:bg-blue-700 transition-all duration-300 disabled:opacity-70 disabled:bg-blue-400"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý...
              </span>
            ) : 'Đăng ký'}
          </button>
          
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Đã có tài khoản? <a href="/login" className="text-blue-600 font-medium hover:underline">Đăng nhập</a>
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
