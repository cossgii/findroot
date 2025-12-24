'use client';

import { useState, useMemo, Suspense, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import KakaoMap from '~/src/components/common/KakaoMap';
import { useSetAtom, useAtomValue } from 'jotai';
import { modalAtom, isKakaoMapApiLoadedAtom } from '~/src/stores/app-store';
import Pagination from '~/src/components/common/Pagination';
import { RouteWithPlaces } from '~/src/components/districts/RestaurantRouteContainer';
import { useQuery } from '@tanstack/react-query';
import { usePaginatedQuery } from '~/src/hooks/usePaginatedQuery';
import RouteContainerSkeleton from './RouteContainerSkeleton';
import RestaurantRouteContainer from '~/src/components/districts/RestaurantRouteContainer';
import DistrictViewToggle from './DistrictViewToggle';
import { PlaceCategory } from '~/src/types/shared';
import { RoutePurpose } from '@prisma/client';

interface DistrictRoutesClientProps {
  districtId: string;
  districtInfo: { name: string; lat: number; lng: number } | undefined;
  center: { lat: number; lng: number };
}

const RouteListDisplay = ({
  districtId,
  initialPage,
  selectedRouteId,
  onSelectRoute,
  purpose,
}: {
  districtId: string;
  initialPage: number;
  selectedRouteId: string | null;
  onSelectRoute: (routeId: string) => void;
  purpose?: RoutePurpose;
}) => {
  const { data: session } = useSession();
  const userId = session?.user?.id || '';

  const { data, page, setPage } = usePaginatedQuery<RouteWithPlaces>({
    queryKey: ['allRoutes', districtId, purpose],
    apiEndpoint: `/api/routes/locations`,
    queryParams: { districtId, limit: 5, purpose },
    initialPage: initialPage,
    suspense: true,
    enabled: !!userId,
  });

  return (
    <>
      <RestaurantRouteContainer
        routes={data?.data || []}
        isLoading={false}
        selectedRouteId={selectedRouteId}
        onSelectRoute={onSelectRoute}
      />
      <Pagination
        currentPage={page}
        totalPages={data?.totalPages || 1}
        onPageChange={setPage}
      />
    </>
  );
};

export default function DistrictRoutesClient({
  districtId,
  districtInfo,
  center,
}: DistrictRoutesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const setModal = useSetAtom(modalAtom);
  const isApiLoaded = useAtomValue(isKakaoMapApiLoadedAtom);

  const purpose = searchParams.get('purpose') as RoutePurpose | null;

  useEffect(() => {
    if (!session) {
      setModal({
        type: 'LOGIN_PROMPT',
        props: {
          title: '로그인이 필요합니다',
          message:
            '로그인하고 다른 사용자들이 만든 다양한 루트를 확인해보세요!',
          onConfirm: () => router.push('/login'),
          onCancel: () => router.push(`/districts/${districtId}`),
        },
      });
    }
  }, [session, setModal, router, districtId]);

  const { data: selectedRoute } = useQuery<RouteWithPlaces, Error>({
    queryKey: ['route', selectedRouteId],
    queryFn: async () => {
      if (!selectedRouteId) throw new Error('No route ID provided');
      const response = await fetch(`/api/routes/${selectedRouteId}`);
      if (!response.ok)
        throw new Error(`Failed to fetch route: ${response.statusText}`);
      return response.json();
    },
    enabled: !!selectedRouteId,
  });

  const mapMarkers = useMemo(() => {
    return (
      selectedRoute?.places.map((p) => ({
        id: p.place.id,
        title: p.place.name,
        latitude: p.place.latitude,
        longitude: p.place.longitude,
        category: p.place.category as PlaceCategory,
      })) ?? []
    );
  }, [selectedRoute, isApiLoaded]);

  const mapPolylines = useMemo(() => {
    return selectedRoute
      ? [
          {
            path: selectedRoute.places.map((p) => ({
              lat: p.place.latitude,
              lng: p.place.longitude,
            })),
          },
        ]
      : [];
  }, [selectedRoute]);

  const handleMarkerClick = useCallback(
    (markerId: string) => {
      setModal({
        type: 'RESTAURANT_DETAIL',
        props: { restaurantId: markerId },
      });
    },
    [setModal],
  );

  return (
    <div className="flex flex-col desktop:flex-row h-full desktop:gap-4 desktop:items-center">
      <div className="w-full mobile:w-[375px] tablet:w-[744px] desktop:w-1/2 mx-auto h-[440px] aspect-video desktop:h-full relative">
        <KakaoMap
          latitude={center.lat}
          longitude={center.lng}
          markers={mapMarkers}
          polylines={mapPolylines}
          onMarkerClick={handleMarkerClick}
          className="absolute inset-0 w-full h-full"
        />
      </div>
      <div className="flex-grow desktop:w-1/2 p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {`${districtInfo?.name || districtId} 맛집 루트`}
          </h2>
          <DistrictViewToggle districtId={districtId} />
        </div>
        {session ? (
          <Suspense fallback={<RouteContainerSkeleton />}>
            <RouteListDisplay
              districtId={districtId}
              initialPage={1}
              selectedRouteId={selectedRouteId}
              onSelectRoute={(routeId) => {
                setSelectedRouteId((prev) =>
                  prev === routeId ? null : routeId,
                );
              }}
              purpose={purpose ?? undefined}
            />
          </Suspense>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              루트 정보는 로그인 후 볼 수 있습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
