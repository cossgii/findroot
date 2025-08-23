'use client';

import React, { useState } from 'react';
import { useLike } from '~/src/hooks/useLike';
import { cn } from '~/src/utils/class-name';

interface LikeButtonProps {
  placeId?: string;
  routeId?: string;
  className?: string;
  initialIsLiked: boolean;
  initialLikesCount: number;
  onLikeToggle?: (handleLike: (forceLike?: boolean) => Promise<void>) => void;
}

export default function LikeButton({
  placeId,
  routeId,
  className,
  initialIsLiked,
  initialLikesCount,
  onLikeToggle,
}: LikeButtonProps) {
  const { isLiked, likesCount, handleLike } = useLike({
    placeId,
    routeId,
    initialIsLiked,
    initialLikesCount,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleButtonClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSubmitting(true);
    try {
      if (onLikeToggle) {
        await onLikeToggle(handleLike);
      } else {
        await handleLike();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <button
      onClick={handleButtonClick}
      disabled={isSubmitting}
      className={cn(
        'flex flex-col items-center justify-center text-center w-12 h-12 rounded-md transition-colors',
        'hover:bg-gray-100 active:bg-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed',
        className,
      )}
    >
      <span
        className={cn(
          'text-2xl',
          isLiked ? 'text-red-500' : 'text-gray-400',
        )}
      >
        ♥︎
      </span>
      <span className="text-xs font-medium text-gray-600">{likesCount}</span>
    </button>
  );
}
