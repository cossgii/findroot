import React, { useMemo } from 'react';
import KakaoMap from '~/src/components/common/KakaoMap';
import { RouteStop } from '~/src/hooks/mypage/useAddRouteForm';

interface RouteMapProps {
  stops: RouteStop[];
  center?: { lat: number; lng: number };
}

const DEFAULT_MAP_CENTER = { lat: 37.5665, lng: 126.978 }; // 시청 위치

export default function RouteMap({ stops, center }: RouteMapProps) {
  const routePlaces = useMemo(() => stops.map((stop) => stop.place), [stops]);

  const mapMarkers = useMemo(() => {
    return routePlaces.map((place) => ({
      latitude: place.latitude,
      longitude: place.longitude,
      title: place.name,
      id: place.id,
      category: place.category,
    }));
  }, [routePlaces]);

  const routePolylines = useMemo(() => {
    if (routePlaces.length < 2) {
      return [];
    }
    const path = routePlaces.map((place) => ({
      lat: place.latitude,
      lng: place.longitude,
    }));

    return [
      {
        path,
        strokeWeight: 4,
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeStyle: 'solid',
      },
    ];
  }, [routePlaces]);

  return (
    <div className="w-full h-full rounded-md overflow-hidden">
      <KakaoMap
        latitude={center?.lat || DEFAULT_MAP_CENTER.lat}
        longitude={center?.lng || DEFAULT_MAP_CENTER.lng}
        markers={mapMarkers}
        selectedMarkerIds={routePlaces.map((p) => p.id)}
        polylines={routePolylines}
        className="w-full h-full"
      />
    </div>
  );
}
