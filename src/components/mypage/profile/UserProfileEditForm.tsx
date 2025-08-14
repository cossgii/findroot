'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User } from '@prisma/client';
import { useSession } from 'next-auth/react';

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

const userProfileSchema = z.object({
  name: z.string().min(1, { message: '이름을 입력해주세요.' }).optional(),
  email: z
    .string()
    .email({ message: '유효한 이메일 주소를 입력해주세요.' })
    .optional(),
  image: z
    .string()
    .url({ message: '유효한 이미지 URL을 입력해주세요.' })
    .optional(),
});

type UserProfileFormValues = z.infer<typeof userProfileSchema>;

interface UserProfileEditFormProps {
  user: User;
  onSave: (updatedUser: User) => void;
  onCancel: () => void;
}

export default function UserProfileEditForm({
  user,
  onSave,
  onCancel,
}: UserProfileEditFormProps) {
  const { update: updateSession } = useSession();
  const form = useForm<UserProfileFormValues>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      name: user.name || '',
      email: user.email || '',
      image: user.image || '',
    },
  });

  const onSubmit = async (values: UserProfileFormValues) => {
    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        onSave(updatedUser);
        // NextAuth 세션 업데이트
        await updateSession({ user: updatedUser });
      } else {
        const errorData = await response.json();
        alert(`프로필 업데이트 실패: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('프로필 업데이트 중 오류가 발생했습니다.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이메일</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>프로필 이미지 URL</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 mt-6">
          <Button type="button" variant="outlined" onClick={onCancel}>
            취소
          </Button>
          <Button type="submit">저장</Button>
        </div>
      </form>
    </Form>
  );
}
