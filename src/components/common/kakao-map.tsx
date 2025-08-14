'use client';

import { forwardRef, HTMLAttributes, useEffect, useRef, memo } from 'react'; // Add memo import back // Import memo
import { useAtomValue } from 'jotai'; // Import useAtomValue
import { isKakaoMapApiLoadedAtom } from '~/src/stores/app-store'; // Import the atom

interface MarkerData {
  latitude: number;
  longitude: number;
  title: string;
  id: string; // Added for selection
  category?: string; // Added for categorization
}

interface KakaoMapProps extends HTMLAttributes<HTMLDivElement> {
  latitude: number;
  longitude: number;
  markers?: MarkerData[];
  selectedMarkerIds?: string[]; // New prop for selected markers
  onMarkerClick?: (id: string) => void; // New prop for marker click event
  polylines?: {
    path: { lat: number; lng: number }[];
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWeight?: number;
  }[]; // New prop for drawing polylines
}

const KakaoMap = forwardRef<HTMLDivElement, KakaoMapProps>(
  ({ latitude, longitude, markers = [], selectedMarkerIds, onMarkerClick, polylines, ...rest }, _ref) => {
    const KAKAO_SDK_URL = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_APP_KEY}&libraries=services&autoload=false`;

    const mapContainerRef = useRef<HTMLDivElement>(null);
    const kakaoMapInstanceRef = useRef<kakao.maps.Map | null>(null);

    const markerInstancesRef = useRef<kakao.maps.Marker[]>([]);
    const polylineInstancesRef = useRef<kakao.maps.Polyline[]>([]); // New ref for polylines

    const initMap = () => {
      if (window.kakao && window.kakao.maps && mapContainerRef.current) {
        const mapOption = {
          center: new window.kakao.maps.LatLng(latitude, longitude),
          level: 3,
        };
        const map = new window.kakao.maps.Map(
          mapContainerRef.current,
          mapOption,
        );
        kakaoMapInstanceRef.current = map; // 지도 인스턴스 저장

        // 기존 마커 제거
        markerInstancesRef.current.forEach((marker) => marker.setMap(null));
        markerInstancesRef.current = [];

        // 기존 폴리라인 제거
        polylineInstancesRef.current.forEach((polyline) =>
          polyline.setMap(null),
        );
        polylineInstancesRef.current = [];

        markers.forEach((markerData) => {
          const markerPosition = new window.kakao.maps.LatLng(
            markerData.latitude,
            markerData.longitude,
          );

          // Determine marker image based on selection and category
          let markerImageSrc =
            'https://t1.daumcdn.net/mapapidoc/marker_number_blue.png'; // Default marker
          const markerSize = new window.kakao.maps.Size(36, 37);
          const spriteOrigin = new window.kakao.maps.Point(0, 0);
          const spriteSize = new window.kakao.maps.Size(36, 37);

          // Example: Change marker for selected items (you can customize this further)
          if (selectedMarkerIds?.includes(markerData.id)) {
            markerImageSrc =
              'https://t1.daumcdn.net/mapapidoc/marker_number_red.png'; // Selected marker
          }

          // Define marker images for categories
          const categoryMarkerImages: { [key: string]: string } = {
            cafe: 'https://t1.daumcdn.net/mapapidoc/marker_red.png',
            meal1: 'https://t1.daumcdn.net/mapapidoc/marker_blue.png',
            meal2: 'https://t1.daumcdn.net/mapapidoc/marker_green.png',
          };

          // Determine marker image based on category
          if (
            markerData.category &&
            categoryMarkerImages[markerData.category]
          ) {
            markerImageSrc = categoryMarkerImages[markerData.category];
          }

          // Override if selected
          if (selectedMarkerIds?.includes(markerData.id)) {
            markerImageSrc =
              'https://t1.daumcdn.net/mapapidoc/marker_yellow.png'; // Selected marker (e.g., yellow)
          }

          const markerImage = new window.kakao.maps.MarkerImage(
            markerImageSrc,
            markerSize,
            {
              spriteOrigin: spriteOrigin,
              spriteSize: spriteSize,
            },
          );

          const marker = new window.kakao.maps.Marker({
            position: markerPosition,
            title: markerData.title,
            image: markerImage, // Apply custom image
          });

          marker.setMap(map);
          markerInstancesRef.current.push(marker); // Store marker instance

          // Add click listener to marker
          if (markerData.id && onMarkerClick) {
            window.kakao.maps.event.addListener(marker, 'click', () => {
              onMarkerClick(markerData.id);
            });
          }
        });

        // Draw polylines
        polylines?.forEach((lineData) => {
          const path = lineData.path.map(
            (p) => new window.kakao.maps.LatLng(p.lat, p.lng),
          );
          const polyline = new window.kakao.maps.Polyline({
            path: path, // 선을 구성하는 좌표배열 입니다
            strokeWeight: lineData.strokeWeight || 5, // 선의 두께 입니다
            strokeColor: lineData.strokeColor || '#FFAE00', // 선의 색깔입니다
            strokeOpacity: lineData.strokeOpacity || 0.7, // 선의 불투명도 입니다 1에서 0 사이의 값이며 0에 가까울수록 투명합니다
            strokeStyle: 'solid', // 선의 스타일입니다
          });
          polyline.setMap(map);
          polylineInstancesRef.current.push(polyline);
        });
      }
    };

    const isApiLoaded = useAtomValue(isKakaoMapApiLoadedAtom); // Get global API loaded state

    useEffect(() => {
      // SDK가 완전히 로드되고 API가 초기화된 후에만 지도 초기화
      if (isApiLoaded && mapContainerRef.current) { // Add mapContainerRef.current to condition
        initMap();
      }

      // 컴포넌트 언마운트 시 지도 인스턴스, 마커, 폴리라인 정리
      return () => {
        if (kakaoMapInstanceRef.current) {
          kakaoMapInstanceRef.current.relayout();
          kakaoMapInstanceRef.current = null;
          if (mapContainerRef.current) {
            mapContainerRef.current.innerHTML = '';
          }
        }
        markerInstancesRef.current.forEach((marker) => marker.setMap(null));
        markerInstancesRef.current = [];
        polylineInstancesRef.current.forEach((polyline) =>
          polyline.setMap(null),
        );
        polylineInstancesRef.current = [];
      };
    }, [
      latitude,
      longitude,
      markers,
      selectedMarkerIds,
      onMarkerClick,
      polylines,
    ]); // Add polylines to dependencies

    return (
      <>
        <div ref={mapContainerRef} {...rest}></div>
      </>
    );
  },
);

KakaoMap.displayName = 'KakaoMap';

export default memo(KakaoMap); // Add memo back
