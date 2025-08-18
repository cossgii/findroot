import { useState } from 'react';
import { useAtom, useAtomValue } from 'jotai'; // Import useAtomValue
import { modalAtom, isKakaoMapApiLoadedAtom } from '~/src/stores/app-store'; // Import isKakaoMapApiLoadedAtom

export const usePlaceSearch = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<
    kakao.maps.services.Places.PlaceResult[]
  >([]);
  const [selectedPlace, setSelectedPlace] = useState<{
    latitude: number;
    longitude: number;
    name: string;
    address: string;
    id: string;
    district: string | null; // Added district field
  } | null>(null);
  const isKakaoPlacesServiceReady = useAtomValue(isKakaoMapApiLoadedAtom); // Use global state
  const [, setModal] = useAtom(modalAtom);

  const handleSearch = () => {
    if (!isKakaoPlacesServiceReady) {
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

    // Add a check for Places service availability
    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services || !window.kakao.maps.services.Places || !window.kakao.maps.services.Status) {
      setModal({
        type: 'INFO_MESSAGE',
        props: {
          title: '알림',
          message: '카카오 장소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.',
        },
      });
      return;
    }

    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(searchKeyword, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setSearchResults(data);
      } else if (
        status === window.kakao.maps.services.Status.ZERO_RESULT
      ) {
        setModal({
          type: 'INFO_MESSAGE',
          props: {
            title: '검색 결과 없음',
            message: '검색 결과가 없습니다.',
          },
        });
        setSearchResults([]);
        setSelectedPlace(null);
      } else if (status === window.kakao.maps.services.Status.ERROR) {
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

  const handleSelectPlace = (place: kakao.maps.services.Places.PlaceResult) => {
    const lat = parseFloat(place.y);
    const lng = parseFloat(place.x);
    const address = place.address_name;

    // Check if the address is in Seoul
    if (!address.includes('서울')) {
      setModal({
        type: 'INFO_MESSAGE',
        props: {
          title: '장소 선택 불가',
          message: '현재는 서울 지역의 장소만 등록할 수 있습니다.',
        },
      });
      setSelectedPlace(null); // Clear selected place if not in Seoul
      setSearchResults([]);
      return;
    }

    // Extract district from the address
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
        district: district, // Assign extracted district
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
