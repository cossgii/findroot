
import React from 'react';
import { Place } from '@prisma/client';
import { CATEGORIES } from '~/src/utils/categories';

interface PlaceSelectionListProps {
  userPlaces: Place[];
  selectedPlaces: string[];
  handlePlaceSelection: (placeId: string, isChecked: boolean) => void;
}

export default function PlaceSelectionList({
  userPlaces,
  selectedPlaces,
  handlePlaceSelection,
}: PlaceSelectionListProps) {
  return (
    <div className="border rounded-md p-2 max-h-60 overflow-y-auto">
      {CATEGORIES.map((category) => {
        const placesInCategory = userPlaces.filter(
          (p) => p.category === category.id,
        );
        return (
          <div key={category.id} className="mb-4 last:mb-0">
            <h4 className="font-semibold text-lg mb-2">{category.name}</h4>
            {placesInCategory.length > 0 ? (
              placesInCategory.map((place) => (
                <div key={place.id} className="flex items-center space-x-2 mb-1">
                  <input
                    type="checkbox"
                    id={`place-${place.id}`}
                    value={place.id}
                    checked={selectedPlaces.includes(place.id)}
                    onChange={(e) =>
                      handlePlaceSelection(place.id, e.target.checked)
                    }
                    className="form-checkbox"
                  />
                  <label htmlFor={`place-${place.id}`}>
                    {place.name} ({place.address})
                  </label>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">
                이 카테고리에 등록된 장소가 없습니다.
              </p>
            )}
          </div>
        );
      })}
      {userPlaces.length === 0 && (
        <p className="text-gray-500 text-sm">
          선택된 자치구에 등록된 장소가 없습니다.
        </p>
      )}
    </div>
  );
}
