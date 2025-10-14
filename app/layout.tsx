import type { Metadata } from 'next';
import { Provider } from 'jotai';
import AuthProvider from '~/src/components/auth/AuthProvider';
import GlobalModalRenderer from '~/src/components/layout/GlobalModalRenderer';
import Header from '~/src/components/layout/Header';
import { SpeedInsights } from '@vercel/speed-insights/next';

import '~/src/styles/globals.css';

import KakaoMapApiLoader from '~/src/components/common/KakaoMapApiLoader';
import Toast from '~/src/components/common/Toast';

import ReactQueryProvider from '~/src/providers/react-query-provider';

export const metadata: Metadata = {
  title: 'FindRoot',
  description: 'This recommends Seoul places and routes to you',
  keywords: ['next.js', 'app router', 'metadata'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        <div id="root-content" className="h-screen flex flex-col">
          <Provider>
            <ReactQueryProvider>
              <AuthProvider>
                <Header />
                <main className="flex-grow pt-header">{children}</main>
                <GlobalModalRenderer />
                <Toast />
                <KakaoMapApiLoader />
              </AuthProvider>
            </ReactQueryProvider>
          </Provider>
        </div>
        <div id="modal-root"></div>
        <SpeedInsights />
      </body>
    </html>
  );
}
