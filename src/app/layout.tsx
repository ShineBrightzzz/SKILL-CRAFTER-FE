import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Providers from '../providers/Providers';
import AuthGuard from '@/components/AuthGuard';
import { useMediaQuery } from 'react-responsive';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'BAV Score',
  description: 'Banking Academy of Vietnam Score Management System',
  icons: {
    icon: '/HVNH.svg',
    apple: '/HVNH.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  return (
    <>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          style={{ fontSize: isMobile ? '14px' : '16px' }}
        >
          <Providers>
            <AuthGuard>{children}</AuthGuard>
          </Providers>
        </body>
      </html>

      <ToastContainer />
    </>
  );
}