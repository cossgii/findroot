'use client';

import { useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { ClientUser as User, PlaceCategory } from '~/src/types/shared';
import { MyPageTab } from '~/src/components/mypage/MyPageTabs';
import { Restaurant, RouteWithLikeData } from '~/src/types/restaurant';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePaginatedQuery } from '~/src/hooks/usePaginatedQuery';

const fetchUserProfileData = async (userId: string) => {
  if (!userId) return null;
  const res = await fetch('/api/users/me');
  if (!res.ok) throw new Error('Failed to fetch user profile');
  return res.json();
};

export function useMyPageData(
  activeTab: MyPageTab,
  districtId: string,
  category?: PlaceCategory,
) {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const userId = session?.user?.id || '';

  const { data: user, isLoading: isUserLoading } = useQuery<User | null, Error>(
    {
      queryKey: ['user', 'me'],
      queryFn: () => fetchUserProfileData(userId),
      enabled: status === 'authenticated' && activeTab === 'profile',
    },
  );

  const myCreatedPlaces = usePaginatedQuery<Restaurant>({
    queryKey: ['user', userId, 'places', 'created'],
    apiEndpoint: `/api/users/${userId}/places`,
    queryParams: { districtId, category },
    enabled: status === 'authenticated' && activeTab === 'content',
  });

  const myCreatedRoutes = usePaginatedQuery<RouteWithLikeData>({
    queryKey: ['user', userId, 'routes', 'created'],
    apiEndpoint: `/api/users/${userId}/routes`,
    queryParams: { districtId },
    enabled: status === 'authenticated' && activeTab === 'content',
  });

  const likedPlaces = usePaginatedQuery<Restaurant>({
    queryKey: ['user', userId, 'places', 'liked'],
    apiEndpoint: '/api/users/me/liked-places',
    queryParams: { districtId, category },
    enabled: status === 'authenticated' && activeTab === 'likes',
  });

  const likedRoutes = usePaginatedQuery<RouteWithLikeData>({
    queryKey: ['user', userId, 'routes', 'liked'],
    apiEndpoint: '/api/users/me/liked-routes',
    queryParams: { districtId },
    enabled: status === 'authenticated' && activeTab === 'likes',
  });

  const refreshContent = useCallback(() => {
    if (!userId) return;
    switch (activeTab) {
      case 'profile':
        queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
        break;
      case 'content':
        queryClient.invalidateQueries({
          queryKey: ['user', userId, 'places', 'created'],
        });
        queryClient.invalidateQueries({
          queryKey: ['user', userId, 'routes', 'created'],
        });
        break;
      case 'likes':
        queryClient.invalidateQueries({
          queryKey: ['user', userId, 'places', 'liked'],
        });
        queryClient.invalidateQueries({
          queryKey: ['user', userId, 'routes', 'liked'],
        });
        break;
    }
  }, [activeTab, userId, queryClient]);

  return {
    session,
    status,
    user,
    setUser: (updatedUser: User) =>
      queryClient.setQueryData(['user', 'me'], updatedUser),
    myCreatedPlaces,
    myCreatedRoutes,
    likedPlaces,
    likedRoutes,
    isLoading:
      isUserLoading ||
      myCreatedPlaces.isLoading ||
      myCreatedRoutes.isLoading ||
      likedPlaces.isLoading ||
      likedRoutes.isLoading,
    refreshContent,
  };
}
