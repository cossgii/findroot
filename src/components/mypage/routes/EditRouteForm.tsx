'use client';

import React, { useState, useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ClientPlace, RouteStopLabel } from '~/src/types/shared';
import { RouteStop } from '~/src/hooks/mypage/useEditRouteForm';
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
import Dropdown from '~/src/components/common/dropdown';
import DistrictDropdown from '~/src/components/navigation/district-select-dropdown';

// Helper to map enum to display names
const routeStopLabelMap: Record<RouteStopLabel, string> = {
  MEAL: '식사',
  CAFE: '카페',
  BAR: '주점',
};

// Create options for the label dropdown
const labelOptions = Object.entries(routeStopLabelMap).map(([id, name]) => ({
  id: id as RouteStopLabel,
  name,
}));

interface EditRouteFormProps {
  form: UseFormReturn<{ name: string; description?: string | undefined }>;
  onSubmit: (values: { name: string; description?: string | undefined }) => void;
  onClose: () => void;
  stops: RouteStop[];
  userPlaces: ClientPlace[];
  isLoading: boolean;
  error: string | null;
  addStop: (place: ClientPlace, label: RouteStopLabel) => void;
  removeStop: (listId: string) => void;
  selectedDistrict: string | null;
  mapCenter: { lat: number; lng: number };
  handleDistrictChange: (districtId: string) => void;
}

export default function EditRouteForm({ 
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
}: EditRouteFormProps) {
  const [placeToAdd, setPlaceToAdd] = useState<ClientPlace | null>(null);
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
      return stops.map(s => s.place);
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
    return <p>루트 정보를 불러오는 중...</p>;
  }

  if (error) {
    return <p>오류: {error}</p>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
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
                  <Input {...field} placeholder="이 루트에 대한 설명을 적어주세요" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormLabel>지도에서 장소 확인</FormLabel>
          <DistrictDropdown
            value={selectedDistrict || 'all'}
            onChange={handleDistrictChange}
            className="mt-1"
          />
        </div>

        {selectedDistrict && (
          <>
            <div className="my-6 h-[300px] w-full rounded-md overflow-hidden">
              <RouteMap
                stops={stops}
                center={mapCenter}
                districtPlaces={placesForMap}
              />
            </div>

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

            {stops.length < 5 && (
              <div className="p-4 space-y-3 border rounded-md bg-gray-50">
                <h3 className="font-semibold">새 경유지 추가</h3>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Dropdown<ClientPlace>
                    options={filteredPlacesForDropdown}
                    value={placeToAdd || undefined}
                    onChange={(place) => setPlaceToAdd(place)}
                    getOptionLabel={(place) => place.name}
                    placeholder="장소를 선택하세요"
                    triggerClassName="w-full flex-grow"
                    contentClassName="max-h-40 overflow-y-auto"
                  />
                  <Dropdown
                    options={labelOptions}
                    value={labelOptions.find(l => l.id === labelForNewStop)}
                    onChange={(label) => setLabelForNewStop(label.id)}
                    getOptionLabel={(label) => label.name}
                    triggerClassName="w-full sm:w-auto"
                  />
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
          </>
        )}

        <div className="flex justify-end space-x-2 pt-6 border-t">
          <Button type="button" variant="outlined" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" disabled={stops.length === 0}>
            루트 수정
          </Button>
        </div>
      </form>
    </Form>
  );
}
