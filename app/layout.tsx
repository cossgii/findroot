'use client';
import { Provider } from 'jotai';
import { usePathname } from 'next/navigation';
import AuthProvider from '~/src/components/auth/AuthProvider';
import GlobalModalRenderer from '~/src/components/layout/GlobalModalRenderer';
import Header from '~/src/components/layout/Header';
import { SpeedInsights } from '@vercel/speed-insights/next';
import '~/src/styles/globals.css';

import KakaoMapApiLoader from '~/src/components/common/KakaoMapApiLoader';
import Toast from '~/src/components/common/Toast';

import ReactQueryProvider from '~/src/providers/react-query-provider';
import { Suspense } from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  return (
    <html lang="ko">
      <head>
        <link
          rel="preload"
          href={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_APP_KEY}&libraries=services,clusterer&autoload=false`}
          as="script"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <div id="root-content" className="flex flex-col flex-grow ">
          <Provider>
            <ReactQueryProvider>
              <AuthProvider>
                <Suspense fallback={null}>
                  <Header />
                </Suspense>
                <main className="flex-grow pt-header">{children}</main>
                <GlobalModalRenderer />
                <Toast />
                <KakaoMapApiLoader />
              </AuthProvider>
            </ReactQueryProvider>
          </Provider>
        </div>
        {!isLandingPage && (
          <footer className=" text-black text-center p-4 text-sm flex-shrink-0">
            <p>&copy; 2026 FindRoot. All rights reserved.</p>
            <p>
              Contact:{' '}
              <a href="mailto:contact@findroot.com" className="underline">
                contact@findroot.com
              </a>
            </p>
          </footer>
        )}
        <div id="modal-root"></div>
        <SpeedInsights />
      </body>
    </html>
  );
}
