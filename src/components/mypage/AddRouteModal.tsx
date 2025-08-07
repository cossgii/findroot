'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSession } from 'next-auth/react';
import { Place } from '@prisma/client';

import Modal from '~/src/components/districts/modal';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '~/src/components/common/form';
import Input from '~/src/components/common/input';
import Button from '~/src/components/common/button';
import { getPlacesByCreatorId } from '~/src/services/place/placeService'; // To fetch user's places

interface AddRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRouteAdded: () => void;
}

const createRouteSchema = z.object({
  name: z.string().min(1, { message: '루트 이름을 입력해주세요.' }),
  description: z.string().optional(),
  selectedPlaces: z.array(z.string()).min(1, { message: '최소 하나 이상의 장소를 선택해주세요.' }),
});

type AddRouteFormValues = z.infer<typeof createRouteSchema>;

export default function AddRouteModal({ isOpen, onClose, onRouteAdded }: AddRouteModalProps) {
  const { data: session } = useSession();
  const [userPlaces, setUserPlaces] = useState<Place[]>([]);
  const form = useForm<AddRouteFormValues>({
    resolver: zodResolver(createRouteSchema),
    defaultValues: {
      name: '',
      description: '',
      selectedPlaces: [],
    },
  });

  useEffect(() => {
    if (session?.user?.id) {
      const fetchUserPlaces = async () => {
        try {
          const response = await fetch(`/api/users/${session.user.id}/places`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const places: Place[] = await response.json();
          setUserPlaces(places);
        } catch (error) {
          console.error('Error fetching user places:', error);
        }
      };
      fetchUserPlaces();
    }
  }, [session]);

  const onSubmit = async (values: AddRouteFormValues) => {
    if (!session?.user?.id) {
      alert('로그인 후 루트를 등록할 수 있습니다.');
      return;
    }

    try {
      const routeResponse = await fetch('/api/routes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name,
          description: values.description,
        }),
      });

      if (!routeResponse.ok) {
        const errorData = await routeResponse.json();
        alert(`루트 등록 실패: ${errorData.message}`);
        return;
      }

      const newRoute = await routeResponse.json();

      // 선택된 장소들을 루트에 추가
      for (let i = 0; i < values.selectedPlaces.length; i++) {
        const placeId = values.selectedPlaces[i];
        await fetch('/api/route-places', { // 새로운 API 엔드포인트 필요
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            routeId: newRoute.id,
            placeId: placeId,
            order: i,
          }),
        });
      }

      alert('루트가 성공적으로 등록되었습니다.');
      form.reset();
      onRouteAdded();
      onClose();
    } catch (error) {
      console.error('Error adding route:', error);
      alert('루트 등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">새 루트 등록</h2>
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
      </div>
    </Modal>
  );
}
