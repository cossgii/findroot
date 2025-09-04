'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { User, PlaceCategory } from '@prisma/client';
import { MyPageTab } from '~/src/components/mypage/MyPageTabs';
import { Restaurant, RouteWithLikeData } from '~/src/types/restaurant';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export interface PaginatedResponse<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
}

const fetchUserProfileData = async (userId: string) => {
  if (!userId) return null;
  const res = await fetch('/api/users/me');
  if (!res.ok) throw new Error('Failed to fetch user profile');
  return res.json();
};

const fetchMyCreatedPlacesData = async (
  userId: string,
  page: number,
  limit: number,
  district: string,
  category?: PlaceCategory | null,
) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    districtId: district,
  });
  if (category) {
    params.append('category', category);
  }
  const res = await fetch(`/api/users/${userId}/places?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch created places');
  const rawData = await res.json();
  return { ...rawData, data: rawData.places };
};

const fetchMyCreatedRoutesData = async (
  userId: string,
  page: number,
  limit: number,
  district: string,
) => {
  const res = await fetch(
    `/api/users/${userId}/routes?page=${page}&limit=${limit}&districtId=${district}`,
  );
  if (!res.ok) throw new Error('Failed to fetch created routes');
  const rawData = await res.json();
  return { ...rawData, data: rawData.routes };
};

const fetchLikedPlacesData = async (
  userId: string,
  page: number,
  limit: number,
  district: string,
  category?: PlaceCategory | null,
) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    districtId: district,
  });
  if (category) {
    params.append('category', category);
  }
  const res = await fetch(`/api/users/me/liked-places?${params.toString()}`);
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      `Failed to fetch liked places: ${res.status} ${res.statusText} - ${errorText}`,
    );
  }
  const rawData = await res.json();
  if (rawData === undefined || rawData === null) {
    throw new Error(
      'API returned undefined or null data for liked places after successful JSON parsing.',
    );
  }
  return { ...rawData, data: rawData.places };
};

const fetchLikedRoutesData = async (
  userId: string,
  page: number,
  limit: number,
  district: string,
) => {
  const res = await fetch(
    `/api/users/me/liked-routes?page=${page}&limit=${limit}&districtId=${district}`,
  );
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      `Failed to fetch liked routes: ${res.status} ${res.statusText} - ${errorText}`,
    );
  }
  const rawData = await res.json();
  if (rawData === undefined || rawData === null) {
    throw new Error('API returned undefined or null data for liked routes.');
  }
  return { ...rawData, data: rawData.routes };
};

export function useMyPageData(
  activeTab: MyPageTab,
  districtId: string,
  category?: PlaceCategory,
) {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();

  const [myCreatedPlaces, setMyCreatedPlaces] = useState<
    PaginatedResponse<Restaurant>
  >({ data: [], totalPages: 1, currentPage: 1 });
  const [myCreatedRoutes, setMyCreatedRoutes] = useState<
    PaginatedResponse<RouteWithLikeData>
  >({ data: [], totalPages: 1, currentPage: 1 });
  const [likedPlaces, setLikedPlaces] = useState<PaginatedResponse<Restaurant>>(
    { data: [], totalPages: 1, currentPage: 1 },
  );
  const [likedRoutes, setLikedRoutes] = useState<
    PaginatedResponse<RouteWithLikeData>
  >({ data: [], totalPages: 1, currentPage: 1 });

  const { data: user, isLoading: isUserLoading } = useQuery<User | null, Error>(
    {
      queryKey: ['user', 'me'],
      queryFn: () => fetchUserProfileData(session?.user?.id || ''),
      enabled: status === 'authenticated' && activeTab === 'profile',
    },
  );

  const { data: myCreatedPlacesData, isLoading: isMyCreatedPlacesLoading } =
    useQuery<PaginatedResponse<Restaurant>, Error>({
      queryKey: [
        'user',
        session?.user?.id,
        'places',
        'created',
        {
          page: myCreatedPlaces.currentPage,
          limit: 5,
          district: districtId,
          category,
        },
      ],
      queryFn: () =>
        fetchMyCreatedPlacesData(
          session?.user?.id || '',
          myCreatedPlaces.currentPage,
          5,
          districtId,
          category,
        ),
      enabled: status === 'authenticated' && activeTab === 'content',
      placeholderData: (previousData) => previousData,
    });

  const { data: myCreatedRoutesData, isLoading: isMyCreatedRoutesLoading } =
    useQuery<PaginatedResponse<RouteWithLikeData>, Error>({
      queryKey: [
        'user',
        session?.user?.id,
        'routes',
        'created',
        { page: myCreatedRoutes.currentPage, limit: 5, district: districtId },
      ],
      queryFn: () =>
        fetchMyCreatedRoutesData(
          session?.user?.id || '',
          myCreatedRoutes.currentPage,
          5,
          districtId,
        ),
      enabled: status === 'authenticated' && activeTab === 'content',
      placeholderData: (previousData) => previousData,
    });

  const { data: likedPlacesData, isLoading: isLikedPlacesLoading } = useQuery<
    PaginatedResponse<Restaurant>,
    Error
  >({
    queryKey: [
      'user',
      session?.user?.id,
      'places',
      'liked',
      {
        page: likedPlaces.currentPage,
        limit: 5,
        district: districtId,
        category,
      },
    ],
    queryFn: () =>
      fetchLikedPlacesData(
        session?.user?.id || '',
        likedPlaces.currentPage,
        5,
        districtId,
        category,
      ),
    enabled: status === 'authenticated' && activeTab === 'likes',
    placeholderData: (previousData) => previousData,
  });

  const { data: likedRoutesData, isLoading: isLikedRoutesLoading } = useQuery<
    PaginatedResponse<RouteWithLikeData>,
    Error
  >({
    queryKey: [
      'user',
      session?.user?.id,
      'routes',
      'liked',
      { page: likedRoutes.currentPage, limit: 5, district: districtId },
    ],
    queryFn: () =>
      fetchLikedRoutesData(
        session?.user?.id || '',
        likedRoutes.currentPage,
        5,
        districtId,
      ),
    enabled: status === 'authenticated' && activeTab === 'likes',
    placeholderData: (previousData) => previousData,
  });

  useEffect(() => {
    if (myCreatedPlacesData) {
      setMyCreatedPlaces(myCreatedPlacesData);
    }
  }, [myCreatedPlacesData]);

  useEffect(() => {
    if (myCreatedRoutesData) {
      setMyCreatedRoutes(myCreatedRoutesData);
    }
  }, [myCreatedRoutesData]);

  useEffect(() => {
    if (likedPlacesData) {
      setLikedPlaces(likedPlacesData);
    }
  }, [likedPlacesData]);

  useEffect(() => {
    if (likedRoutesData) {
      setLikedRoutes(likedRoutesData);
    }
  }, [likedRoutesData]);

  const refreshContent = useCallback(() => {
    if (!session?.user?.id) return;
    if (activeTab === 'profile') {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    } else if (activeTab === 'content') {
      queryClient.invalidateQueries({
        queryKey: ['user', session.user.id, 'places', 'created'],
      });
      queryClient.invalidateQueries({
        queryKey: ['user', session.user.id, 'routes', 'created'],
      });
    } else if (activeTab === 'likes') {
      queryClient.invalidateQueries({
        queryKey: ['user', session.user.id, 'places', 'liked'],
      });
      queryClient.invalidateQueries({
        queryKey: ['user', session.user.id, 'routes', 'liked'],
      });
    }
  }, [activeTab, session, queryClient]);

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
      isMyCreatedPlacesLoading ||
      isMyCreatedRoutesLoading ||
      isLikedPlacesLoading ||
      isLikedRoutesLoading,
    setMyCreatedPlaces,
    setMyCreatedRoutes,
    setLikedPlaces,
    setLikedRoutes,
    refreshContent,
  };
}
