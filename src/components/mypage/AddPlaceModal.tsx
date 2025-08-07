'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSession } from 'next-auth/react';

import Modal from '~/src/components/districts/modal';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '~/src/components/common/form';
import Input from '~/src/components/common/input';
import Button from '~/src/components/common/button';
import { createPlaceSchema } from '~/src/services/place/place-schema';
import { CATEGORIES } from '~/src/utils/categories';

interface AddPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaceAdded: () => void;
}

type AddPlaceFormValues = z.infer<typeof createPlaceSchema>;

export default function AddPlaceModal({ isOpen, onClose, onPlaceAdded }: AddPlaceModalProps) {
  const { data: session } = useSession();
  const form = useForm<AddPlaceFormValues>({
    resolver: zodResolver(createPlaceSchema),
    defaultValues: {
      name: '',
      latitude: 0,
      longitude: 0,
      address: '',
      description: '',
      category: '',
    },
  });

  const onSubmit = async (values: AddPlaceFormValues) => {
    if (!session?.user?.id) {
      alert('로그인 후 장소를 등록할 수 있습니다.');
      return;
    }

    try {
      const response = await fetch('/api/places', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        alert('장소가 성공적으로 등록되었습니다.');
        form.reset();
        onPlaceAdded();
        onClose();
      } else {
        const errorData = await response.json();
        alert(`장소 등록 실패: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error adding place:', error);
      alert('장소 등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">새 장소 등록</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              name="latitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>위도</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="longitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>경도</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
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
                    <select {...field} className="w-full rounded-xl border-2 border-secondary-50 bg-gray-50 px-[16px] py-[10px] shadow-sm outline-2 transition-colors duration-75 hover:border-primary-300 focus:outline-primary-600">
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
