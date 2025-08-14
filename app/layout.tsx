import type { Metadata } from 'next';
import { Provider } from 'jotai';
import AuthProvider from '~/src/components/auth/auth-provider';
import { useSetAtom } from 'jotai'; // Import useSetAtom
import GlobalModalRenderer from '~/src/components/layout/global-modal-renderer';
import Header from '~/src/components/layout/header';
import Script from 'next/script'; // Import Script
import { dongle, notoSansKR, roboto } from '~/src/fonts/fonts';
import '~/src/styles/globals.css';

// Import the atom
import { isKakaoMapApiLoadedAtom } from '~/src/stores/app-store';
import KakaoMapApiLoader from '~/src/components/common/kakao-map-api-loader'; // Import the new component

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
            <AuthProvider>
              <Header />
              <main className="flex-grow pt-header overflow-y-auto">
                {children}
              </main>
              <GlobalModalRenderer />
              <KakaoMapApiLoader /> {/* Render the imported loader component */}
            </AuthProvider>
          </Provider>
        </div>
        <div id="modal-root"></div>
      </body>
    </html>
  );
}
