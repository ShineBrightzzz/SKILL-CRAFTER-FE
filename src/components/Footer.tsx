'use client';

import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Skill Crafter</h3>
            <p className="text-gray-400">
              Nền tảng học lập trình trực tuyến với các khóa học chất lượng cao
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Khóa học</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/learning" className="text-gray-400 hover:text-white transition">
                  Frontend
                </Link>
              </li>
              <li>
                <Link href="/learning" className="text-gray-400 hover:text-white transition">
                  Backend
                </Link>
              </li>
              <li>
                <Link href="/learning" className="text-gray-400 hover:text-white transition">
                  Mobile
                </Link>
              </li>
              <li>
                <Link href="/learning" className="text-gray-400 hover:text-white transition">
                  DevOps
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Liên kết</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition">
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-white transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white transition">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Theo dõi chúng tôi</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                Facebook
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                Twitter
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                LinkedIn
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                YouTube
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Skill Crafter. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
