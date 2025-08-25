'use client';

import { useState } from 'react';
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

// Type for the lightweight location data
interface PlaceLocation {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
}

// Query Functions
const fetchAllPlaceLocations = async (districtName: string | undefined): Promise<PlaceLocation[]> => {
    if (!districtName) return [];
    const response = await fetch(`/api/places/locations?district=${districtName}`);
    if (!response.ok) {
        throw new Error('Failed to fetch all place locations');
    }
    return response.json();
};

const fetchUserRoutesByDistrict = async (userId: string | undefined, districtId: string): Promise<RouteWithPlaces[]> => {
    if (!userId) return [];
    const response = await fetch(`/api/users/${userId}/routes?districtId=${districtId}`);
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
}

export default function DistrictClient({
  districtId,
  districtInfo,
  center,
  initialPlaces,
  totalPages,
  currentPage,
  currentSort,
}: DistrictClientProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [isRouteView, setIsRouteView] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const setModal = useSetAtom(modalAtom);

  // Use useQuery for allPlaceLocations
  const { data: allPlaceLocations = [] } = useQuery<PlaceLocation[], Error>({
      queryKey: ['placeLocations', districtInfo?.name],
      queryFn: () => fetchAllPlaceLocations(districtInfo?.name),
      enabled: !!districtInfo?.name, // Only run query if districtInfo.name exists
  });

  // Use useQuery for routes
  const { data: routes = [], isLoading: isLoadingRoutes } = useQuery<RouteWithPlaces[], Error>({
      queryKey: ['userRoutes', session?.user?.id, districtId],
      queryFn: () => fetchUserRoutesByDistrict(session?.user?.id, districtId),
      enabled: isRouteView && status === 'authenticated',
  });

  const handleSortChange = (sortOption: string) => {
    router.push(`${pathname}?sort=${sortOption}&page=1`);
  };

  const handlePageChange = (page: number) => {
    router.push(`${pathname}?sort=${currentSort}&page=${page}`);
  };

  const handleMarkerClick = (markerId: string) => {
    setModal({ type: 'RESTAURANT_DETAIL', props: { restaurantId: markerId } });
  };

  const selectedRoute = routes.find((r) => r.id === selectedRouteId);

  const mapMarkers = isRouteView
    ? selectedRoute?.places.map((p) => ({
        id: p.place.id,
        title: p.place.name,
        latitude: p.place.latitude,
        longitude: p.place.longitude,
      })) ?? []
    : allPlaceLocations.map((p) => ({ // Use all locations for the map
        id: p.id,
        title: p.name,
        latitude: p.latitude,
        longitude: p.longitude,
      }));

  const mapPolylines = isRouteView && selectedRoute
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
    <div className="flex flex-col h-full">
      <div className="w-full h-[440px] relative">
        <KakaoMap
          latitude={center.lat}
          longitude={center.lng}
          markers={mapMarkers}
          polylines={mapPolylines}
          onMarkerClick={handleMarkerClick}
          className="absolute inset-0 w-full h-full"
        />
      </div>
      <div className="flex-grow p-4 overflow-y-auto">
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
            <SortDropdown
              currentSort={currentSort}
              onSortChange={handleSortChange}
            />
            <RestaurantListContainer places={initialPlaces} />
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