import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { createPlaceSchema } from '~/src/services/place/place-schema';
import { PlaceCategory } from '@prisma/client';
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

type EditPlaceFormValues = z.infer<typeof createPlaceSchema>;

interface EditPlaceFormProps {
  form: UseFormReturn<EditPlaceFormValues>;
  onSubmit: (values: EditPlaceFormValues) => void;
  onClose: () => void;
}

export default function EditPlaceForm({
  form,
  onSubmit,
  onClose,
}: EditPlaceFormProps) {
  return (
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
          name="link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>링크 (선택 사항)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="관련 웹사이트 링크를 입력하세요 (예: www.example.com)" />
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
                  <option value={PlaceCategory.MEAL}>식사 (MEAL)</option>
                  <option value={PlaceCategory.DRINK}>음료 (DRINK)</option>
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
          <Button type="submit">수정</Button>
        </div>
      </form>
    </Form>
  );
}
