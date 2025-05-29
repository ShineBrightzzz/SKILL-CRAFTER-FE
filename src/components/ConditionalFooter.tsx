'use client'

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  const isLearningPage = pathname?.includes('/learning');
  const isAdminPage = pathname?.startsWith('/admin');
  
  // Danh sách các đường dẫn không hiển thị Footer
  const hiddenFooterPaths = ['/login', '/register'];
  const isHiddenPath = hiddenFooterPaths.includes(pathname || '');

  // Ẩn footer cho cả trang learning, trang admin và các trang trong danh sách ẩn
  if (isLearningPage || isAdminPage || isHiddenPath) {
    return null;
  }

  return <Footer />;
}
