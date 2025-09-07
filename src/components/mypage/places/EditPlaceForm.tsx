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
import CategoryDropdown from '~/src/components/common/CategoryDropdown';

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