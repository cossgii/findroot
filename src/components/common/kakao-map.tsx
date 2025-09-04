'use client';

import { HTMLAttributes, useEffect, useRef, memo } from 'react';
import { PlaceCategory } from '@prisma/client';
import { useKakaoMapLoader } from '~/src/hooks/useKakaoMapLoader';

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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<kakao.maps.Map | null>(null);
  const polylineInstancesRef = useRef<kakao.maps.Polyline[]>([]);
  const clustererRef = useRef<kakao.maps.MarkerClusterer | null>(null); // Add ref for clusterer
  const isApiLoaded = useKakaoMapLoader();

  // Effect 1: Map and Clusterer Initialization
  useEffect(() => {
    if (isApiLoaded && mapContainerRef.current && !mapInstanceRef.current) {
      const mapOption = {
        center: new window.kakao.maps.LatLng(latitude, longitude),
        level: 5, // Initial level
      };
      const map = new window.kakao.maps.Map(mapContainerRef.current, mapOption);
      mapInstanceRef.current = map;

      // Create and store clusterer instance
      const clusterer = new window.kakao.maps.MarkerClusterer({
        map: map,
        averageCenter: true,
        minLevel: 6, // Zoom level to start clustering from
        disableClickZoom: true, // Disable zoom on cluster click to handle it manually if needed
      });
      clustererRef.current = clusterer;

      // Add a click event listener to the clusterer
      window.kakao.maps.event.addListener(
        clusterer,
        'clusterclick',
        function (cluster: kakao.maps.Cluster) {
          const level = map.getLevel() - 1;
          map.setLevel(level, { anchor: cluster.getCenter() });
        },
      );
    }
  }, [isApiLoaded, latitude, longitude]);

  // Effect 2: Update Center (only if no markers)
  useEffect(() => {
    if (mapInstanceRef.current && markers.length === 0) {
      const newCenter = new window.kakao.maps.LatLng(latitude, longitude);
      mapInstanceRef.current.setCenter(newCenter);
    }
  }, [latitude, longitude, markers]);

  // Effect 3: Update Markers, Polylines, and Bounds
  useEffect(() => {
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

      // Add new markers to the clusterer
      clusterer.addMarkers(markerInstances);

      // Adjust map bounds to show all markers, but only if there are a few.
      // If there are many, let the clusterer handle the view.
      if (markers.length < 100) {
        map.setBounds(bounds);
      }
    }

    // Clear and add polylines (unchanged from before)
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
