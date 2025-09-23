'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useSetAtom } from 'jotai';
import { modalAtom } from '~/src/stores/app-store';
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
  const { data: session } = useSession();
  const router = useRouter();
  const setModal = useSetAtom(modalAtom);

  const { isLiked, likesCount, handleLike, isLoading } = useLike({
    placeId,
    routeId,
    initialIsLiked,
    initialLikesCount,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleButtonClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!session) {
      setModal({
        type: 'LOGIN_PROMPT',
        props: {
          title: '로그인이 필요합니다',
          message: '로그인하고 나만의 장소를 저장해보세요!',
          onConfirm: () => router.push('/login'),
          onCancel: () => {},
        },
      });
      return;
    }

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
      data-cy="like-button"
      onClick={handleButtonClick}
      disabled={isSubmitting || isLoading}
      className={cn(
        'flex flex-col items-center justify-center text-center w-12 h-12 rounded-md transition-colors',
        'hover:bg-gray-100 active:bg-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed',
        className,
      )}
      aria-label={isLiked ? '좋아요 취소' : '좋아요'}
    >
      <span
        className={cn(
          'text-2xl',
          isLiked ? 'text-red-500' : 'text-gray-400',
        )}
      >
        ♥︎
      </span>
      <span data-cy="like-count" className="text-xs font-medium text-gray-600">
        {likesCount}
      </span>
    </button>
  );
}