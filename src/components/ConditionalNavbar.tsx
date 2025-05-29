'use client'

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();
  
  // Danh sách các đường dẫn không hiển thị Navbar
  const hiddenNavbarPaths = ['/login', '/register'];
  const isHiddenPath = hiddenNavbarPaths.includes(pathname || '');
  const isAdminPage = pathname?.startsWith('/admin');

  if (isAdminPage || isHiddenPath) {
    return null;
  }

  return <Navbar />;
}
