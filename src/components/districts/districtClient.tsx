'use client';

import { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import KakaoMap from '~/src/components/common/kakao-map';
import ToggleSwitch from '~/src/components/common/ToggleSwitch';
import RestaurantListContainer from '~/src/components/districts/RestaurantListContainer';
import RestaurantRouteContainer from '~/src/components/districts/RestaurantRouteContainer';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';
import { useSetAtom } from 'jotai';
import { modalAtom } from '~/src/stores/app-store';
import SortDropdown from '~/src/components/common/SortDropdown';
import Pagination from '~/src/components/common/Pagination';
import { Restaurant } from '~/src/types/restaurant';
import { RouteWithPlaces } from '~/src/components/districts/RestaurantRouteContainer';
import { useQuery } from '@tanstack/react-query';
import { PlaceCategory } from '@prisma/client';
import { cn } from '~/src/utils/class-name';

// Type for the lightweight location data
interface PlaceLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  category: PlaceCategory;
}

// Query Functions
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

const fetchAllRoutesByDistrict = async (
  districtId: string,
  _userId: string | undefined, // currentUserId for like status
): Promise<RouteWithPlaces[]> => {
  if (!districtId) return [];
  const response = await fetch(
    `/api/routes/locations?districtId=${districtId}`,
  );
  if (!response.ok) {
    throw new Error('Failed to fetch routes');
  }
  const data = await response.json();
  return data.routes;
};

interface DistrictClientProps {
  districtId: string;
  districtInfo: (typeof SEOUL_DISTRICTS)[number] | undefined;
  center: { lat: number; lng: number };
  initialPlaces: Restaurant[];
  totalPages: number;
  currentPage: number;
  currentSort: 'recent' | 'likes';
  currentCategory?: PlaceCategory;
}

const TABS: { label: string; value?: PlaceCategory }[] = [
  { label: '전체', value: undefined },
  { label: '식사', value: 'MEAL' },
  { label: '음료', value: 'DRINK' },
];

export default function DistrictClient({
  districtId,
  districtInfo,
  center,
  initialPlaces,
  totalPages,
  currentPage,
  currentSort,
  currentCategory,
}: DistrictClientProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [isRouteView, setIsRouteView] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const setModal = useSetAtom(modalAtom);

  const { data: allPlaceLocations = [] } = useQuery<PlaceLocation[], Error>({
    queryKey: ['placeLocations', districtInfo?.name],
    queryFn: () => fetchAllPlaceLocations(districtInfo?.name),
    enabled: !!districtInfo?.name,
  });

  const { data: routes = [], isLoading: isLoadingRoutes } = useQuery<
    RouteWithPlaces[],
    Error
  >({
    queryKey: ['allRoutes', districtId], // Query key changed to reflect all routes
    queryFn: () => fetchAllRoutesByDistrict(districtId, session?.user?.id), // Pass session.user.id for like status
    enabled: isRouteView, // No longer requires authentication
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

  const handleMarkerClick = (markerId: string) => {
    setModal({ type: 'RESTAURANT_DETAIL', props: { restaurantId: markerId } });
  };

  const selectedRoute = routes.find((r) => r.id === selectedRouteId);

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
    // Filter locations based on the current category
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
  }, [isRouteView, selectedRoute, allPlaceLocations, currentCategory]);

  const mapPolylines =
    isRouteView && selectedRoute
      ? [
          {
            path: selectedRoute.places.map((p) => ({
              lat: p.place.latitude,
              lng: p.place.longitude,
            })),
          },
        ]
      : [];

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
          <RestaurantRouteContainer
            routes={routes}
            isLoading={isLoadingRoutes}
            selectedRouteId={selectedRouteId}
            onSelectRoute={(routeId) => {
              setSelectedRouteId((prev) => (prev === routeId ? null : routeId));
            }}
          />
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
            <RestaurantListContainer
              places={initialPlaces}
              districtName={districtInfo?.name || districtId}
              categoryName={
                TABS.find((tab) => tab.value === currentCategory)?.label ||
                '전체'
              }
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}