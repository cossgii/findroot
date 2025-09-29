'use client';

import { useSetAtom } from 'jotai';
import { isKakaoMapApiLoadedAtom } from '~/src/stores/app-store';
import Script from 'next/script';
import { addToastAtom } from '~/src/stores/toast-store';
import { useEffect } from 'react';

const KAKAO_MAP_APP_KEY = process.env.NEXT_PUBLIC_KAKAO_APP_KEY;

export default function KakaoMapApiLoader() {
  const setIsKakaoMapApiLoaded = useSetAtom(isKakaoMapApiLoadedAtom);
  const addToast = useSetAtom(addToastAtom);
  useEffect(() => {
    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
      setIsKakaoMapApiLoaded(true);
    }
  }, []);
  if (!KAKAO_MAP_APP_KEY) {
    console.error('NEXT_PUBLIC_KAKA_APP_KEY is not defined.');
    addToast({
      message: '카카오맵 API 키가 설정되지 않았습니다.',
      duration: 5000,
    });
    return null;
  }

  const handleLoad = () => {
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(() => {
        setIsKakaoMapApiLoaded(true);
      });
    } else {
      console.error('window.kakao.maps is not available after script load.');
      addToast({
        message: '카카오맵 API 로딩 실패 (객체 없음)',
        duration: 5000,
      });
    }
  };

  const handleError = () => {
    console.error('Kakao Map SDK script failed to load.');
    addToast({ message: '카카오맵 SDK 스크립트 로딩 실패', duration: 5000 });
    setIsKakaoMapApiLoaded(false);
  };

  return (
    <Script
      src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_APP_KEY}&libraries=services,clusterer&autoload=false`}
      strategy="afterInteractive"
      fetchPriority="high"
      onLoad={handleLoad}
      onError={handleError}
    />
  );
}
