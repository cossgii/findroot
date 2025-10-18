'use client';

import React from 'react';
import { ClientPlace as Place, PlaceCategory } from '~/src/types/shared';
import Button from '~/src/components/common/Button';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';
import Dropdown from '~/src/components/common/Dropdown';

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
  const getDistrictNameById = (id: string) => {
    return SEOUL_DISTRICTS.find((d) => d.id === id)?.name || id;
  };

  const filteredPlaces = userPlaces.filter((place) => {
    const districtName = districtId ? getDistrictNameById(districtId) : null;
    const matchesDistrict = districtName
      ? place.district === districtName
      : true;
    const matchesCategory = expectedCategory
      ? place.category === expectedCategory
      : true;
    return matchesDistrict && matchesCategory;
  });

  const getOptionLabel = (place: Place) => {
    const categoryLabel =
      place.category === PlaceCategory.MEAL ? '식사' : '음료';
    return `${place.name} (${place.address}) - ${categoryLabel}`;
  };

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
        <Dropdown<Place>
          options={filteredPlaces}
          onChange={onSelectPlace}
          getOptionLabel={getOptionLabel}
          placeholder={
            filteredPlaces.length === 0
              ? '이 지역에 등록된 장소가 없습니다.'
              : '장소를 선택하세요'
          }
          triggerClassName="w-full"
          contentClassName="max-h-48 overflow-y-auto"
        />
      )}
    </div>
  );
}
