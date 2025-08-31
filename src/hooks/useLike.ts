'use client';

import { useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';

interface UseLikeProps {
  placeId?: string;
  routeId?: string;
  initialIsLiked: boolean;
  initialLikesCount: number;
}

// --- Mutation Functions ---
const addLikeApi = async (payload: { placeId?: string; routeId?: string }) => {
  const response = await fetch('/api/likes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to add like');
  }
  return response.json();
};

const removeLikeApi = async (payload: { placeId?: string; routeId?: string }) => {
  const response = await fetch('/api/likes', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to remove like');
  }
  return response.json();
};
// --- End Mutation Functions ---

// --- Query Function for Like Info ---
const fetchLikeInfo = async (type: 'placeId' | 'routeId', id: string) => {
  const res = await fetch(`/api/likes/info?${type}=${id}`);
  if (!res.ok) throw new Error('Failed to fetch like info');
  return res.json();
};
// --- End Query Function ---

export function useLike({
  placeId,
  routeId,
  initialIsLiked,
  initialLikesCount,
}: UseLikeProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  // Fetch current like info using useQuery
  const { data: likeInfo, isLoading: isLikeInfoLoading } = useQuery<{ count: number; liked: boolean }, Error>({
    queryKey: placeId ? ['placeLikes', placeId] : ['routeLikes', routeId],
    queryFn: () => fetchLikeInfo(placeId ? 'placeId' : 'routeId', placeId || routeId || ''),
    enabled: !!(placeId || routeId), // Only run if placeId or routeId is provided
    initialData: { count: initialLikesCount, liked: initialIsLiked }, // Provide initial data to avoid loading flicker
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
  });

  // useMutation for adding a like
  const { mutate: addLikeMutation } = useMutation({
    mutationFn: addLikeApi,
    onMutate: async (newLike) => {
      // Optimistic update
      const queryKey = newLike.placeId ? ['placeLikes', newLike.placeId] : ['routeLikes', newLike.routeId];
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: { count: number; liked: boolean }) => ({
        ...old,
        count: old.count + 1,
        liked: true,
      }));

      return { previousData };
    },
    onError: (err, newLike, context) => {
      const queryKey = newLike.placeId ? ['placeLikes', newLike.placeId] : ['routeLikes', newLike.routeId];
      queryClient.setQueryData(queryKey, context?.previousData);
      alert(`좋아요 처리 중 오류가 발생했습니다: ${err.message}`);
    },
    onSettled: (data, error, variables) => {
      const queryKey = variables.placeId ? ['placeLikes', variables.placeId] : ['routeLikes', variables.routeId];
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['place', variables.placeId] });
      queryClient.invalidateQueries({ queryKey: ['user', session?.user?.id, 'places', 'liked'] });
      queryClient.invalidateQueries({ queryKey: ['user', session?.user?.id, 'routes', 'liked'] });
    },
  });

  // useMutation for removing a like
  const { mutate: removeLikeMutation } = useMutation({
    mutationFn: removeLikeApi,
    onMutate: async (removedLike) => {
      // Optimistic update
      const queryKey = removedLike.placeId ? ['placeLikes', removedLike.placeId] : ['routeLikes', removedLike.routeId];
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: { count: number; liked: boolean }) => ({
        ...old,
        count: old.count - 1,
        liked: false,
      }));

      return { previousData };
    },
    onError: (err, removedLike, context) => {
      const queryKey = removedLike.placeId ? ['placeLikes', removedLike.placeId] : ['routeLikes', removedLike.routeId];
      queryClient.setQueryData(queryKey, context?.previousData);
      alert(`좋아요 취소 중 오류가 발생했습니다: ${err.message}`);
    },
    onSettled: (data, error, variables) => {
      const queryKey = variables.placeId ? ['placeLikes', variables.placeId] : ['routeLikes', variables.routeId];
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['place', variables.placeId] });
      queryClient.invalidateQueries({ queryKey: ['user', session?.user?.id, 'places', 'liked'] });
      queryClient.invalidateQueries({ queryKey: ['user', session?.user?.id, 'routes', 'liked'] });
    },
  });

  const handleLike = useCallback(async (forceLike?: boolean) => {
    if (!session?.user?.id) {
      alert('로그인이 필요합니다.');
      return;
    }

    const currentLikedStatus = likeInfo?.liked ?? initialIsLiked;
    const newLikedStatus = typeof forceLike === 'boolean' ? forceLike : !currentLikedStatus;

    const payload = { placeId, routeId };

    if (newLikedStatus) {
      addLikeMutation(payload);
    } else {
      removeLikeMutation(payload);
    }
  }, [session, placeId, routeId, likeInfo, initialIsLiked, addLikeMutation, removeLikeMutation]);

  return {
    isLiked: likeInfo?.liked ?? initialIsLiked,
    likesCount: likeInfo?.count ?? initialLikesCount,
    handleLike,
    isLoading: isLikeInfoLoading,
  };
}