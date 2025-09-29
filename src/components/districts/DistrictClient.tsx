'use client';

import { useState, useMemo, Suspense, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import KakaoMap from '~/src/components/common/KakaoMap';
import ToggleSwitch from '~/src/components/common/ToggleSwitch';
import RestaurantRouteContainer from '~/src/components/districts/RestaurantRouteContainer';
import { useSetAtom, useAtomValue } from 'jotai';
import { modalAtom, isKakaoMapApiLoadedAtom } from '~/src/stores/app-store';
import SortDropdown from '~/src/components/common/SortDropdown';
import Pagination from '~/src/components/common/Pagination';
import { RouteWithPlaces } from '~/src/components/districts/RestaurantRouteContainer';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { PlaceCategory } from '~/src/types/shared';
import { cn } from '~/src/utils/class-name';
import { usePaginatedQuery } from '~/src/hooks/usePaginatedQuery';
import PlaceList from './PlaceList';
import RestaurantListSkeletonGrid from './RestaurantListSkeletonGrid';
import RouteContainerSkeleton from './RouteContainerSkeleton';
import { Place } from '@prisma/client';

type SerializablePlace = Omit<Place, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

type PlaceWithLikes = SerializablePlace & {
  likesCount: number;
  isLiked: boolean;
};

interface DistrictClientProps {
  districtId: string;
  districtInfo: { name: string; lat: number; lng: number } | undefined;
  center: { lat: number; lng: number };
  currentSort: 'recent' | 'likes';
  currentCategory?: PlaceCategory;
  currentPage: number;
  // 새로 추가된 props
  initialPlaces: PlaceWithLikes[];
  initialTotalPages: number;
}

interface PlaceLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  category: PlaceCategory;
}

const fetchAllPlaceLocations = async (
  districtName: string | undefined,
): Promise<PlaceLocation[]> => {
  if (!districtName) return [];
  const response = await fetch(
    `/api/places/locations?district=${districtName}`,
  );
  if (!response.ok) {
    throw new Error('Failed to fetch all place locations');
  }
  return response.json();
};

const TABS: { label: string; value?: PlaceCategory }[] = [
  { label: '전체', value: undefined },
  { label: '식사', value: PlaceCategory.MEAL },
  { label: '음료', value: PlaceCategory.DRINK },
];

const RouteListDisplay = ({
  districtId,
  initialPage,
  selectedRouteId,
  onSelectRoute,
}: {
  districtId: string;
  initialPage: number;
  selectedRouteId: string | null;
  onSelectRoute: (routeId: string) => void;
}) => {
  const { data: session } = useSession();
  const userId = session?.user?.id || '';

  const { data, page, setPage } = usePaginatedQuery<RouteWithPlaces>({
    queryKey: ['allRoutes', districtId],
    apiEndpoint: `/api/routes/locations`,
    queryParams: { districtId, limit: 5 },
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

export default function DistrictClient({
  districtId,
  districtInfo,
  center,
  currentPage,
  currentSort,
  currentCategory,
  initialPlaces,
  initialTotalPages,
}: DistrictClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isRouteView, setIsRouteView] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const setModal = useSetAtom(modalAtom);
  const isApiLoaded = useAtomValue(isKakaoMapApiLoadedAtom);

  useEffect(() => {
    if (isRouteView && !session) {
      setModal({
        type: 'LOGIN_PROMPT',
        props: {
          title: '로그인이 필요합니다',
          message:
            '로그인하고 다른 사용자들이 만든 다양한 루트를 확인해보세요!',
          onConfirm: () => router.push('/login'),
          onCancel: () => setIsRouteView(false),
        },
      });
    }
  }, [isRouteView, session, setModal, router]);

  const { data: allPlaceLocations = [] } = useQuery<PlaceLocation[], Error>({
    queryKey: ['placeLocations', districtInfo?.name],
    queryFn: () => fetchAllPlaceLocations(districtInfo?.name),
    enabled: !!districtInfo?.name,
  });

  const handleUrlChange = (newParams: Record<string, string | number>) => {
    const params = new URLSearchParams();
    params.set('sort', newParams.sort?.toString() || currentSort);
    params.set('page', newParams.page?.toString() || '1');
    if (newParams.category) {
      params.set('category', newParams.category.toString());
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleCategoryChange = (category?: PlaceCategory) => {
    handleUrlChange({ category: category || '', page: 1 });
  };

  const handleSortChange = (sortOption: string) => {
    handleUrlChange({
      sort: sortOption,
      page: 1,
      category: currentCategory || '',
    });
  };

  const handlePageChange = (page: number) => {
    handleUrlChange({ page, category: currentCategory || '' });
  };

  const handleMarkerClick = useCallback(
    (markerId: string) => {
      setModal({
        type: 'RESTAURANT_DETAIL',
        props: { restaurantId: markerId },
      });
    },
    [setModal],
  );

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

  const { data, isLoading } = useQuery({
    queryKey: [
      'places',
      districtInfo?.name,
      currentSort,
      currentCategory,
      currentPage,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        district: districtInfo?.name || '전체',
        sort: currentSort,
        page: currentPage.toString(),
      });
      if (currentCategory) {
        params.set('category', currentCategory);
      }

      const response = await fetch(`/api/places?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch places on client');
      }
      return response.json();
    },
    initialData: {
      places: initialPlaces,
      totalPages: initialTotalPages,
      currentPage: currentPage,
    },
    placeholderData: keepPreviousData,
  });

  const mapMarkers = useMemo(() => {
    if (isRouteView) {
      return (
        selectedRoute?.places.map((p) => ({
          id: p.place.id,
          title: p.place.name,
          latitude: p.place.latitude,
          longitude: p.place.longitude,
          category: p.place.category,
        })) ?? []
      );
    }
    const filteredLocations = currentCategory
      ? allPlaceLocations.filter((p) => p.category === currentCategory)
      : allPlaceLocations;

    return filteredLocations.map((p) => ({
      id: p.id,
      title: p.name,
      latitude: p.latitude,
      longitude: p.longitude,
      category: p.category,
    }));
  }, [
    isRouteView,
    selectedRoute,
    allPlaceLocations,
    currentCategory,
    isApiLoaded,
  ]);

  const mapPolylines = useMemo(() => {
    return isRouteView && selectedRoute
      ? [
          {
            path: selectedRoute.places.map((p) => ({
              lat: p.place.latitude,
              lng: p.place.longitude,
            })),
          },
        ]
      : [];
  }, [isRouteView, selectedRoute]);

  return (
    <div className="flex flex-col desktop:flex-row h-full desktop:gap-4">
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
            {`${districtInfo?.name || districtId} ${
              isRouteView ? '맛집 루트' : '맛집 정보'
            }`}
          </h2>
          <ToggleSwitch
            isOn={isRouteView}
            onToggle={() => {
              setIsRouteView(!isRouteView);
              setSelectedRouteId(null);
            }}
            optionLabels={['목록', '루트']}
          />
        </div>
        {isRouteView ? (
          session ? (
            <Suspense fallback={<RouteContainerSkeleton />}>
              <RouteListDisplay
                districtId={districtId}
                initialPage={currentPage}
                selectedRouteId={selectedRouteId}
                onSelectRoute={(routeId) => {
                  setSelectedRouteId((prev) =>
                    prev === routeId ? null : routeId,
                  );
                }}
              />
            </Suspense>
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                루트 정보는 로그인 후 볼 수 있습니다.
              </p>
            </div>
          )
        ) : (
          <div>
            <div className="border-b border-gray-200 mb-4">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {TABS.map((tab) => (
                  <button
                    key={tab.label}
                    onClick={() => handleCategoryChange(tab.value)}
                    className={cn(
                      'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium',
                      currentCategory === tab.value
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <SortDropdown
              currentSort={currentSort}
              onSortChange={handleSortChange}
            />
            {isLoading ? (
              <RestaurantListSkeletonGrid />
            ) : (
              <PlaceList
                places={data?.places || []}
                districtName={districtInfo?.name || '전체'}
                categoryName={
                  TABS.find((tab) => tab.value === currentCategory)?.label ||
                  '전체'
                }
                totalPages={data?.totalPages || 1}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
