'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation'; // usePathname 임포트
import { cn } from '~/src/utils/class-name';
import Button from '~/src/components/common/button';

export default function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname(); // 현재 경로 가져오기

  // 로그인 또는 회원가입 페이지인지 확인
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50',
        'flex items-center justify-between',
        'h-header px-4 tablet:px-6 desktop:px-[6.25rem]',
        'bg-white shadow-sm',
      )}
    >
      <Link href="/">
        <h1 className="text-xl font-bold">FindRoot</h1>
      </Link>
      <nav>
        {status === 'loading' ? (
          <div className="animate-pulse w-24 h-6 bg-gray-200 rounded"></div>
        ) : session ? (
          <div className="flex items-center space-x-4">
            <span className="font-medium">
              {session.user?.name || session.user?.email}님
            </span>
            <Button onClick={() => signOut()} variant="outlined" size="small">
              로그아웃
            </Button>
          </div>
        ) : (
          // 로그인 또는 회원가입 페이지가 아닐 때만 로그인 버튼 표시
          !isAuthPage && (
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="outlined" size="small">
                  로그인
                </Button>
              </Link>
            </div>
          )
        )}
      </nav>
    </header>
  );
}

