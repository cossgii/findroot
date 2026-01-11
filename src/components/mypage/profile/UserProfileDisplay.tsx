'use client';

import React from 'react';
import Link from 'next/link';
import { ClientUser as User } from '~/src/types/shared';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '~/src/components/common/Avatar';

interface UserProfileDisplayProps {
  user: User;
}

export default function UserProfileDisplay({ user }: UserProfileDisplayProps) {
  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <Link
        href={`/users/${user.id}`}
        className="flex flex-col items-center space-y-4 group"
        aria-label="내 공개 프로필 보기"
      >
        <div className="transition-transform duration-200 ease-in-out group-hover:scale-110">
          <Avatar size="large">
            <AvatarImage
              src={user.image || ''}
              alt={user.name || 'User Avatar'}
            />
            <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
        </div>
        <h2 className="text-2xl font-bold group-hover:underline">
          {user.name || '이름 없음'}
        </h2>
      </Link>
      <p className="text-gray-600">{user.loginId}</p>
    </div>
  );
}
