'use client';

import React, { useState, useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Place, RouteStopLabel } from '@prisma/client';
import { RouteStop } from '~/src/hooks/mypage/useAddRouteForm';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '~/src/components/common/form';
import Input from '~/src/components/common/input';
import Button from '~/src/components/common/button';
import RouteMap from './RouteMap';
import ConfirmationDialog from '~/src/components/common/ConfirmationDialog';

// Helper to map enum to display names
const routeStopLabelMap: Record<RouteStopLabel, string> = {
  MEAL: '식사',
  CAFE: '카페',
  BAR: '주점',
};

interface AddRouteFormProps {
  form: UseFormReturn<{ name: string; description?: string | undefined }>;
  onSubmit: (values: { name: string; description?: string | undefined }) => void;
  onClose: () => void;
  stops: RouteStop[];
  userPlaces: Place[];
  isLoading: boolean;
  error: string | null;
  addStop: (place: Place, label: RouteStopLabel) => void;
  removeStop: (listId: string) => void;
  selectedDistrict: string | null;
  mapCenter: { lat: number; lng: number };
  handleDistrictChange: (districtId: string) => void;
  isPending: boolean;
  isConfirmationDialogOpen: boolean;
  handleConfirmDistrictChange: () => void;
  handleCancelDistrictChange: () => void;
}

export default function AddRouteForm({
  form,
  onSubmit,
  onClose,
  stops,
  userPlaces,
  isLoading,
  error,
  addStop,
  removeStop,
  selectedDistrict,
  mapCenter,
  handleDistrictChange,
  isPending,
  isConfirmationDialogOpen,
  handleConfirmDistrictChange,
  handleCancelDistrictChange,
}: AddRouteFormProps) {
  const [placeToAdd, setPlaceToAdd] = useState<Place | null>(null);
  const [labelForNewStop, setLabelForNewStop] = useState<RouteStopLabel>(
    RouteStopLabel.MEAL,
  );

  const handleAddStop = () => {
    if (placeToAdd) {
      addStop(placeToAdd, labelForNewStop);
      setPlaceToAdd(null);
    }
  };

  const placesForMap = useMemo(() => {
    if (!selectedDistrict) {
      return stops.map((s) => s.place); // If no district, show only places in the route
    }
    const districtName = SEOUL_DISTRICTS.find((d) => d.id === selectedDistrict)?.name;
    return userPlaces.filter((place) => place.district === districtName);
  }, [userPlaces, selectedDistrict, stops]);

  const filteredPlacesForDropdown = useMemo(() => {
    if (!selectedDistrict) {
      return [];
    }
    const districtName = SEOUL_DISTRICTS.find((d) => d.id === selectedDistrict)?.name;
    return userPlaces.filter((place) => place.district === districtName);
  }, [userPlaces, selectedDistrict]);

  if (isLoading) {
    return <p>장소 목록을 불러오는 중...</p>;
  }

  if (error) {
    return <p>오류: {error}</p>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* 1. District Selector */}
        <div>
          <FormLabel>자치구 선택</FormLabel>
          <select
            value={selectedDistrict || ''}
            onChange={(e) => handleDistrictChange(e.target.value)}
            className="w-full mt-1 rounded-xl border-2 border-secondary-50 bg-white px-4 py-2 shadow-sm text-sm"
          >
            <option value="">자치구를 선택하세요</option>
            {SEOUL_DISTRICTS.filter((d) => d.id !== 'all').map((district) => (
              <option key={district.id} value={district.id}>
                {district.name}
              </option>
            ))}
          </select>
        </div>

        {/* Render the rest of the form only when a district is selected */}
        {selectedDistrict && (
          <>
            {/* 2. Map View */}
            <div className="my-6 h-[300px] w-full rounded-md overflow-hidden">
              <RouteMap
                stops={stops}
                center={mapCenter}
                districtPlaces={placesForMap}
              />
            </div>

            {/* 3. Current Stops List */}
            <div className="space-y-2">
              <FormLabel>경유지 목록 (최대 5개)</FormLabel>
              {stops.length > 0 ? (
                <ul className="space-y-2 rounded-md border p-2">
                  {stops.map((stop, index) => (
                    <li
                      key={stop.listId}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-blue-600">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-semibold">{stop.place.name}</p>
                          <p className="text-xs text-gray-500">
                            {routeStopLabelMap[stop.label]}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={() => removeStop(stop.listId)}
                        variant="outlined"
                        size="small"
                        className="w-auto px-2 py-1 text-xs"
                      >
                        삭제
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  아래에서 경유지를 추가해주세요.
                </p>
              )}
            </div>

            {/* 4. Add New Stop Section */}
            {stops.length < 5 && (
              <div className="p-4 space-y-3 border rounded-md bg-gray-50">
                <h3 className="font-semibold">새 경유지 추가</h3>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    onChange={(e) => {
                      const selectedPlace = filteredPlacesForDropdown.find(
                        (p) => p.id === e.target.value,
                      );
                      setPlaceToAdd(selectedPlace || null);
                    }}
                    className="w-full rounded-xl border-2 border-secondary-50 bg-white px-4 py-2 shadow-sm text-sm flex-grow"
                  >
                    <option value="">장소를 선택하세요</option>
                    {filteredPlacesForDropdown.map((place) => (
                      <option key={place.id} value={place.id}>
                        {place.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={labelForNewStop}
                    onChange={(e) =>
                      setLabelForNewStop(e.target.value as RouteStopLabel)
                    }
                    className="w-full sm:w-auto rounded-xl border-2 border-secondary-50 bg-white px-4 py-2 shadow-sm text-sm"
                  >
                    {Object.values(RouteStopLabel).map((label) => (
                      <option key={label} value={label}>
                        {routeStopLabelMap[label]}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  type="button"
                  onClick={handleAddStop}
                  disabled={!placeToAdd}
                  className="w-full"
                >
                  추가
                </Button>
              </div>
            )}

            {/* 5. Route Details */}
            <div className="space-y-4 pt-4 border-t">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>루트 이름</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="예: 강남역 불금 루트" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>설명</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="이 루트에 대한 설명을 적어주세요"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        )}

        {/* 6. Action Buttons */}
        <div className="flex justify-end space-x-2 pt-6 border-t">
          <Button type="button" variant="outlined" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" disabled={isPending || !form.formState.isValid}>
            {isPending ? '등록 중...' : '루트 등록'}
          </Button>
        </div>
      </form>

      <ConfirmationDialog
        isOpen={isConfirmationDialogOpen}
        onClose={handleCancelDistrictChange}
        title="자치구 변경 확인"
        message="자치구를 변경하면 현재 추가된 모든 경유지가 삭제됩니다. 계속하시겠습니까?"
        onConfirm={handleConfirmDistrictChange}
        onCancel={handleCancelDistrictChange}
      />
    </Form>
  );
}
