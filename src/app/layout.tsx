import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/providers/AuthProvider';
import { ReduxProvider } from '@/store/ReduxProvider';
import { ToastContainer } from 'react-toastify';
import ProgressBar from '@/components/ProgressBar';

import 'react-toastify/dist/ReactToastify.css';
import '@videojs/themes/dist/forest/index.css';
import './globals.css';
import Providers from '@/providers/Providers';
import ConditionalNavbar from '@/components/ConditionalNavbar';
import ConditionalFooter from '@/components/ConditionalFooter';
import AuthGuard from '@/components/AuthGuard';
import GoogleOAuthWrapper from '@/components/GoogleOAuthWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Skill Crafter - Học Lập Trình Trực Tuyến',
  description: 'Nền tảng học lập trình trực tuyến với các khóa học chất lượng cao',  icons: {
    icon: 'icon.png',
    shortcut: 'icon.png',
    apple: 'icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <GoogleOAuthWrapper clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
          <ReduxProvider>
            <AuthProvider>
              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
              <Providers>
                <ProgressBar />          
                <ConditionalNavbar />
                <AuthGuard>
                  {children}
                </AuthGuard>
                <ConditionalFooter />
              </Providers>
            </AuthProvider>
          </ReduxProvider>
        </GoogleOAuthWrapper>
      </body>
    </html>
  );
}