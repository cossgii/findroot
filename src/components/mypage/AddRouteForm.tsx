'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { Place } from '@prisma/client';

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
import PlaceSelectionList from './PlaceSelectionList';
import RouteMap from './RouteMap';

const createRouteSchema = z.object({
  name: z.string().min(1, { message: '루트 이름을 입력해주세요.' }),
  description: z.string().optional(),
  districtId: z.string().min(1, { message: '자치구를 선택해주세요.' }),
  selectedPlaces: z
    .array(z.string())
    .min(1, { message: '최소 하나 이상의 장소를 선택해주세요.' }),
});

type AddRouteFormValues = z.infer<typeof createRouteSchema>;

interface AddRouteFormProps {
  form: UseFormReturn<AddRouteFormValues>;
  onSubmit: (values: AddRouteFormValues) => void;
  onClose: () => void;
  userPlaces: Place[];
  selectedDistrict: string | null;
  setSelectedDistrict: (district: string) => void;
}

export default function AddRouteForm({
  form,
  onSubmit,
  onClose,
  userPlaces,
  selectedDistrict,
  setSelectedDistrict,
}: AddRouteFormProps) {
  const handlePlaceSelection = (placeId: string, isChecked: boolean) => {
    const currentSelected = form.getValues('selectedPlaces');
    const placeToToggle = userPlaces.find((p) => p.id === placeId);

    if (!placeToToggle) return;

    if (isChecked) {
      const existingPlaceInSameCategory = userPlaces.find(
        (p) =>
          currentSelected.includes(p.id) &&
          p.category === placeToToggle.category,
      );

      let newSelection = currentSelected;
      if (existingPlaceInSameCategory) {
        newSelection = newSelection.filter(
          (id) => id !== existingPlaceInSameCategory.id,
        );
      }
      form.setValue('selectedPlaces', [...newSelection, placeId], {
        shouldValidate: true,
      });
    } else {
      form.setValue(
        'selectedPlaces',
        currentSelected.filter((id) => id !== placeId),
        { shouldValidate: true },
      );
    }
  };

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
              userPlaces={userPlaces}
              selectedPlaces={form.watch('selectedPlaces')}
              onMarkerClick={(id) =>
                handlePlaceSelection(
                  id,
                  !form.watch('selectedPlaces').includes(id),
                )
              }
            />

            <FormField
              control={form.control}
              name="selectedPlaces"
              render={() => (
                <FormItem>
                  <FormLabel>장소 선택</FormLabel>
                  <FormControl>
                    <PlaceSelectionList
                      userPlaces={userPlaces}
                      selectedPlaces={form.watch('selectedPlaces')}
                      handlePlaceSelection={handlePlaceSelection}
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
