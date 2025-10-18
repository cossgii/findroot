import { useEffect, useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { createPlaceSchema } from '~/src/schemas/place-schema';
import { PlaceCategory } from '~/src/types/shared';
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
import KakaoMap from '~/src/components/common/KakaoMap';
import { usePlaceSearch } from '~/src/hooks/mypage/usePlaceSearch';
import PlaceSearchInput from './PlaceSearchInput';
import CategoryDropdown from '~/src/components/common/CategoryDropdown';

type AddPlaceFormValues = z.infer<typeof createPlaceSchema>;

interface AddPlaceFormProps {
  form: UseFormReturn<AddPlaceFormValues>;
  onSubmit: (values: AddPlaceFormValues) => void;
  onClose: () => void;
  isPending: boolean;
}

export default function AddPlaceForm({
  form,
  onSubmit,
  onClose,
  isPending,
}: AddPlaceFormProps) {
  const {
    searchKeyword,
    setSearchKeyword,
    searchResults,
    selectedPlace,
    handleSearch,
    handleSelectPlace,
    isKakaoPlacesServiceReady,
  } = usePlaceSearch();

  const category = form.watch('category');

  const defaultCenter = useMemo(() => ({ lat: 37.5665, lng: 126.978 }), []); //시청 위치

  useEffect(() => {
    if (selectedPlace) {
      const {
        name: placeName,
        address: placeAddress,
        latitude: placeLatitude,
        longitude: placeLongitude,
        district: placeDistrict,
      } = selectedPlace;

      form.setValue('name', placeName);
      form.setValue('address', placeAddress);
      form.setValue('latitude', placeLatitude);
      form.setValue('longitude', placeLongitude);
      form.setValue('district', placeDistrict || '');
    }
  }, [selectedPlace, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormItem>
          <FormLabel>장소 검색</FormLabel>
          <PlaceSearchInput
            searchKeyword={searchKeyword}
            setSearchKeyword={setSearchKeyword}
            handleSearch={handleSearch}
            searchResults={searchResults}
            handleSelectPlace={handleSelectPlace}
            isKakaoPlacesServiceReady={isKakaoPlacesServiceReady}
          />
        </FormItem>

        <div className="w-full h-[300px] rounded-md overflow-hidden">
          <KakaoMap
            latitude={selectedPlace?.latitude || defaultCenter.lat}
            longitude={selectedPlace?.longitude || defaultCenter.lng}
            markers={useMemo(() => {
              const currentMarkers = selectedPlace
                ? [
                    {
                      latitude: selectedPlace.latitude,
                      longitude: selectedPlace.longitude,
                      title: selectedPlace.name,
                      id: selectedPlace.id,
                      category: category as PlaceCategory,
                    },
                  ]
                : [];
              return currentMarkers;
            }, [selectedPlace, category])}
            className="w-full h-full"
          />
        </div>

        {selectedPlace && (
          <>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이름</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>주소</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="latitude"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormLabel>위도</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="longitude"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormLabel>경도</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
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
                      placeholder="이 장소에 대한 설명을 적어주세요"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>링크 (선택 사항)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="관련 웹사이트 링크를 입력하세요 (예: https://example.com)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>카테고리</FormLabel>
                  <FormControl>
                    <CategoryDropdown
                      value={field.value as PlaceCategory}
                      onChange={field.onChange}
                      triggerClassName="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        <div className="flex justify-end space-x-2 mt-6">
          <Button
            type="button"
            variant="outlined"
            onClick={onClose}
            disabled={isPending}
          >
            취소
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? '등록 중...' : '등록'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
