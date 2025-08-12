
import React, { useMemo } from 'react';
import KakaoMap from '~/src/components/common/kakao-map';
import { Place } from '@prisma/client';

interface RouteMapProps {
  userPlaces: Place[];
  selectedPlaces: string[];
  onMarkerClick: (id: string) => void;
}

export default function RouteMap({ userPlaces, selectedPlaces, onMarkerClick }: RouteMapProps) {
  const defaultCenter = { lat: 37.5665, lng: 126.978 }; // Seoul City Hall

  const mapMarkers = useMemo(() => {
    return userPlaces.map((place) => ({
      latitude: place.latitude,
      longitude: place.longitude,
      title: place.name,
      id: place.id,
      category: place.category ?? undefined,
    }));
  }, [userPlaces]);

  const mapCenter = useMemo(() => {
    if (userPlaces.length === 0) {
      return defaultCenter;
    }
    const totalLat = userPlaces.reduce((sum, place) => sum + place.latitude, 0);
    const totalLng = userPlaces.reduce(
      (sum, place) => sum + place.longitude,
      0,
    );
    return {
      lat: totalLat / userPlaces.length,
      lng: totalLng / userPlaces.length,
    };
  }, [userPlaces]);

  const selectedPlaceObjects = useMemo(() => {
    return selectedPlaces
      .map((id) => userPlaces.find((place) => place.id === id))
      .filter(Boolean) as Place[];
  }, [selectedPlaces, userPlaces]);

  const routePolylines = useMemo(() => {
    if (selectedPlaceObjects.length < 2) {
      return [];
    }

    const path = selectedPlaceObjects.map((place) => ({
      lat: place.latitude,
      lng: place.longitude,
    }));

    if (selectedPlaceObjects.length === 3) {
      return [
        {
          path: [...path, path[0]],
          strokeColor: '#FF0000',
          strokeWeight: 4,
          strokeOpacity: 0.8,
        }, // Triangle
      ];
    } else if (selectedPlaceObjects.length > 1) {
      return [
        {
          path: path,
          strokeColor: '#0000FF',
          strokeWeight: 4,
          strokeOpacity: 0.8,
        }, // Line segment or polyline
      ];
    }
    return [];
  }, [selectedPlaceObjects]);

  return (
    <div className="w-full h-[300px] rounded-md overflow-hidden">
      <KakaoMap
        latitude={mapCenter.lat}
        longitude={mapCenter.lng}
        markers={mapMarkers}
        selectedMarkerIds={selectedPlaces}
        onMarkerClick={onMarkerClick}
        polylines={routePolylines}
        className="w-full h-full"
      />
    </div>
  );
}
