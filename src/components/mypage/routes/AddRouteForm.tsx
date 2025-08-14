'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Place } from '@prisma/client'; // Keep Place import for type hinting if needed elsewhere
import { CreateRouteInput } from '~/src/services/route/route-schema'; // Import the new schema type

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
import { SEOUL_DISTRICTS } from '~/src/utils/districts';
// import PlaceSelectionList from './PlaceSelectionList'; // No longer needed
import RouteMap from './RouteMap';
import PlaceSlotSelector from './PlaceSlotSelector'; // New component for selecting places for slots

interface AddRouteFormProps {
  form: UseFormReturn<CreateRouteInput>; // Use CreateRouteInput
  onSubmit: (values: CreateRouteInput) => void;
  onClose: () => void;
  selectedDistrict: string | null;
  setSelectedDistrict: (district: string) => void;
  assignPlaceToSlot: (place: Place, slot: 'round1' | 'round2' | 'cafe') => void;
  clearSlot: (slot: 'round1' | 'round2' | 'cafe') => void;
  selectedRound1Place: Place | null;
  selectedRound2Place: Place | null;
  selectedCafePlace: Place | null;
}

export default function AddRouteForm({
  form,
  onSubmit,
  onClose,
  selectedDistrict,
  setSelectedDistrict,
  assignPlaceToSlot,
  clearSlot,
  selectedRound1Place,
  selectedRound2Place,
  selectedCafePlace,
}: AddRouteFormProps) {
  // No more handlePlaceSelection as we are using fixed slots

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>루트 이름</FormLabel>
              <FormControl>
                <Input {...field} />
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
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="districtId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>자치구 선택</FormLabel>
              <FormControl>
                <select
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    setSelectedDistrict(e.target.value);
                  }}
                  className="w-full rounded-xl border-2 border-secondary-50 bg-gray-50 px-[16px] py-[10px] shadow-sm outline-2 transition-colors duration-75 hover:border-primary-300 focus:outline-primary-600"
                >
                  <option value="">자치구를 선택하세요</option>
                  {SEOUL_DISTRICTS.map((district) => (
                    <option
                      key={district.id}
                      value={district.id}
                      disabled={district.id === 'all'}
                    >
                      {district.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedDistrict ? (
          <>
            <RouteMap
              selectedRound1Place={selectedRound1Place}
              selectedRound2Place={selectedRound2Place}
              selectedCafePlace={selectedCafePlace}
              onMarkerClick={() => {}} // Marker click logic will be handled by PlaceSlotSelector
            />

            <FormField
              control={form.control}
              name="placeForRound1Id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>1차 장소 (식사)</FormLabel>
                  <FormControl>
                    <PlaceSlotSelector
                      selectedPlace={selectedRound1Place}
                      onSelectPlace={(place) =>
                        assignPlaceToSlot(place, 'round1')
                      }
                      onClearPlace={() => clearSlot('round1')}
                      districtId={selectedDistrict}
                      currentSelectedSlotId={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="placeForRound2Id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>2차 장소 (식사)</FormLabel>
                  <FormControl>
                    <PlaceSlotSelector
                      selectedPlace={selectedRound2Place}
                      onSelectPlace={(place) =>
                        assignPlaceToSlot(place, 'round2')
                      }
                      onClearPlace={() => clearSlot('round2')}
                      districtId={selectedDistrict}
                      currentSelectedSlotId={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="placeForCafeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>카페 장소 (음료)</FormLabel>
                  <FormControl>
                    <PlaceSlotSelector
                      selectedPlace={selectedCafePlace}
                      onSelectPlace={(place) =>
                        assignPlaceToSlot(place, 'cafe')
                      }
                      onClearPlace={() => clearSlot('cafe')}
                      districtId={selectedDistrict}
                      currentSelectedSlotId={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        ) : (
          <p className="text-gray-500 text-center py-8">
            루트를 생성할 자치구를 먼저 선택해주세요.
          </p>
        )}

        <div className="flex justify-end space-x-2 mt-6">
          <Button type="button" variant="outlined" onClick={onClose}>
            취소
          </Button>
          <Button type="submit">등록</Button>
        </div>
      </form>
    </Form>
  );
}
