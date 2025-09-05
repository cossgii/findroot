'use client';

import React from 'react';
import { ClientPlace as Place, PlaceCategory } from '~/src/types/shared';
import Button from '~/src/components/common/button';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';

interface PlaceSlotSelectorProps {
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
  onClearPlace: () => void;
  districtId: string | null;
  expectedCategory?: PlaceCategory;
  userPlaces: Place[];
}

export default function PlaceSlotSelector({
  selectedPlace,
  onSelectPlace,
  onClearPlace,
  districtId,
  expectedCategory,
  userPlaces,
}: PlaceSlotSelectorProps) {
  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPlaceId = e.target.value;
    if (selectedPlaceId === '') {
      onClearPlace();
      return;
    }

    const place = userPlaces.find((p) => p.id === selectedPlaceId);
    if (place) {
      onSelectPlace(place);
    }
  };

  const getDistrictNameById = (id: string) => {
    return SEOUL_DISTRICTS.find((d) => d.id === id)?.name || id;
  };

  const filteredPlaces = userPlaces.filter((place) => {
    const districtName = districtId ? getDistrictNameById(districtId) : null;
    const matchesDistrict = districtName ? place.district === districtName : true;
    const matchesCategory = expectedCategory
      ? place.category === expectedCategory
      : true;
    return matchesDistrict && matchesCategory;
  });

  const selectedValue = selectedPlace ? selectedPlace.id : '';

  return (
    <div className="space-y-2">
      {selectedPlace ? (
        <div className="flex items-center justify-between p-2 border rounded-md bg-gray-50">
          <span className="text-sm">
            {selectedPlace.name} ({selectedPlace.address})
          </span>
          <Button
            type="button"
            onClick={onClearPlace}
            size="small"
            variant="outlined"
            className="w-auto px-2 py-1 text-xs"
          >
            선택 해제
          </Button>
        </div>
      ) : (
        <select
          onChange={handleSelect}
          value={selectedValue}
          className="w-full rounded-xl border-2 border-secondary-50 bg-gray-50 px-4 py-2 shadow-sm outline-2 transition-colors duration-75 hover:border-primary-300 focus:outline-primary-600 text-sm"
        >
          <option value="">장소를 선택하세요</option>
          {filteredPlaces.length === 0 ? (
            <option value="" disabled>
              이 지역에 등록된 해당 카테고리의 장소가 없습니다.
            </option>
          ) : (
            filteredPlaces.map((place) => (
              <option key={place.id} value={place.id}>
                {place.name} ({place.address}) -{' '}
                {place.category === PlaceCategory.MEAL ? '식사' : '음료'}
              </option>
            ))
          )}
        </select>
      )}
    </div>
  );
}
