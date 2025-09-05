'use client';

import React from 'react';
import { ClientUser as User } from '~/src/types/shared';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '~/src/components/common/avatar';

interface UserProfileDisplayProps {
  user: User;
}

export default function UserProfileDisplay({ user }: UserProfileDisplayProps) {
  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <Avatar size="large">
        <AvatarImage src={user.image || ''} alt={user.name || 'User Avatar'} />
        <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
      </Avatar>
      <h2 className="text-2xl font-bold">{user.name || '이름 없음'}</h2>
      <p className="text-gray-600">{user.email}</p>
    </div>
  );
}
