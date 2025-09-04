'use client';

import { useEffect } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { isKakaoMapApiLoadedAtom } from '~/src/stores/app-store';
import { addToastAtom } from '~/src/stores/toast-store';

export function useKakaoMapLoader() {
  const setIsKakaoMapApiLoaded = useSetAtom(isKakaoMapApiLoadedAtom);
  const isKakaoMapApiLoaded = useAtomValue(isKakaoMapApiLoadedAtom);
  const addToast = useSetAtom(addToastAtom);

  useEffect(() => {
    if (isKakaoMapApiLoaded) {
      return; // API already loaded
    }

    const KAKAO_MAP_APP_KEY = process.env.NEXT_PUBLIC_KAKAO_APP_KEY;
    if (!KAKAO_MAP_APP_KEY) {
      console.error('NEXT_PUBLIC_KAKAO_APP_KEY is not defined.');
      addToast({ message: '카카오맵 API 키가 설정되지 않았습니다.', duration: 5000 });
      return;
    }

    const scriptId = 'kakao-map-sdk';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_APP_KEY}&libraries=services,clusterer&autoload=false`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const handleLoad = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          setIsKakaoMapApiLoaded(true);
          console.log('✅ Kakao Map API and services loaded successfully via useKakaoMapLoader.');
        });
      } else {
        console.error('❌ window.kakao.maps is not available after script load in useKakaoMapLoader.');
        addToast({ message: '카카오맵 API 로딩 실패 (객체 없음)', duration: 5000 });
      }
    };

    const handleError = () => {
      console.error('❌ Kakao Map SDK script failed to load.');
      addToast({ message: '카카오맵 SDK 스크립트 로딩 실패', duration: 5000 });
      setIsKakaoMapApiLoaded(false);
    };

    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);

    // Cleanup function
    return () => {
      script?.removeEventListener('load', handleLoad);
      script?.removeEventListener('error', handleError);
    };
  }, [isKakaoMapApiLoaded, setIsKakaoMapApiLoaded, addToast]);

  return isKakaoMapApiLoaded;
}
