import type { Metadata } from 'next';
import { Provider } from 'jotai';
import AuthProvider from '~/src/components/auth/auth-provider';
import Header from '~/src/components/layout/header';
import MainContainer from '~/src/components/layout/main-container';
import '~/src/styles/globals.css';

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
      <body>
        <Provider>
          <AuthProvider>
            <Header />
            <MainContainer>{children}</MainContainer>
          </AuthProvider>
        </Provider>
      </body>
    </html>
  );
}
