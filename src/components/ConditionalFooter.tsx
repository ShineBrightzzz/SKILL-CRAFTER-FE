'use client'

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  const isLearningPage = pathname?.includes('/learning');

  if (isLearningPage) {
    return null;
  }

  return <Footer />;
}
