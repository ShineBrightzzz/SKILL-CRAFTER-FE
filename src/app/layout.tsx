import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/providers/Providers';
import ConditionalNavbar from '@/components/ConditionalNavbar';
import ConditionalFooter from '@/components/ConditionalFooter';
import AuthGuard from '@/components/AuthGuard';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CodeLearn - Học Lập Trình Trực Tuyến',
  description: 'Nền tảng học lập trình trực tuyến với các khóa học chất lượng cao',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {  return (
    <html lang="vi">
      <body className={inter.className}>
        <Providers>          
          <ConditionalNavbar />
          <AuthGuard>
            {children}
          </AuthGuard>
          <ConditionalFooter />
        </Providers>
      </body>
    </html>
  );
}