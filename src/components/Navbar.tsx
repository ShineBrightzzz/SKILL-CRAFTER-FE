'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import MobileNav from './MobileNav';
import { useAuth } from '@/store/hooks';
import Image from 'next/image';
import { Badge } from 'antd';
import { QuestionCircleOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import NotificationDropdown from './NotificationDropdown';
import { useGetCartByUserIdQuery } from '@/services/cart.service';
import { skipToken } from '@reduxjs/toolkit/query';
import { useAbility } from '@/store/hooks/abilityHooks';
import { Action, Subject } from '@/utils/ability';

const navigation = [
  { name: 'Trang chủ', href: '/' },
  { name: 'Khóa học', href: '/learning' },
  { name: 'Blog', href: '/blog' },
];

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ability = useAbility();
  
  // Check if user can create courses
  const canCreateCourse = ability.can(Action.Create, Subject.Course);
  
  // Fetch cart data to display cart item count
  const { data: cartData } = useGetCartByUserIdQuery(
    user?.id ?? skipToken
  );
  
  const cartItemCount = cartData?.data?.length || 0;
  
  // Handle hydration mismatch by only rendering user-dependent UI after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Function to get display name
  const getDisplayName = () => {
    if (user?.familyName && user?.givenName) {
      return `${user.familyName} ${user.givenName}`;
    }
    return user?.username || '';
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">              
            <Image 
                src="/logo.svg" 
                alt="Logo" 
                width={32} 
                height={32}
                className="mr-2"
              />
              <span className="text-xl font-bold text-white">Skill Crafter</span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-white hover:text-blue-200 transition font-medium"
                >
                  {item.name}
                </Link>
              ))}
                {mounted && user && canCreateCourse && (
                <Link
                  href="/instructor"
                  className="text-white hover:text-blue-200 transition font-medium"
                >
                  Quản lí khóa học
                </Link>
              )}
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {!mounted ? (
              // Show empty placeholder during server-side rendering to avoid hydration mismatch
              <div className="w-20"></div>
            ) : !user ? (
              <>
                <Link
                  href="/login"
                  className="text-white hover:text-blue-200 transition"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="bg-white text-blue-700 px-4 py-2 rounded-md hover:bg-blue-50 transition font-medium"
                >
                  Đăng ký
                </Link>
              </>            ) : (
              <div className="flex items-center space-x-5">                <div className="hover:text-blue-200 transition">
                  <NotificationDropdown />
                </div>
                <Link href="/cart">
                  <Badge count={cartItemCount} size="small">
                    <ShoppingCartOutlined 
                      className="text-white text-xl cursor-pointer hover:text-blue-200" 
                    />
                  </Badge>
                </Link>
                <QuestionCircleOutlined 
                  className="text-white text-xl cursor-pointer hover:text-blue-200"
                />
                <div className="relative">                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-white hover:text-blue-200 transition"                  >                    {user.pictureUrl ? (
                      <Image
                        src={user.pictureUrl}
                        alt={getDisplayName()}
                        width={32}
                        height={32}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-700">
                        {getDisplayName().charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-medium">{getDisplayName()}</span>
                    <svg
                      className={`h-4 w-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 z-10">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Thông tin cá nhân
                      </Link>                      <Link
                        href="/transaction-history"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Lịch sử giao dịch
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <MobileNav />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
