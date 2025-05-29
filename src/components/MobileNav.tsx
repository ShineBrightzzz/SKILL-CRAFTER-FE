'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/store/hooks';

const navigation = [
  { name: 'Trang chủ', href: '/' },
  { name: 'Khóa học', href: '/learning' },
  { name: 'Lộ trình', href: '/paths' },
  { name: 'Blog', href: '/blog' },
];

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Function to get display name
  const getDisplayName = () => {
    if (user?.family_name && user?.given_name) {
      return `${user.family_name} ${user.given_name}`;
    }
    return user?.username || '';
  };
  // Return a consistent initial UI structure to prevent hydration errors
  return (
    <div className="md:hidden">
      {/* Hamburger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-white hover:text-blue-200 focus:outline-none"
        aria-label="Toggle menu"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>
      
      {/* Mobile menu - only render when mounted to avoid hydration errors */}
      {isOpen && isMounted && (        <div 
          className="fixed top-0 left-0 right-0 z-50 bg-white animate-fadeIn" 
          style={{ 
            height: 'auto',
            maxHeight: 'min(calc(100vh - 60px), 600px)',
            overflowY: 'auto',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            borderBottomLeftRadius: '12px',
            borderBottomRightRadius: '12px'
          }}
        >
          {/* Close button at the top right */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-blue-600">Menu</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Đóng menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="px-4 py-3">            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block text-gray-700 hover:text-blue-600 transition py-3 px-2 rounded-md hover:bg-blue-50 font-medium"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            <div className="py-3 border-t border-gray-200 mt-2">
              {!user ? (
                <>
                  <Link
                    href="/login"
                    className="block text-gray-600 hover:text-blue-600 transition py-3 px-2 rounded-md hover:bg-gray-50"
                    onClick={() => setIsOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                  
                  <Link
                    href="/register"
                    className="block bg-blue-600 text-white px-4 py-3 my-2 rounded-md hover:bg-blue-700 transition text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Đăng ký
                  </Link>
                </>
              ) : (
                <>
                  <div className="block text-gray-700 font-medium py-2 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      {getDisplayName().charAt(0).toUpperCase()}
                    </div>
                    <span>{getDisplayName()}</span>
                  </div>
                  
                  <Link
                    href="/profile"
                    className="block text-gray-600 hover:text-blue-600 transition py-3 px-2 rounded-md hover:bg-gray-50 mt-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Thông tin cá nhân
                  </Link>
                  
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="block w-full text-left text-gray-600 hover:text-blue-600 transition py-3 px-2 rounded-md hover:bg-gray-50"
                  >
                    Đăng xuất
                  </button>
                </>
              )}
            </div>
            
            {/* Unified close button at the bottom */}
            <div className="pt-2 pb-3">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
                Đóng menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}