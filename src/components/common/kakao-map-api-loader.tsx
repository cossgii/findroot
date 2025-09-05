'use client';

import { useSetAtom } from 'jotai';
import { isKakaoMapApiLoadedAtom } from '~/src/stores/app-store';
import Script from 'next/script';

export default function KakaoMapApiLoader() {
  const setIsKakaoMapApiLoaded = useSetAtom(isKakaoMapApiLoadedAtom);

  const handleApiLoaded = () => {
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(() => {
        if (window.kakao.maps.services && window.kakao.maps.services.Places) {
          setIsKakaoMapApiLoaded(true);
          console.log('✅ Kakao Map API and services loaded successfully.');
        } else {
          console.error(
            '❌ window.kakao.maps.services.Places is not available after load().',
          );
        }
      });
    } else {
      console.error('❌ window.kakao.maps is not available after script load.');
    }
  };

  return (
    <Script
      src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_APP_KEY}&libraries=services,clusterer&autoload=false`}
      strategy="afterInteractive"
      onLoad={handleApiLoaded}
    />
  );
}