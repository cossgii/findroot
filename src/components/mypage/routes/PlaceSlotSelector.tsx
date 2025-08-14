'use client';

import React, { useState } from 'react';
import { Place } from '@prisma/client';
import Input from '~/src/components/common/input';
import Button from '~/src/components/common/button';
import { useAtom, useAtomValue } from 'jotai';
import { modalAtom, isKakaoMapApiLoadedAtom } from '~/src/stores/app-store';

interface PlaceSlotSelectorProps {
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
  onClearPlace: () => void;
  districtId: string | null;
}

export default function PlaceSlotSelector({
  selectedPlace,
  onSelectPlace,
  onClearPlace,
  districtId,
}: PlaceSlotSelectorProps) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<
    kakao.maps.services.Places.PlaceResult[]
  >([]);
  const isKakaoMapServicesLoaded = useAtomValue(isKakaoMapApiLoadedAtom);
  const [, setModal] = useAtom(modalAtom);

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

    // Combine search keyword with district for more relevant results
    const query = districtId ? `${districtId} ${searchKeyword}` : searchKeyword;

    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(query, (data, status) => {
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
      } else if (status === window.kakao.maps.services.Status.ERROR) {
        setModal({
          type: 'INFO_MESSAGE',
          props: {
            title: '오류 발생',
            message: '검색 중 오류가 발생했습니다.',
          },
        });
        setSearchResults([]);
      }
    });
  };

  const handleSelect = (
    placeResult: kakao.maps.services.Places.PlaceResult,
  ) => {
    // Convert kakao place result to our Place type structure
    const newPlace: Place = {
      id: placeResult.id,
      name: placeResult.place_name,
      latitude: parseFloat(placeResult.y),
      longitude: parseFloat(placeResult.x),
      address: placeResult.address_name,
      district: placeResult.address_name.split(' ')[1] || '', // Simple extraction for district
      description: '', // Kakao API doesn't provide this directly
      category: 'MEAL', // Default or infer based on category_group_code if possible
      createdAt: new Date(), // Placeholder
      updatedAt: new Date(), // Placeholder
      creatorId: '', // Placeholder
    };
    onSelectPlace(newPlace);
    setSearchKeyword('');
    setSearchResults([]);
  };

  return (
    <div className="space-y-2">
      {selectedPlace ? (
        <div className="flex items-center justify-between p-2 border rounded-md bg-gray-50">
          <span>
            {selectedPlace.name} ({selectedPlace.address})
          </span>
          <Button
            type="button"
            onClick={onClearPlace}
            size="small"
            variant="outlined"
          >
            선택 해제
          </Button>
        </div>
      ) : (
        <>
          <div className="flex space-x-2">
            <Input
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="장소 이름 또는 주소를 검색하세요"
              className="flex-grow"
            />
            <Button
              type="button"
              onClick={handleSearch}
              className="w-auto px-4"
              disabled={!isKakaoMapServicesLoaded}
            >
              검색
            </Button>
          </div>
          {searchResults.length > 0 && (
            <ul className="border rounded-md max-h-40 overflow-y-auto bg-white mt-2">
              {searchResults.map((result) => (
                <li
                  key={result.id}
                  className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => handleSelect(result)}
                >
                  <strong>{result.place_name}</strong> - {result.address_name}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}