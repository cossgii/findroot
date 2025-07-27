// src/components/auth/auth-header-controls.tsx
'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Button from '~/src/components/common/button';

export default function AuthHeaderControls() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  if (status === 'loading') {
    return <div className="animate-pulse w-24 h-6 bg-gray-200 rounded"></div>;
  }

  if (session) {
    return (
      <div className="flex items-center space-x-4">
        <span className="font-medium">
          {session.user?.name || session.user?.email}님
        </span>
        <Button onClick={() => signOut()} variant="outlined" size="small">
          로그아웃
        </Button>
      </div>
    );
  }

  if (!isAuthPage) {
    return (
      <div className="flex items-center space-x-4">
        <Link href="/login">
          <Button variant="outlined" size="small">
            로그인
          </Button>
        </Link>
      </div>
    );
  }

  return null; // 로그인/회원가입 페이지에서는 아무것도 렌더링하지 않음
}