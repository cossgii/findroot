'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import Dropdown, { DropdownItem } from '~/src/components/common/dropdown';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '~/src/components/common/avatar';

interface UserMenuDropdownProps {
  userImage: string | null | undefined;
  isMyPage: boolean;
}

export default function UserMenuDropdown({ userImage, isMyPage }: UserMenuDropdownProps) {
  const trigger = (
    <button className="transition-transform duration-200 ease-in-out hover:scale-110">
      <Avatar size="medium">
        <AvatarImage src={userImage || ''} />
        <AvatarFallback />
      </Avatar>
    </button>
  );

  return (
    <Dropdown
      align="right"
      trigger={trigger}
    >
      {!isMyPage && (
        <DropdownItem>
          <Link href="/mypage" className="block w-full text-left">
            마이페이지
          </Link>
        </DropdownItem>
      )}
      <DropdownItem onClick={() => signOut()}>로그아웃</DropdownItem>
    </Dropdown>
  );
}
