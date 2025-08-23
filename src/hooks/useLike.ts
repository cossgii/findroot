'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface UseLikeProps {
  placeId?: string;
  routeId?: string;
  initialIsLiked: boolean;
  initialLikesCount: number;
}

export function useLike({
  placeId,
  routeId,
  initialIsLiked,
  initialLikesCount,
}: UseLikeProps) {
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);

  useEffect(() => {
    setIsLiked(initialIsLiked);
    setLikesCount(initialLikesCount);
  }, [initialIsLiked, initialLikesCount]);

  const handleLike = useCallback(async (forceLike?: boolean) => {
    if (!session?.user?.id) {
      alert('로그인이 필요합니다.');
      return;
    }

    const originalIsLiked = isLiked;
    const originalLikesCount = likesCount;

    const newIsLiked = typeof forceLike === 'boolean' ? forceLike : !isLiked;
    const newLikesCount = newIsLiked
      ? originalLikesCount + 1
      : originalLikesCount - 1;

    setIsLiked(newIsLiked);
    setLikesCount(newLikesCount);

    try {
      const response = await fetch('/api/likes', {
        method: newIsLiked ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeId, routeId }),
      });

      if (!response.ok) {
        setIsLiked(originalIsLiked);
        setLikesCount(originalLikesCount);
        const errorData = await response.json();
        alert(`오류: ${errorData.message}`);
      }
    } catch (_error) {
      setIsLiked(originalIsLiked);
      setLikesCount(originalLikesCount);
      alert('좋아요 처리 중 오류가 발생했습니다.');
    }
  }, [isLiked, likesCount, placeId, routeId, session]);

  return { isLiked, likesCount, handleLike };
}