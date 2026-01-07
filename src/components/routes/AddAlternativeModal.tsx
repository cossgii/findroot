'use client';

import React from 'react';
import BaseModal from '~/src/components/common/BaseModal';
import { useAlternativeForm } from '~/src/hooks/useAlternativeForm';
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
import Dropdown from '~/src/components/common/Dropdown';
import { ClientPlace } from '~/src/types/shared';

interface AddAlternativeModalProps {
  isOpen: boolean;
  onClose: () => void;
  routeId: string;
  routePlaceId: string;
  onAlternativeAdded: () => void;
  originalPlace: ClientPlace;
  existingAlternatives?: { placeId: string }[];
}

export default function AddAlternativeModal({
  isOpen,
  onClose,
  routeId,
  routePlaceId,
  onAlternativeAdded,
  originalPlace,
  existingAlternatives,
}: AddAlternativeModalProps) {
  const {
    form,
    onSubmit,
    isPending,
    userPlaces: filteredUserPlaces,
    isLoadingUserPlaces,
  } = useAlternativeForm({
    routeId,
    routePlaceId,
    onClose,
    onSuccess: onAlternativeAdded,
    originalPlace,
    existingAlternatives,
  });

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">예비 장소 추가</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="placeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>장소 선택</FormLabel>
                  <FormControl>
                    <Dropdown<ClientPlace>
                      options={filteredUserPlaces}
                      value={filteredUserPlaces.find((p) => p.id === field.value)}
                      onChange={(place) => field.onChange(place.id)}
                      getOptionLabel={(place) => `${place.name} (${place.address})`}
                      placeholder={
                        isLoadingUserPlaces
                          ? '장소 불러오는 중...'
                          : filteredUserPlaces.length === 0
                            ? '등록된 장소가 없습니다.'
                            : '장소를 선택하세요'
                      }
                      triggerClassName="w-full"
                      contentClassName="max-h-40 overflow-y-auto"
                      disabled={isLoadingUserPlaces || filteredUserPlaces.length === 0}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="explanation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>추가 설명</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="예비 장소에 대한 설명을 입력하세요."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                {isPending ? '추가 중...' : '추가'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </BaseModal>
  );
}
