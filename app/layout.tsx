import type { Metadata } from 'next';
import { Provider } from 'jotai';
import AuthProvider from '~/src/components/auth/AuthProvider';
import GlobalModalRenderer from '~/src/components/layout/GlobalModalRenderer';
import Header from '~/src/components/layout/Header';
import { dongle, notoSansKR } from '~/src/fonts/fonts';
import '~/src/styles/globals.css';

import KakaoMapApiLoader from '~/src/components/common/KakaoMapApiLoader';
import Toast from '~/src/components/common/Toast';

import ReactQueryProvider from '~/src/providers/react-query-provider';

export const metadata: Metadata = {
  title: 'My Awesome App',
  description: 'This is a description of my awesome app.',
  keywords: ['next.js', 'app router', 'metadata'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body
        className={`${dongle.variable} ${notoSansKR.variable} font-noto-sans-kr`}
      >
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
      </body>
    </html>
  );
}
