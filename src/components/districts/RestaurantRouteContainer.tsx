'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import RestaurantCard from '~/src/components/districts/restaurant-card';
import { Place, Route } from '@prisma/client';

// Define a type for Route with included Places
interface RouteWithPlaces extends Route {
  placeForRound1: Place | null;
  placeForRound2: Place | null;
  placeForCafe: Place | null;
}

interface RestaurantRouteContainerProps {
  districtId: string;
  // places prop is no longer directly used for route generation, but might be useful for map later
  // places: Place[]; // Removed as it's not used for route generation anymore
}

export default function RestaurantRouteContainer({
  districtId,
}: RestaurantRouteContainerProps) {
  const { data: session, status } = useSession();
  const [routes, setRoutes] = useState<RouteWithPlaces[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return; // Wait for session to load

    if (!session?.user?.id) {
      setLoading(false);
      setError('로그인 후 사용자 생성 루트를 볼 수 있습니다.');
      return;
    }

    const fetchUserRoutes = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/users/${session.user.id}/routes?districtId=${districtId}`,
        );
        if (!response.ok) {
          throw new Error('Failed to fetch user routes');
        }
        const data: RouteWithPlaces[] = await response.json();
        setRoutes(data);
      } catch (err) {
        console.error('Error fetching user routes:', err);
        setError('사용자 루트를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoutes();
  }, [districtId, session, status]); // Depend on districtId and session status

  if (loading) {
    return <p className="text-gray-500">사용자 루트를 불러오는 중...</p>;
  }

  if (error) {
    return <p className="text-red-500">오류: {error}</p>;
  }

  if (routes.length === 0) {
    return (
      <p className="text-gray-500">
        이 지역에 생성된 사용자 루트가 없습니다.
      </p>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      {routes.map((route) => (
        <div key={route.id} className="p-4 bg-blue-50 rounded-lg shadow-sm">
          <h3 className="text-xl font-bold mb-2">루트 이름: {route.name}</h3>
          {route.description && (
            <p className="text-gray-700 mb-2">설명: {route.description}</p>
          )}
          <h4 className="text-lg font-semibold mt-4 mb-2">루트 상세 장소</h4>
          <div className="flex flex-col space-y-4">
            {route.placeForRound1 && (
              <RestaurantCard
                id={route.placeForRound1.id}
                name={route.placeForRound1.name}
                description={route.placeForRound1.description || ''}
                address={route.placeForRound1.address || ''}
                district={route.placeForRound1.district || ''}
              />
            )}
            {route.placeForRound2 && (
              <RestaurantCard
                id={route.placeForRound2.id}
                name={route.placeForRound2.name}
                description={route.placeForRound2.description || ''}
                address={route.placeForRound2.address || ''}
                district={route.placeForRound2.district || ''}
              />
            )}
            {route.placeForCafe && (
              <RestaurantCard
                id={route.placeForCafe.id}
                name={route.placeForCafe.name}
                description={route.placeForCafe.description || ''}
                address={route.placeForCafe.address || ''}
                district={route.placeForCafe.district || ''}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

