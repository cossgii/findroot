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

interface EditAlternativeModalProps {
  isOpen: boolean;
  onClose: () => void;
  routeId: string;
  routePlaceId: string;
  alternative: { id: string; placeId: string; explanation: string; place: { name: string; address: string | null } };
  onAlternativeUpdated: () => void;
}

export default function EditAlternativeModal({
  isOpen,
  onClose,
  routeId,
  routePlaceId,
  alternative,
  onAlternativeUpdated,
}: EditAlternativeModalProps) {
  const { form, onSubmit, isPending } = useAlternativeForm({
    routeId,
    routePlaceId,
    alternative,
    onClose,
    onSuccess: onAlternativeUpdated,
  });

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">예비 장소 수정</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormItem>
              <FormLabel>장소</FormLabel>
              <FormControl>
                <Input
                  value={`${alternative.place.name} (${alternative.place.address})`}
                  readOnly
                  disabled
                />
              </FormControl>
            </FormItem>
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
                {isPending ? '수정 중...' : '수정'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </BaseModal>
  );
}
