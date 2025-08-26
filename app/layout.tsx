import type { Metadata } from 'next';
import { Provider } from 'jotai';
import AuthProvider from '~/src/components/auth/auth-provider';
import GlobalModalRenderer from '~/src/components/layout/global-modal-renderer';
import Header from '~/src/components/layout/header';
import { dongle, notoSansKR, roboto } from '~/src/fonts/fonts';
import '~/src/styles/globals.css';

import KakaoMapApiLoader from '~/src/components/common/kakao-map-api-loader';
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
        className={`${dongle.variable} ${notoSansKR.variable} ${roboto.variable} font-noto-sans-kr`}
      >
        <div id="root-content" className="h-screen flex flex-col">
          <Provider>
            <ReactQueryProvider>
              <AuthProvider>
                <Header />
                <main className="flex-grow pt-header">{children}</main>
                <GlobalModalRenderer />
                <KakaoMapApiLoader />
                <Toast /> {/* <-- Toast 컴포넌트를 Provider 안으로 이동 */}
              </AuthProvider>
            </ReactQueryProvider>
          </Provider>
        </div>
        <div id="modal-root"></div>
      </body>
    </html>
  );
}
