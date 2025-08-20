'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface UseLikeProps {
  placeId?: string;
  routeId?: string;
}

export function useLike({ placeId, routeId }: UseLikeProps) {
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLikeData = useCallback(async () => {
    if (!placeId && !routeId) return;

    setIsLoading(true);
    try {
      const idQuery = placeId ? `placeId=${placeId}` : `routeId=${routeId}`;
      const response = await fetch(`/api/likes/info?${idQuery}`);

      if (response.ok) {
        const { count, liked } = await response.json();
        setLikesCount(count);
        setIsLiked(liked);
      }
    } catch (error) {
      console.error('Error fetching like data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [placeId, routeId]);

  useEffect(() => {
    fetchLikeData();
  }, [fetchLikeData, session]); // Re-fetch if session changes

  const handleLike = async (forceLike?: boolean) => {
    if (!session?.user?.id) {
      alert('로그인이 필요합니다.');
      return;
    }

    const originalIsLiked = isLiked;
    const originalLikesCount = likesCount;

    // Determine newIsLiked based on forceLike or current state
    const newIsLiked = typeof forceLike === 'boolean' ? forceLike : !isLiked;
    const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1;
    setIsLiked(newIsLiked);
    setLikesCount(newLikesCount);

    console.log(`handleLike: Attempting to ${newIsLiked ? 'POST' : 'DELETE'} like for placeId: ${placeId}, routeId: ${routeId}, forceLike: ${forceLike}`); // DEBUG

    try {
      const response = await fetch('/api/likes', {
        method: newIsLiked ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeId, routeId }),
      });

      console.log(`handleLike: API response status: ${response.status}, ok: ${response.ok}`); // DEBUG

      if (!response.ok) {
        const errorData = await response.json();
        console.error('handleLike: API error data:', errorData); // DEBUG
        // Revert on failure
        setIsLiked(originalIsLiked);
        setLikesCount(originalLikesCount);
        alert(`오류: ${errorData.message}`);
      }
    } catch (error) {
      console.error('handleLike: Network error:', error); // DEBUG
      // Revert on network error
      setIsLiked(originalIsLiked);
      setLikesCount(originalLikesCount);
      alert('좋아요 처리 중 오류가 발생했습니다.');
    }
  };

  return { isLiked, likesCount, isLoading, handleLike };
}
