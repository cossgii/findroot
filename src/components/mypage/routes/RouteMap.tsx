import React, { useMemo } from 'react';
import KakaoMap from '~/src/components/common/kakao-map';
import { Place } from '@prisma/client';
import { RouteStop } from '~/src/hooks/mypage/useAddRouteForm';

interface RouteMapProps {
  stops: RouteStop[];
  center?: { lat: number; lng: number }; // Made optional
  districtPlaces: Place[];
}

const DEFAULT_MAP_CENTER = { lat: 37.5665, lng: 126.978 }; // Seoul City Hall

export default function RouteMap({ stops, center, districtPlaces }: RouteMapProps) {
  const routePlaces = useMemo(() => stops.map((stop) => stop.place), [stops]);

  const mapMarkers = useMemo(() => {
    const allPlaces = new Map<string, Place>();

    // Add district places first
    districtPlaces.forEach((p) => allPlaces.set(p.id, p));
    // Add/overwrite with places in the current route, to ensure they are included
    routePlaces.forEach((p) => allPlaces.set(p.id, p));

    return Array.from(allPlaces.values()).map((place) => ({
      latitude: place.latitude,
      longitude: place.longitude,
      title: place.name,
      id: place.id,
      category: place.category,
    }));
  }, [districtPlaces, routePlaces]);

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
        latitude={center?.lat || DEFAULT_MAP_CENTER.lat} // Use fallback
        longitude={center?.lng || DEFAULT_MAP_CENTER.lng} // Use fallback
        markers={mapMarkers}
        selectedMarkerIds={routePlaces.map((p) => p.id)} // Highlight only stops in the route
        polylines={routePolylines}
        className="w-full h-full"
      />
    </div>
  );
}