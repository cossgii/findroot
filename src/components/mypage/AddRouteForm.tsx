'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { Place } from '@prisma/client';

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '~/src/components/common/form';
import Input from '~/src/components/common/input';
import Button from '~/src/components/common/button';

const createRouteSchema = z.object({
    name: z.string().min(1, { message: '루트 이름을 입력해주세요.' }),
    description: z.string().optional(),
    selectedPlaces: z.array(z.string()).min(1, { message: '최소 하나 이상의 장소를 선택해주세요.' }),
});

type AddRouteFormValues = z.infer<typeof createRouteSchema>;

interface AddRouteFormProps {
  form: UseFormReturn<AddRouteFormValues>;
  onSubmit: (values: AddRouteFormValues) => void;
  onClose: () => void;
  userPlaces: Place[];
}

export default function AddRouteForm({ form, onSubmit, onClose, userPlaces }: AddRouteFormProps) {
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
          name="selectedPlaces"
          render={({ field }) => (
            <FormItem>
              <FormLabel>장소 선택</FormLabel>
              <FormControl>
                <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                  {userPlaces.length > 0 ? (
                    userPlaces.map((place) => (
                      <div key={place.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`place-${place.id}`}
                          value={place.id}
                          checked={field.value.includes(place.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              field.onChange([...field.value, place.id]);
                            } else {
                              field.onChange(field.value.filter((id) => id !== place.id));
                            }
                          }}
                          className="form-checkbox"
                        />
                        <label htmlFor={`place-${place.id}`}>{place.name} ({place.address})</label>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">등록된 장소가 없습니다. 먼저 장소를 등록해주세요.</p>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 mt-6">
          <Button type="button" variant="outlined" onClick={onClose}>
            취소
          </Button>
          <Button type="submit">
            등록
          </Button>
        </div>
      </form>
    </Form>
  );
}
