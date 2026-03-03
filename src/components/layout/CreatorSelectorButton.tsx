'use client';

import React from 'react';
import { Star, User as UserIcon, ChevronDown, Search } from 'lucide-react';
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '~/src/components/common/Avatar';
import { cn } from '~/src/utils/class-name';
import { ContentCreator } from '~/src/stores/app-store';

interface CreatorSelectorButtonProps {
  contentCreator: ContentCreator;
  onClick: () => void;
  isUserPage?: boolean;
}

export default function CreatorSelectorButton({
  contentCreator,
  onClick,
  isUserPage = false,
}: CreatorSelectorButtonProps) {
  const renderContent = () => {
    if (isUserPage) {
      return (
        <>
          <Search size={16} className="text-gray-500" />
          <span className="font-semibold">팔로잉 검색</span>
        </>
      );
    } else if (contentCreator.type === 'recommended') {
      return (
        <>
          <Star size={16} className="text-yellow-500" />
          <span className="font-semibold">추천</span>
        </>
      );
    } else if (contentCreator.type === 'me') {
      return (
        <>
          <UserIcon size={16} className="text-blue-500" />
          <span className="font-semibold">내 콘텐츠</span>
        </>
      );
    } else if (contentCreator.type === 'user') {
      return (
        <>
          <Avatar size="small">
            <AvatarImage src={contentCreator.userImage || ''} />
            <AvatarFallback>
              <UserIcon className="h-3/5 w-3/5 text-gray-500" />
            </AvatarFallback>
          </Avatar>
          <span className="font-semibold">{contentCreator.userName}</span>
        </>
      );
    }
    return null;
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 h-10 border border-gray-300 rounded-md text-sm',
        'hover:bg-gray-50 transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2',
      )}
      aria-label={isUserPage ? '팔로잉 검색' : '콘텐츠 크리에이터 선택'}
      data-cy="creator-selector-button"
    >
      {renderContent()}
      <ChevronDown size={16} className="text-gray-500 ml-1" />
    </button>
  );
}
