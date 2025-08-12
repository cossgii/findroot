
import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { modalAtom } from '~/src/stores/app-store';

// Kakao Maps SDK의 PlaceResult 객체에 대한 타입을 명시적으로 정의합니다.
interface PlaceResult {
  id: string;
  place_name: string;
  address_name: string;
  road_address_name: string;
  x: string; // longitude
  y: string; // latitude
}

export const usePlaceSearch = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<{
    latitude: number;
    longitude: number;
    name: string;
    address: string;
    id: string;
  } | null>(null);
  const [isKakaoMapServicesLoaded, setIsKakaoMapServicesLoaded] = useState(false);
  const [, setModal] = useAtom(modalAtom);

  useEffect(() => {
    const checkKakaoMapServices = () => {
      if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
        setIsKakaoMapServicesLoaded(true);
        clearInterval(interval);
      }
    };

    const interval = setInterval(checkKakaoMapServices, 500);
    checkKakaoMapServices();

    return () => clearInterval(interval);
  }, []);

  const handleSearch = () => {
    if (!isKakaoMapServicesLoaded) {
      setModal({
        type: 'INFO_MESSAGE',
        props: {
          title: '알림',
          message: '지도를 로드 중입니다. 잠시 후 다시 시도해주세요.',
        },
      });
      return;
    }

    if (!searchKeyword.trim()) {
      setModal({
        type: 'INFO_MESSAGE',
        props: {
          title: '알림',
          message: '검색어를 입력해주세요.',
        },
      });
      return;
    }

    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(searchKeyword, (data, status) => {
      if (status === window.kakao.maps.services.Places.Status.OK) {
        setSearchResults(data);
      } else if (status === window.kakao.maps.services.Places.Status.ZERO_RESULT) {
        setModal({
          type: 'INFO_MESSAGE',
          props: {
            title: '검색 결과 없음',
            message: '검색 결과가 없습니다.',
          },
        });
        setSearchResults([]);
        setSelectedPlace(null);
      } else if (status === window.kakao.maps.services.Places.Status.ERROR) {
        setModal({
          type: 'INFO_MESSAGE',
          props: {
            title: '오류 발생',
            message: '검색 중 오류가 발생했습니다.',
          },
        });
        setSearchResults([]);
        setSelectedPlace(null);
      }
    });
  };

  const handleSelectPlace = (place: PlaceResult) => {
    const lat = parseFloat(place.y);
    const lng = parseFloat(place.x);
    const address = place.address_name;

    setSelectedPlace({
      latitude: lat,
      longitude: lng,
      name: place.place_name,
      address: address,
      id: place.id,
    });
    setSearchResults([]);
  };

  return {
    searchKeyword,
    setSearchKeyword,
    searchResults,
    selectedPlace,
    handleSearch,
    handleSelectPlace,
    isKakaoMapServicesLoaded,
    setSelectedPlace,
  };
};
