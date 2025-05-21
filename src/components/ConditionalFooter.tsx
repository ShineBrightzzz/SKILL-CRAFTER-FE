'use client'

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  const isLearningPage = pathname?.includes('/learning');
  const isAdminPage = pathname?.startsWith('/admin');

  // Ẩn footer cho cả trang learning và trang admin
  if (isLearningPage || isAdminPage) {
    return null;
  }

  return <Footer />;
}
