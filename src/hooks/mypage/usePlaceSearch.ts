import { useState } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { addToastAtom } from '~/src/stores/toast-store';
import { isKakaoMapApiLoadedAtom } from '~/src/stores/app-store';

export const usePlaceSearch = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<
    kakao.maps.services.PlaceResult[]
  >([]);
  const [selectedPlace, setSelectedPlace] = useState<{
    latitude: number;
    longitude: number;
    name: string;
    address: string;
    id: string;
    district: string | null;
  } | null>(null);
  const isKakaoPlacesServiceReady = useAtomValue(isKakaoMapApiLoadedAtom);
  const addToast = useSetAtom(addToastAtom);

  const handleSearch = () => {
    if (!isKakaoPlacesServiceReady) {
      addToast({
        message: '지도를 로드 중입니다. 잠시 후 다시 시도해주세요.',
        duration: 10000,
      });
      return;
    }

    if (!searchKeyword.trim()) {
      addToast({ message: '검색어를 입력해주세요.', duration: 10000 });
      return;
    }

    if (
      !window.kakao ||
      !window.kakao.maps ||
      !window.kakao.maps.services ||
      !window.kakao.maps.services.Places ||
      !window.kakao.maps.services.Status
    ) {
      addToast({
        message:
          '카카오 장소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.',
        duration: 10000,
      });
      return;
    }

    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(searchKeyword, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setSearchResults(data);
      } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
        addToast({ message: '검색 결과가 없습니다.', duration: 10000 });
        setSearchResults([]);
        setSelectedPlace(null);
      } else if (status === window.kakao.maps.services.Status.ERROR) {
        addToast({ message: '검색 중 오류가 발생했습니다.', duration: 10000 });
        setSearchResults([]);
        setSelectedPlace(null);
      }
    });
  };

  const handleSelectPlace = (place: kakao.maps.services.PlaceResult) => {
    const lat = parseFloat(place.y);
    const lng = parseFloat(place.x);
    const address = place.address_name;

    if (!address.includes('서울')) {
      addToast({
        message: '현재는 서울 지역의 장소만 등록할 수 있습니다.',
        duration: 10000,
      });
      setSelectedPlace(null);
      setSearchResults([]);
      return;
    }

    let district: string | null = null;
    const seoulDistrictRegex = /서울\s*([가-힣]+구)/;
    const match = address.match(seoulDistrictRegex);
    if (match && match[1]) {
      district = match[1];
    }

    setSelectedPlace(() => {
      const newSelectedPlace = {
        latitude: lat,
        longitude: lng,
        name: place.place_name,
        address: address,
        id: place.id,
        district: district,
      };
      return newSelectedPlace;
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
    isKakaoPlacesServiceReady,
    setSelectedPlace,
  };
};
