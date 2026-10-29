'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Button from '~/src/components/common/Button';
import UserMenuDropdown from './UserMenuDropdown';
import { ClientUser } from '~/src/types/shared';

const fetchCurrentUser = async (): Promise<ClientUser> => {
  const res = await fetch('/api/users/me');
  if (!res.ok) throw new Error('Failed to fetch current user');
  return res.json();
};

export default function AuthHeaderControls() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const { data: currentUser } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: fetchCurrentUser,
    enabled: !!session,
    staleTime: 5 * 60 * 1000,
  });

  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isMyPage = pathname === '/mypage';

  if (status === 'loading') {
    return (
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
      </div>
    );
  }

  if (session) {
    return (
      <UserMenuDropdown userImage={currentUser?.image} isMyPage={isMyPage} />
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
