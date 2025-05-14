'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';

const navigation = [
  { name: 'Trang chủ', href: '/' },
  { name: 'Khóa học', href: '/learning' },
  { name: 'Lộ trình', href: '/paths' },
  { name: 'Blog', href: '/blog' },
];

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="md:hidden">
      {/* Hamburger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-600 hover:text-blue-600 focus:outline-none"
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

      {/* Mobile menu */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white animate-fadeIn">
          <div className="pt-16 px-4 space-y-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block text-gray-600 hover:text-blue-600 transition py-2"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-gray-200 space-y-4">
              <Link
                href="/login"
                className="block text-gray-600 hover:text-blue-600 transition py-2"
                onClick={() => setIsOpen(false)}
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-center"
                onClick={() => setIsOpen(false)}
              >
                Đăng ký
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 