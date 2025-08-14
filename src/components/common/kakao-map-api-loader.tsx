'use client';

import { useSetAtom } from 'jotai';
import { isKakaoMapApiLoadedAtom } from '~/src/stores/app-store';
import Script from 'next/script';

export default function KakaoMapApiLoader() {
  const setIsKakaoMapApiLoaded = useSetAtom(isKakaoMapApiLoadedAtom);

  const handleApiLoaded = () => {
    console.log(
      'Kakao Map Script Loaded. Checking window.kakao:',
      window.kakao,
    );

    if (window.kakao && window.kakao.maps) {
      // ✅ 중요: kakao.maps.load()를 사용해서 실제 API 로드 대기
      window.kakao.maps.load(() => {
        console.log('Kakao Maps load() completed. Checking services...');

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
      src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_APP_KEY}&libraries=services&autoload=false`}
      strategy="afterInteractive"
      onLoad={handleApiLoaded}
    />
  );
}
