import React, { useMemo } from 'react';
import KakaoMap from '~/src/components/common/kakao-map';
import { Place } from '@prisma/client';

interface RouteMapProps {
  selectedRound1Place: Place | null;
  selectedRound2Place: Place | null;
  selectedCafePlace: Place | null;
}

export default function RouteMap({
  selectedRound1Place,
  selectedRound2Place,
  selectedCafePlace,
}: RouteMapProps) {
  const defaultCenter = { lat: 37.5665, lng: 126.978 }; // Seoul City Hall

  const allSelectedPlaces = useMemo(() => {
    const places: Place[] = [];
    if (selectedRound1Place) places.push(selectedRound1Place);
    if (selectedRound2Place) places.push(selectedRound2Place);
    if (selectedCafePlace) places.push(selectedCafePlace);
    return places;
  }, [selectedRound1Place, selectedRound2Place, selectedCafePlace]);

  const mapMarkers = useMemo(() => {
    return allSelectedPlaces.map((place) => ({
      latitude: place.latitude,
      longitude: place.longitude,
      title: place.name,
      id: place.id,
      category: place.category === 'MEAL' ? 'meal1' : 'cafe', // Simplified category for marker icon
    }));
  }, [allSelectedPlaces]);

  const mapCenter = useMemo(() => {
    if (allSelectedPlaces.length === 0) {
      return defaultCenter;
    }
    const totalLat = allSelectedPlaces.reduce(
      (sum, place) => sum + place.latitude,
      0,
    );
    const totalLng = allSelectedPlaces.reduce(
      (sum, place) => sum + place.longitude,
      0,
    );
    return {
      lat: totalLat / allSelectedPlaces.length,
      lng: totalLng / allSelectedPlaces.length,
    };
  }, [allSelectedPlaces]);

  const routePolylines = useMemo(() => {
    const path: { lat: number; lng: number }[] = [];
    const polylines = [];

    if (selectedRound1Place)
      path.push({
        lat: selectedRound1Place.latitude,
        lng: selectedRound1Place.longitude,
      });
    if (selectedRound2Place)
      path.push({
        lat: selectedRound2Place.latitude,
        lng: selectedRound2Place.longitude,
      });
    if (selectedCafePlace)
      path.push({
        lat: selectedCafePlace.latitude,
        lng: selectedCafePlace.longitude,
      });

    if (path.length >= 2) {
      // Draw line from Round1 to Round2
      if (selectedRound1Place && selectedRound2Place) {
        polylines.push({
          path: [
            {
              lat: selectedRound1Place.latitude,
              lng: selectedRound1Place.longitude,
            },
            {
              lat: selectedRound2Place.latitude,
              lng: selectedRound2Place.longitude,
            },
          ],
          strokeColor: '#FF0000', // Red for first segment
          strokeWeight: 4,
          strokeOpacity: 0.8,
        });
      }

      // Draw line from Round2 to Cafe
      if (selectedRound2Place && selectedCafePlace) {
        polylines.push({
          path: [
            {
              lat: selectedRound2Place.latitude,
              lng: selectedRound2Place.longitude,
            },
            {
              lat: selectedCafePlace.latitude,
              lng: selectedCafePlace.longitude,
            },
          ],
          strokeColor: '#0000FF', // Blue for second segment
          strokeWeight: 4,
          strokeOpacity: 0.8,
        });
      }

      // If only Round1 and Cafe are selected, draw a direct line
      if (!selectedRound2Place && selectedRound1Place && selectedCafePlace) {
        polylines.push({
          path: [
            {
              lat: selectedRound1Place.latitude,
              lng: selectedRound1Place.longitude,
            },
            {
              lat: selectedCafePlace.latitude,
              lng: selectedCafePlace.longitude,
            },
          ],
          strokeColor: '#00FF00', // Green for direct segment
          strokeWeight: 4,
          strokeOpacity: 0.8,
        });
      }
    }

    return polylines;
  }, [selectedRound1Place, selectedRound2Place, selectedCafePlace]);

  return (
    <div className="w-full h-[300px] rounded-md overflow-hidden">
      <KakaoMap
        latitude={mapCenter.lat}
        longitude={mapCenter.lng}
        markers={mapMarkers}
        selectedMarkerIds={allSelectedPlaces.map((p) => p.id)} // Highlight all selected places
        polylines={routePolylines}
        className="w-full h-full"
      />
    </div>
  );
}
