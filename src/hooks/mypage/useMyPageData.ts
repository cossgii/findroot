'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { User } from '@prisma/client';
import { MyPageTab } from '~/src/components/mypage/MyPageTabs';
import { Restaurant, RouteWithLikeData } from '~/src/types/restaurant';

// Define a generic paginated response type
export interface PaginatedResponse<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
}

export function useMyPageData(activeTab: MyPageTab, districtId: string) {
  const { data: session, status } = useSession();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // State for 'content' tab
  const [myCreatedPlaces, setMyCreatedPlaces] = useState<PaginatedResponse<Restaurant>>({ data: [], totalPages: 1, currentPage: 1 });
  const [myCreatedRoutes, setMyCreatedRoutes] = useState<PaginatedResponse<RouteWithLikeData>>({ data: [], totalPages: 1, currentPage: 1 });

  // State for 'likes' tab
  const [likedPlaces, setLikedPlaces] = useState<PaginatedResponse<Restaurant>>({ data: [], totalPages: 1, currentPage: 1 });
  const [likedRoutes, setLikedRoutes] = useState<PaginatedResponse<RouteWithLikeData>>({ data: [], totalPages: 1, currentPage: 1 });

  const fetchProfileData = useCallback(async () => {
    if (!session?.user?.id) return;
    setIsLoading(true);
    const res = await fetch('/api/users/me').catch(() => null);
    if (res?.ok) setUser(await res.json());
    setIsLoading(false);
  }, [session]);

  const fetchMyCreatedPlaces = useCallback(async (page: number = 1, district: string = 'all') => {
    if (!session?.user?.id) return;
    setIsLoading(true);
    const res = await fetch(`/api/users/${session.user.id}/places?page=${page}&limit=5&districtId=${district}`);
    if (res.ok) {
        const data = await res.json();
        setMyCreatedPlaces({ data: data.places, totalPages: data.totalPages, currentPage: data.currentPage });
    }
    setIsLoading(false);
  }, [session]);

  const fetchMyCreatedRoutes = useCallback(async (page: number = 1, district: string = 'all') => {
    if (!session?.user?.id) return;
    setIsLoading(true);
    const res = await fetch(`/api/users/${session.user.id}/routes?page=${page}&limit=5&districtId=${district}`);
    if (res.ok) {
        const data = await res.json();
        setMyCreatedRoutes({ data: data.routes, totalPages: data.totalPages, currentPage: data.currentPage });
    }
    setIsLoading(false);
  }, [session]);

  const fetchLikedPlaces = useCallback(async (page: number = 1, district: string = 'all') => {
    if (!session?.user?.id) return;
    setIsLoading(true);
    const res = await fetch(`/api/users/me/liked-places?page=${page}&limit=5&districtId=${district}`);
    if (res.ok) {
        const data = await res.json();
        setLikedPlaces({ data: data.places, totalPages: data.totalPages, currentPage: data.currentPage });
    }
    setIsLoading(false);
  }, [session]);

  const fetchLikedRoutes = useCallback(async (page: number = 1, district: string = 'all') => {
    if (!session?.user?.id) return;
    setIsLoading(true);
    const res = await fetch(`/api/users/me/liked-routes?page=${page}&limit=5&districtId=${district}`);
    if (res.ok) {
        const data = await res.json();
        setLikedRoutes({ data: data.routes, totalPages: data.totalPages, currentPage: data.currentPage });
    }
    setIsLoading(false);
  }, [session]);


  useEffect(() => {
    if (status !== 'authenticated') {
      setIsLoading(false);
      return;
    }

    switch (activeTab) {
      case 'profile':
        fetchProfileData();
        break;
      case 'content':
        fetchMyCreatedPlaces(1, districtId);
        fetchMyCreatedRoutes(1, districtId);
        break;
      case 'likes':
        fetchLikedPlaces(1, districtId);
        fetchLikedRoutes(1, districtId);
        break;
      default:
        setIsLoading(false);
        break;
    }
  }, [status, activeTab, districtId, fetchProfileData, fetchMyCreatedPlaces, fetchMyCreatedRoutes, fetchLikedPlaces, fetchLikedRoutes]);

  const refreshContent = useCallback(() => {
    if (activeTab === 'content') {
        fetchMyCreatedPlaces(myCreatedPlaces.currentPage, districtId);
        fetchMyCreatedRoutes(myCreatedRoutes.currentPage, districtId);
    } else if (activeTab === 'likes') {
        fetchLikedPlaces(likedPlaces.currentPage, districtId);
        fetchLikedRoutes(likedRoutes.currentPage, districtId);
    }
  }, [activeTab, districtId, fetchMyCreatedPlaces, fetchMyCreatedRoutes, myCreatedPlaces.currentPage, myCreatedRoutes.currentPage, fetchLikedPlaces, fetchLikedRoutes, likedPlaces.currentPage, likedRoutes.currentPage]);

  return {
    session,
    status,
    user,
    setUser,
    myCreatedPlaces,
    myCreatedRoutes,
    likedPlaces,
    likedRoutes,
    isLoading,
    setMyCreatedPlaces,
    setMyCreatedRoutes,
    setLikedPlaces,
    setLikedRoutes,
    refreshContent,
    fetchMyCreatedPlaces,
    fetchMyCreatedRoutes,
    fetchLikedPlaces,
    fetchLikedRoutes,
  };
}