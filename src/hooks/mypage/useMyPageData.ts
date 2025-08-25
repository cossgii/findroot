'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { User } from '@prisma/client';
import { MyPageTab } from '~/src/components/mypage/MyPageTabs';
import { Restaurant, RouteWithLikeData } from '~/src/types/restaurant';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Define a generic paginated response type
export interface PaginatedResponse<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
}

// --- Query Functions ---
const fetchUserProfileData = async (userId: string) => {
  if (!userId) return null;
  const res = await fetch('/api/users/me');
  if (!res.ok) throw new Error('Failed to fetch user profile');
  return res.json();
};

const fetchMyCreatedPlacesData = async (userId: string, page: number, limit: number, district: string) => {
  const res = await fetch(`/api/users/${userId}/places?page=${page}&limit=${limit}&districtId=${district}`);
  if (!res.ok) throw new Error('Failed to fetch created places');
  const rawData = await res.json();
  return { ...rawData, data: rawData.places };
};

const fetchMyCreatedRoutesData = async (userId: string, page: number, limit: number, district: string) => {
  const res = await fetch(`/api/users/${userId}/routes?page=${page}&limit=${limit}&districtId=${district}`);
  if (!res.ok) throw new Error('Failed to fetch created routes');
  const rawData = await res.json();
  return { ...rawData, data: rawData.routes };
};

const fetchLikedPlacesData = async (userId: string, page: number, limit: number, district: string) => {
  console.log(`Fetching liked places for userId: ${userId}, page: ${page}, district: ${district}`);
  const res = await fetch(`/api/users/me/liked-places?page=${page}&limit=${limit}&districtId=${district}`);
  console.log(`fetchLikedPlacesData response ok: ${res.ok}`);
  if (!res.ok) {
    const errorText = await res.text(); // Get raw error text
    throw new Error(`Failed to fetch liked places: ${res.status} ${res.statusText} - ${errorText}`);
  }
  const rawData = await res.json();
  if (rawData === undefined || rawData === null) {
    throw new Error('API returned undefined or null data for liked places after successful JSON parsing.');
  }
  console.log('fetchLikedPlacesData data:', rawData);
  return { ...rawData, data: rawData.places };
};

const fetchLikedRoutesData = async (userId: string, page: number, limit: number, district: string) => {
  console.log(`Fetching liked routes for userId: ${userId}, page: ${page}, district: ${district}`);
  const res = await fetch(`/api/users/me/liked-routes?page=${page}&limit=${limit}&districtId=${district}`);
  console.log(`fetchLikedRoutesData response ok: ${res.ok}`);
  if (!res.ok) {
    const errorText = await res.text(); // Get raw error text
    throw new Error(`Failed to fetch liked routes: ${res.status} ${res.statusText} - ${errorText}`);
  }
  const rawData = await res.json();
  // Explicitly check if data is undefined, which should not happen if res.ok is true and res.json() succeeds
  if (rawData === undefined || rawData === null) {
    throw new Error('API returned undefined or null data for liked routes.');
  }
  console.log('fetchLikedRoutesData data:', rawData);
  return { ...rawData, data: rawData.routes };
};
// --- End Query Functions ---


export function useMyPageData(activeTab: MyPageTab, districtId: string) {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();

  // State for pagination (still managed by useState as useQuery doesn't directly manage page numbers)
  const [myCreatedPlaces, setMyCreatedPlaces] = useState<PaginatedResponse<Restaurant>>({ data: [], totalPages: 1, currentPage: 1 });
  const [myCreatedRoutes, setMyCreatedRoutes] = useState<PaginatedResponse<RouteWithLikeData>>({ data: [], totalPages: 1, currentPage: 1 });
  const [likedPlaces, setLikedPlaces] = useState<PaginatedResponse<Restaurant>>({ data: [], totalPages: 1, currentPage: 1 });
  const [likedRoutes, setLikedRoutes] = useState<PaginatedResponse<RouteWithLikeData>>({ data: [], totalPages: 1, currentPage: 1 });

  // --- useQuery calls ---
  const { data: user, isLoading: isUserLoading } = useQuery<User | null, Error>({
    queryKey: ['user', 'me'],
    queryFn: () => fetchUserProfileData(session?.user?.id || ''),
    enabled: status === 'authenticated' && activeTab === 'profile',
  });

  const { data: myCreatedPlacesData, isLoading: isMyCreatedPlacesLoading } = useQuery<PaginatedResponse<Restaurant>, Error>({
    queryKey: ['user', session?.user?.id, 'places', 'created', { page: myCreatedPlaces.currentPage, limit: 5, district: districtId }],
    queryFn: () => fetchMyCreatedPlacesData(session?.user?.id || '', myCreatedPlaces.currentPage, 5, districtId),
    enabled: status === 'authenticated' && activeTab === 'content',
    placeholderData: (previousData) => previousData,
  });

  const { data: myCreatedRoutesData, isLoading: isMyCreatedRoutesLoading } = useQuery<PaginatedResponse<RouteWithLikeData>, Error>({
    queryKey: ['user', session?.user?.id, 'routes', 'created', { page: myCreatedRoutes.currentPage, limit: 5, district: districtId }],
    queryFn: () => fetchMyCreatedRoutesData(session?.user?.id || '', myCreatedRoutes.currentPage, 5, districtId),
    enabled: status === 'authenticated' && activeTab === 'content',
    placeholderData: (previousData) => previousData,
  });

  const { data: likedPlacesData, isLoading: isLikedPlacesLoading, isError: isLikedPlacesError, error: likedPlacesError } = useQuery<PaginatedResponse<Restaurant>, Error>({
    queryKey: ['user', session?.user?.id, 'places', 'liked', { page: likedPlaces.currentPage, limit: 5, district: districtId }],
    queryFn: () => fetchLikedPlacesData(session?.user?.id || '', likedPlaces.currentPage, 5, districtId),
    enabled: status === 'authenticated' && activeTab === 'likes',
    placeholderData: (previousData) => previousData,
  });
  console.log('likedPlacesData useQuery state:', { isLoading: isLikedPlacesLoading, isError: isLikedPlacesError, error: likedPlacesError, data: likedPlacesData });

  const { data: likedRoutesData, isLoading: isLikedRoutesLoading, isError: isLikedRoutesError, error: likedRoutesError } = useQuery<PaginatedResponse<RouteWithLikeData>, Error>({
    queryKey: ['user', session?.user?.id, 'routes', 'liked', { page: likedRoutes.currentPage, limit: 5, district: districtId }],
    queryFn: () => fetchLikedRoutesData(session?.user?.id || '', likedRoutes.currentPage, 5, districtId),
    enabled: status === 'authenticated' && activeTab === 'likes',
    placeholderData: (previousData) => previousData,
  });
  console.log('likedRoutesData useQuery state:', { isLoading: isLikedRoutesLoading, isError: isLikedRoutesError, error: likedRoutesError, data: likedRoutesData });
  // --- End useQuery calls ---

  // --- useEffect to update local state from query data ---
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
  // --- End useEffect ---

  const refreshContent = useCallback(() => {
    if (!session?.user?.id) return;
    if (activeTab === 'profile') {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    } else if (activeTab === 'content') {
      queryClient.invalidateQueries({ queryKey: ['user', session.user.id, 'places', 'created'] });
      queryClient.invalidateQueries({ queryKey: ['user', session.user.id, 'routes', 'created'] });
    } else if (activeTab === 'likes') {
      queryClient.invalidateQueries({ queryKey: ['user', session.user.id, 'places', 'liked'] });
      queryClient.invalidateQueries({ queryKey: ['user', session.user.id, 'routes', 'liked'] });
    }
  }, [activeTab, session, queryClient]);

  // The individual fetch functions are no longer returned as useQuery handles the fetching.
  // setUser is still returned for profile updates.
  return {
    session,
    status,
    user,
    setUser: (updatedUser: User) => queryClient.setQueryData(['user', 'me'], updatedUser), // Update cache directly
    myCreatedPlaces,
    myCreatedRoutes,
    likedPlaces,
    likedRoutes,
    isLoading: isUserLoading || isMyCreatedPlacesLoading || isMyCreatedRoutesLoading || isLikedPlacesLoading || isLikedRoutesLoading,
    setMyCreatedPlaces,
    setMyCreatedRoutes,
    setLikedPlaces,
    setLikedRoutes,
    refreshContent,
  };
}