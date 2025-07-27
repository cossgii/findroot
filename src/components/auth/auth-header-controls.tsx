// src/components/auth/auth-header-controls.tsx
'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Button from '~/src/components/common/button';
import Dropdown, { DropdownItem } from '~/src/components/common/dropdown';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '~/src/components/common/avatar';

export default function AuthHeaderControls() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  if (status === 'loading') {
    return <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />;
  }

  if (session) {
    return (
      <Dropdown
        align="right"
        trigger={
          <button className="transition-transform duration-200 ease-in-out hover:scale-110">
            <Avatar size="medium">
              <AvatarImage src={session.user?.image || ''} />
              <AvatarFallback />
            </Avatar>
          </button>
        }
      >
        <DropdownItem>
          <Link href="/mypage" className="block w-full text-left">
            마이페이지
          </Link>
        </DropdownItem>
        <DropdownItem onClick={() => signOut()}>로그아웃</DropdownItem>
      </Dropdown>
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