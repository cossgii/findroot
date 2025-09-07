'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Button from '~/src/components/common/Button';
import UserMenuDropdown from './UserMenuDropdown'; // Import the new wrapper

export default function AuthHeaderControls() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isMyPage = pathname === '/mypage';

  if (status === 'loading') {
    return <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />;
  }

  if (session) {
    return (
      <UserMenuDropdown userImage={session.user?.image} isMyPage={isMyPage} />
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

  return null;
}
