import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Providers from '../providers/Providers';
import AuthGuard from '@/components/AuthGuard';

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
  return (
    <>
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <AuthGuard>
            {children}
          </AuthGuard>
        </Providers>
      </body>
    </html>
    
    <ToastContainer />
    </>
  );
}