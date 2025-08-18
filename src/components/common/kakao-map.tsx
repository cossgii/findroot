'use client';

import { HTMLAttributes, useEffect, useRef, memo } from 'react';
import { useAtomValue } from 'jotai';
import { isKakaoMapApiLoadedAtom } from '~/src/stores/app-store';

interface MarkerData {
  latitude: number;
  longitude: number;
  title: string;
  id: string;
  category?: string;
}

interface KakaoMapProps extends HTMLAttributes<HTMLDivElement> {
  latitude: number;
  longitude: number;
  markers?: MarkerData[];
  selectedMarkerIds?: string[];
  onMarkerClick?: (id: string) => void;
  polylines?: {
    path: { lat: number; lng: number }[];
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWeight?: number;
  }[];
}

const KakaoMap = ({
  latitude,
  longitude,
  markers = [],
  selectedMarkerIds,
  onMarkerClick,
  polylines,
  ...rest
}: KakaoMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<kakao.maps.Map | null>(null);
  const markerInstancesRef = useRef<kakao.maps.Marker[]>([]);
  const polylineInstancesRef = useRef<kakao.maps.Polyline[]>([]);
  const isApiLoaded = useAtomValue(isKakaoMapApiLoadedAtom);

  // Effect 1: Map Initialization
  useEffect(() => {
    if (isApiLoaded && mapContainerRef.current && !mapInstanceRef.current) {
      const mapOption = {
        center: new window.kakao.maps.LatLng(latitude, longitude),
        level: 3,
      };
      const map = new window.kakao.maps.Map(mapContainerRef.current, mapOption);
      mapInstanceRef.current = map;
    }
  }, [isApiLoaded, latitude, longitude]);

  // Effect 2: Update Center
  useEffect(() => {
    if (mapInstanceRef.current) {
      const newCenter = new window.kakao.maps.LatLng(latitude, longitude);
      mapInstanceRef.current.setCenter(newCenter);
    }
  }, [latitude, longitude]);

  // Effect 3: Update Markers and Polylines
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    markerInstancesRef.current.forEach((marker) => marker.setMap(null));
    markerInstancesRef.current = [];

    // Add new markers
    markers.forEach((markerData) => {
      const markerPosition = new window.kakao.maps.LatLng(
        markerData.latitude,
        markerData.longitude,
      );

      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
        title: markerData.title,
      });

      marker.setMap(map);
      markerInstancesRef.current.push(marker);

      if (markerData.id && onMarkerClick) {
        window.kakao.maps.event.addListener(marker, 'click', () => {
          onMarkerClick(markerData.id);
        });
      }
    });

    // Clear existing polylines
    polylineInstancesRef.current.forEach((line) => line.setMap(null));
    polylineInstancesRef.current = [];

    // Add new polylines
    polylines?.forEach((lineData) => {
      const path = lineData.path.map(
        (p) => new window.kakao.maps.LatLng(p.lat, p.lng),
      );
      const polyline = new window.kakao.maps.Polyline({
        path: path,
        strokeWeight: lineData.strokeWeight || 5,
        strokeColor: lineData.strokeColor || '#FFAE00',
        strokeOpacity: lineData.strokeOpacity || 0.7,
        strokeStyle: 'solid',
      });
      polyline.setMap(map);
      polylineInstancesRef.current.push(polyline);
    });
  }, [markers, polylines, onMarkerClick, selectedMarkerIds]);

  return (
    <div
      ref={mapContainerRef}
      {...rest}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default memo(KakaoMap);
