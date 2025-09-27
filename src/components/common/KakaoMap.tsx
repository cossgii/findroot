'use client';

import { HTMLAttributes, useEffect, useRef, memo } from 'react';
import { PlaceCategory } from '~/src/types/shared';
import { useAtomValue } from 'jotai';
import { isKakaoMapApiLoadedAtom } from '~/src/stores/app-store';

interface MarkerData {
  latitude: number;
  longitude: number;
  title: string;
  id: string;
  category?: PlaceCategory;
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

const markerImageSrc = {
  MEAL: '/assets/marker-meal.png',
  DRINK: '/assets/marker-drink.png',
};

const KakaoMap = ({
  latitude,
  longitude,
  markers = [],
  selectedMarkerIds,
  onMarkerClick,
  polylines,
  ...rest
}: KakaoMapProps) => {
  // ✅ 모든 hooks를 early return 이전에 호출
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<kakao.maps.Map | null>(null);
  const polylineInstancesRef = useRef<kakao.maps.Polyline[]>([]);
  const clustererRef = useRef<kakao.maps.MarkerClusterer | null>(null);
  const isApiLoaded = useAtomValue(isKakaoMapApiLoadedAtom);

  // Effect 1: Map and Clusterer Initialization
  useEffect(() => {
    if (!isApiLoaded || !mapContainerRef.current || mapInstanceRef.current) return;

    const frameId = requestAnimationFrame(() => {
      if (mapContainerRef.current) {
        const mapOption = {
          center: new window.kakao.maps.LatLng(latitude, longitude),
          level: 5,
        };
        const map = new window.kakao.maps.Map(
          mapContainerRef.current,
          mapOption,
        );
        mapInstanceRef.current = map;

        const clusterer = new window.kakao.maps.MarkerClusterer({
          map: map,
          averageCenter: true,
          minLevel: 6,
          disableClickZoom: true,
        });
        clustererRef.current = clusterer;

        window.kakao.maps.event.addListener(
          clusterer,
          'clusterclick',
          function (cluster: kakao.maps.Cluster) {
            const level = map.getLevel() - 1;
            map.setLevel(level, { anchor: cluster.getCenter() });
          },
        );
      }
    });

    return () => cancelAnimationFrame(frameId);
  }, [isApiLoaded, latitude, longitude]);

  // Effect 2: Update Center (only if no markers)
  useEffect(() => {
    if (!isApiLoaded || !mapInstanceRef.current || markers.length > 0) return;

    const newCenter = new window.kakao.maps.LatLng(latitude, longitude);
    mapInstanceRef.current.setCenter(newCenter);
  }, [isApiLoaded, latitude, longitude, markers]);

  // Effect 3: Update Markers, Polylines, and Bounds
  useEffect(() => {
    if (!isApiLoaded) return;

    const map = mapInstanceRef.current;
    const clusterer = clustererRef.current;
    if (!map || !window.kakao || !clusterer) return;

    // Clear existing markers from the clusterer
    clusterer.clear();

    if (markers.length > 0) {
      const bounds = new window.kakao.maps.LatLngBounds();

      const markerInstances = markers.map((markerData) => {
        const markerPosition = new window.kakao.maps.LatLng(
          markerData.latitude,
          markerData.longitude,
        );

        let markerImage: kakao.maps.MarkerImage | undefined;
        if (markerData.category && markerImageSrc[markerData.category]) {
          const imageSrc = markerImageSrc[markerData.category];
          const imageSize = new window.kakao.maps.Size(32, 32);
          markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize);
        }

        const marker = new window.kakao.maps.Marker({
          position: markerPosition,
          title: markerData.title,
          image: markerImage,
        });

        if (markerData.id && onMarkerClick) {
          window.kakao.maps.event.addListener(marker, 'click', () => {
            onMarkerClick(markerData.id);
          });
        }

        bounds.extend(markerPosition);
        return marker;
      });

      clusterer.addMarkers(markerInstances);

      if (markers.length < 100) {
        map.setBounds(bounds);
      }
    }

    // Clear and add polylines
    polylineInstancesRef.current.forEach((line) => line.setMap(null));
    polylineInstancesRef.current = [];

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
  }, [isApiLoaded, markers, polylines, onMarkerClick, selectedMarkerIds]);

  // ✅ early return을 모든 hooks 호출 후에 배치
  if (!isApiLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-200">
        <p>지도를 불러오는 중입니다...</p>
      </div>
    );
  }

  return (
    <div
      ref={mapContainerRef}
      {...rest}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default memo(KakaoMap);
