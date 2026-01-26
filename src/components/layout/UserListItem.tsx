'use client';

import Link from 'next/link';
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '~/src/components/common/Avatar';
import { cn } from '~/src/utils/class-name';
import { User as UserIcon } from 'lucide-react';

interface User {
  id: string;
  name: string | null;
  image: string | null;
}

interface UserListItemProps {
  user: User;
  onClick: () => void;
  isSelected: boolean;
  onProfileLinkClick: (e: React.MouseEvent) => void;
}

export default function UserListItem({
  user,
  onClick,
  isSelected,
  onProfileLinkClick,
}: UserListItemProps) {
  return (
    <li
      onClick={onClick}
      className={cn(
        'p-2 rounded-md cursor-pointer flex items-center justify-between gap-3 list-item-hover-effect',
        isSelected ? 'bg-primary-100' : 'hover:bg-gray-100',
      )}
    >
      <div className="flex items-center gap-3">
        <Avatar size="small">
          <AvatarImage src={user.image || ''} />
          <AvatarFallback>
            <UserIcon className="h-3/5 w-3/5 text-gray-500" />
          </AvatarFallback>
        </Avatar>
        <span className="font-medium">{user.name}</span>
      </div>
      <Link
        href={`/users/${user.id}`}
        onClick={onProfileLinkClick}
        className="p-1 rounded-full hover:bg-gray-200 flex-shrink-0 w-6 h-6 flex items-center justify-center"
        aria-label={`${user.name} 프로필 보기`}
      >
        <span className="text-gray-600 font-bold text-lg leading-none">→</span>
      </Link>
    </li>
  );
}
