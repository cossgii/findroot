'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import KakaoMap from '~/src/components/common/kakao-map';
import ToggleSwitch from '~/src/components/common/ToggleSwitch';
import RestaurantListContainer from '~/src/components/districts/RestaurantListContainer';
import RestaurantRouteContainer from '~/src/components/districts/RestaurantRouteContainer';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';
import { Place, Route } from '@prisma/client';

import { useSetAtom } from 'jotai';
import { modalAtom } from '~/src/stores/app-store';

interface RouteWithPlaces extends Route {
  places: { place: Place }[];
}

interface DistrictClientProps {
  districtId: string;
  districtInfo: (typeof SEOUL_DISTRICTS)[number] | undefined;
  center: { lat: number; lng: number };
  places: Place[];
}

export default function DistrictClient({
  districtId,
  districtInfo,
  center,
  places,
}: DistrictClientProps) {
  const { data: session } = useSession();
  const [isRouteView, setIsRouteView] = useState(false);

  const [routes, setRoutes] = useState<RouteWithPlaces[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const setModal = useSetAtom(modalAtom);

  const handleMarkerClick = (markerId: string) => {
    setModal({ type: 'RESTAURANT_DETAIL', props: { restaurantId: markerId } });
  };

  useEffect(() => {
    if (isRouteView && session?.user?.id) {
      const fetchRoutes = async () => {
        setIsLoadingRoutes(true);
        try {
          const response = await fetch(`/api/users/${session.user.id}/routes?districtId=${districtId}`);
          if (response.ok) {
            const data = await response.json();
            setRoutes(data);
          }
        } catch (error) {
          console.error('Failed to fetch routes:', error);
        }
        setIsLoadingRoutes(false);
      };
      fetchRoutes();
    }
  }, [isRouteView, districtId, session]);

  const selectedRoute = routes.find((r) => r.id === selectedRouteId);

  const mapMarkers = isRouteView
    ? selectedRoute?.places.map((p) => ({
        id: p.place.id,
        title: p.place.name,
        latitude: p.place.latitude,
        longitude: p.place.longitude,
      })) ?? []
    : places.map((p) => ({
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
              setSelectedRouteId(null); // Reset selection when toggling
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
              // Toggle selection: if same route is clicked, deselect. Otherwise, select.
              setSelectedRouteId((prev) => (prev === routeId ? null : routeId));
            }}
          />
        ) : (
          <RestaurantListContainer places={places} />
        )}
      </div>
    </div>
  );
}
