'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { User, Like, Place, Route } from '@prisma/client';
import { MyPageTab } from '~/src/components/mypage/MyPageTabs';

export interface LikedPlace extends Like {
  place: Place;
}

export interface MyLikedRoute extends Like {
  route: Route;
}

export function useMyPageData(activeTab: MyPageTab) {
  const { data: session, status } = useSession();

  const [user, setUser] = useState<User | null>(null);
  const [likedPlaces, setLikedPlaces] = useState<LikedPlace[]>([]);
  const [likedRoutes, setLikedRoutes] = useState<MyLikedRoute[]>([]);
  const [myCreatedPlaces, setMyCreatedPlaces] = useState<Place[]>([]);
  const [myCreatedRoutes, setMyCreatedRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfileData = useCallback(async () => {
    if (!session?.user?.id) return;
    setIsLoading(true);
    const res = await fetch('/api/users/me').catch(() => null);
    if (res?.ok) setUser(await res.json());
    setIsLoading(false);
  }, [session]);

  const fetchMyContent = useCallback(async () => {
    if (!session?.user?.id) return;
    setIsLoading(true);
    const [placesRes, routesRes] = await Promise.all([
      fetch(`/api/users/${session.user.id}/places`),
      fetch(`/api/users/${session.user.id}/routes`),
    ]);
    if (placesRes.ok) setMyCreatedPlaces(await placesRes.json());
    if (routesRes.ok) setMyCreatedRoutes(await routesRes.json());
    setIsLoading(false);
  }, [session]);

  const fetchLikedContent = useCallback(async () => {
    if (!session?.user?.id) return;
    setIsLoading(true);
    const [placesRes, routesRes] = await Promise.all([
      fetch('/api/users/me/liked-places'),
      fetch('/api/users/me/liked-routes'),
    ]);
    if (placesRes.ok) setLikedPlaces(await placesRes.json());
    if (routesRes.ok) setLikedRoutes(await routesRes.json());
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
        fetchMyContent();
        break;
      case 'likes':
        fetchLikedContent();
        break;
      default:
        setIsLoading(false);
        break;
    }
  }, [status, activeTab, fetchProfileData, fetchMyContent, fetchLikedContent]);

  const refreshContent = useCallback(() => {
    if (activeTab === 'content') {
      fetchMyContent();
    }
  }, [activeTab, fetchMyContent]);

  return {
    session,
    status,
    user,
    setUser,
    likedPlaces,
    likedRoutes,
    myCreatedPlaces,
    setMyCreatedPlaces,
    myCreatedRoutes,
    setMyCreatedRoutes,
    isLoading,
    refreshContent,
    fetchMyContent,
    fetchLikedContent,
  };
}
