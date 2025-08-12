import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { CATEGORIES } from '~/src/utils/categories';
import { createPlaceSchema } from '~/src/services/place/place-schema';
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
import KakaoMap from '~/src/components/common/kakao-map';
import { usePlaceSearch } from './usePlaceSearch';
import PlaceSearchInput from './PlaceSearchInput';

type AddPlaceFormValues = z.infer<typeof createPlaceSchema>;

interface AddPlaceFormProps {
  form: UseFormReturn<AddPlaceFormValues>;
  onSubmit: (values: AddPlaceFormValues) => void;
  onClose: () => void;
}

export default function AddPlaceForm({
  form,
  onSubmit,
  onClose,
}: AddPlaceFormProps) {
  const {
    searchKeyword,
    setSearchKeyword,
    searchResults,
    selectedPlace,
    handleSearch,
    handleSelectPlace,
    isKakaoMapServicesLoaded,
  } = usePlaceSearch();

  const defaultCenter = { lat: 37.5665, lng: 126.978 };

  useEffect(() => {
    if (selectedPlace) {
      const { name, address, latitude, longitude } = selectedPlace;
      let district = '';
      const addressParts = address.split(' ');
      if (addressParts.length > 1 && addressParts[0] === '서울') {
        district = addressParts[1];
      }
      form.setValue('name', name);
      form.setValue('address', address);
      form.setValue('latitude', latitude);
      form.setValue('longitude', longitude);
      form.setValue('district', district);
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
            isKakaoMapServicesLoaded={isKakaoMapServicesLoaded}
          />
        </FormItem>

        <div className="w-full h-[300px] rounded-md overflow-hidden">
          <KakaoMap
            latitude={selectedPlace?.latitude || defaultCenter.lat}
            longitude={selectedPlace?.longitude || defaultCenter.lng}
            markers={
              selectedPlace
                ? [
                    {
                      latitude: selectedPlace.latitude,
                      longitude: selectedPlace.longitude,
                      title: selectedPlace.name,
                      id: selectedPlace.id,
                    },
                  ]
                : []
            }
            className="w-full h-full"
          />
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이름</FormLabel>
              <FormControl>
                <Input {...field} />
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
                <Input {...field} />
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
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
                <Input {...field} />
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
                <select
                  {...field}
                  className="w-full rounded-xl border-2 border-secondary-50 bg-gray-50 px-[16px] py-[10px] shadow-sm outline-2 transition-colors duration-75 hover:border-primary-300 focus:outline-primary-600"
                >
                  <option value="">선택하세요</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
