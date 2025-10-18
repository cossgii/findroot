'use client';

import React, { useState, useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ClientPlace as Place, RouteStopLabel } from '~/src/types/shared';
import { RouteStop } from '~/src/hooks/mypage/useAddRouteForm';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '~/src/components/common/Form';
import Input from '~/src/components/common/Input';
import Button from '~/src/components/common/Button';
import RouteMap from './RouteMap';
import ConfirmationDialog from '~/src/components/common/ConfirmationDialog';
import Dropdown from '~/src/components/common/Dropdown';
import DistrictDropdown from '~/src/components/navigation/DistrictSelectDropdown';

const routeStopLabelMap: Record<RouteStopLabel, string> = {
  MEAL: '식사',
  CAFE: '카페',
  BAR: '주점',
};

const labelOptions = Object.entries(routeStopLabelMap).map(([id, name]) => ({
  id: id as RouteStopLabel,
  name,
}));

interface AddRouteFormProps {
  form: UseFormReturn<{ name: string; description?: string | undefined }>;
  onSubmit: (values: {
    name: string;
    description?: string | undefined;
  }) => void;
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

  

  const filteredPlacesForDropdown = useMemo(() => {
    if (!selectedDistrict) {
      return [];
    }
    const districtName = SEOUL_DISTRICTS.find(
      (d) => d.id === selectedDistrict,
    )?.name;
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
        <div data-testid="district-dropdown-wrapper">
          <FormLabel>자치구 선택</FormLabel>
          <DistrictDropdown
            value={selectedDistrict || ''}
            onChange={handleDistrictChange}
            className="mt-1"
            showAll={false}
          />
        </div>
        {selectedDistrict && (
          <>
            <div className="my-6 h-[300px] w-full rounded-md overflow-hidden">
              <RouteMap
                stops={stops}
                center={mapCenter}
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
            {stops.length < 5 && filteredPlacesForDropdown.length > 0 && (
              <div className="p-4 space-y-3 border rounded-md bg-gray-50">
                <h3 className="font-semibold">새 경유지 추가</h3>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="w-full sm:w-auto sm:flex-grow">
                    <Dropdown<Place>
                      options={filteredPlacesForDropdown}
                      value={placeToAdd || undefined}
                      onChange={(place) => setPlaceToAdd(place)}
                      getOptionLabel={(place) => place.name}
                      placeholder="장소를 선택하세요"
                      triggerClassName="w-full min-w-0"
                      contentClassName="max-h-40 overflow-y-auto"
                    />
                  </div>
                  <div className="w-[120px] sm:flex-shrink-0">
                    <Dropdown
                      options={labelOptions}
                      value={labelOptions.find((l) => l.id === labelForNewStop)}
                      onChange={(label) => setLabelForNewStop(label.id)}
                      getOptionLabel={(label) => label.name}
                      triggerClassName="w-full sm:w-[120px]"
                    />
                  </div>
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
