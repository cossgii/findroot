'use client';

import Script from 'next/script';
import { forwardRef, HTMLAttributes, useEffect } from 'react';

interface MarkerData {
  latitude: number;
  longitude: number;
  title: string;
}

interface KakaoMapProps extends HTMLAttributes<HTMLDivElement> {
  latitude: number;
  longitude: number;
  markers?: MarkerData[];
}

const KakaoMap = forwardRef<HTMLDivElement, KakaoMapProps>(
  ({ latitude, longitude, markers = [], ...rest }, ref) => {
    const KAKAO_SDK_URL = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_APP_KEY}&autoload=false`;

    useEffect(() => {
      const initMap = () => {
        if (window.kakao && window.kakao.maps) {
          window.kakao.maps.load(() => {
            const mapContainer = document.getElementById('map');
            if (!mapContainer) return; // mapContainer가 없으면 리턴

            const mapOption = {
              center: new window.kakao.maps.LatLng(latitude, longitude),
              level: 3,
            };
            const map = new window.kakao.maps.Map(mapContainer, mapOption);

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
            });
          });
        }
      };

      // SDK가 이미 로드되어 있다면 바로 지도 초기화
      if (window.kakao && window.kakao.maps) {
        initMap();
      } else {
        // SDK가 로드되지 않았다면 Script 컴포넌트의 onLoad를 기다림
        // 이 부분은 Script 컴포넌트의 onLoad가 호출될 때 initMap이 실행되도록 보장
      }
    }, [latitude, longitude, markers]);

    const handleScriptLoad = () => {
      // Script 로드 완료 후 initMap 호출
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          const mapContainer = document.getElementById('map');
          if (!mapContainer) return; // mapContainer가 없으면 리턴

          const mapOption = {
            center: new window.kakao.maps.LatLng(latitude, longitude),
            level: 3,
          };
          const map = new window.kakao.maps.Map(mapContainer, mapOption);

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
          });
        });
      }
    };

    return (
      <>
        <Script
          strategy="afterInteractive"
          type="text/javascript"
          src={KAKAO_SDK_URL}
          onLoad={handleScriptLoad}
        />
        <div id="map" ref={ref} {...rest}></div>
      </>
    );
  },
);

KakaoMap.displayName = 'KakaoMap';

export default KakaoMap;
