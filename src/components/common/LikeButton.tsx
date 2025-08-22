'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { cn } from '~/src/utils/class-name';

interface LikeButtonProps {
  placeId?: string;
  routeId?: string;
  className?: string;
  initialIsLiked: boolean;
  initialLikesCount: number;
}

export default function LikeButton({ 
  placeId,
  routeId,
  className,
  initialIsLiked,
  initialLikesCount,
}: LikeButtonProps) {
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsLiked(initialIsLiked);
    setLikesCount(initialLikesCount);
  }, [initialIsLiked, initialLikesCount]);

  const handleButtonClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session?.user?.id) {
      alert('로그인이 필요합니다.');
      return;
    }

    setIsSubmitting(true);

    const originalIsLiked = isLiked;
    const originalLikesCount = likesCount;

    const newIsLiked = !isLiked;
    const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1;

    // Optimistic update
    setIsLiked(newIsLiked);
    setLikesCount(newLikesCount);

    try {
      const response = await fetch('/api/likes', {
        method: newIsLiked ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeId, routeId }),
      });

      if (!response.ok) {
        // Revert on failure
        setIsLiked(originalIsLiked);
        setLikesCount(originalLikesCount);
        const errorData = await response.json();
        alert(`오류: ${errorData.message}`);
      }
    } catch (_error) {
      // Revert on network error
      setIsLiked(originalIsLiked);
      setLikesCount(originalLikesCount);
      alert('좋아요 처리 중 오류가 발생했습니다.');
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
      <span className="text-xs font-medium text-gray-600">
        {likesCount}
      </span>
    </button>
  );
}