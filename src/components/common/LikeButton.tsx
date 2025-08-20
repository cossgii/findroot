'use client';

import React from 'react';
import { useLike } from '~/src/hooks/useLike';
import { cn } from '~/src/utils/class-name';

interface LikeButtonProps {
  placeId?: string;
  routeId?: string;
  className?: string;
  onLikeToggle?: (originalHandleLike: (forceLike?: boolean) => Promise<void>) => void; // Modified prop signature
}

export default function LikeButton({ 
  placeId, 
  routeId, 
  className, 
  onLikeToggle 
}: LikeButtonProps) {
  const { isLiked, likesCount, handleLike, isLoading } = useLike({ placeId, routeId });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

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

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center text-center w-12 h-12 rounded-md bg-gray-100 animate-pulse',
          className,
        )}
      >
        <div className="h-5 w-5 bg-gray-300 rounded-md"></div>
        <div className="h-2 w-6 bg-gray-300 rounded mt-2"></div>
      </div>
    );
  }

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
      <span className="text-xs font-medium text-gray-600">
        {likesCount}
      </span>
    </button>
  );
}