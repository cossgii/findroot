'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ClientUser as User } from '~/src/types/shared';
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
import { Avatar, AvatarFallback, AvatarImage } from '~/src/components/common/avatar';

// Schema for text inputs only. Image is handled separately.
const userProfileSchema = z.object({
  name: z.string().min(1, { message: '이름을 입력해주세요.' }).optional(),
  email: z.string().email({ message: '유효한 이메일 주소를 입력해주세요.' }).optional(),
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user.image);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<UserProfileFormValues>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      name: user.name || '',
      email: user.email || '',
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (values: UserProfileFormValues) => {
    setIsUploading(true);
    let imageUrl = user.image; // Start with the existing image URL

    try {
      // Step 1: If a new file is selected, upload it
      if (selectedFile) {
        // 1a: Get the signed URL and the final public URL from our server
        const apiResponse = await fetch('/api/images/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: selectedFile.name }),
        });

        if (!apiResponse.ok) throw new Error('Failed to get upload URL.');
        const { signedUrl, publicUrl } = await apiResponse.json();

        // 1b: Upload the file to Supabase Storage using the signed URL
        const uploadResponse = await fetch(signedUrl, {
            method: 'PUT',
            headers: { 'Content-Type': selectedFile.type },
            body: selectedFile,
        });

        if (!uploadResponse.ok) throw new Error('Image upload failed.');
        
        // 1c: The upload was successful, so we can use the public URL
        imageUrl = publicUrl;
      }

      // Step 2: Update the user profile with other form data and the new image URL
      const updatePayload = { ...values, image: imageUrl };
      const profileUpdateResponse = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      if (!profileUpdateResponse.ok) throw new Error('Failed to update profile.');

      const updatedUser = await profileUpdateResponse.json();
      await updateSession({ user: updatedUser });
      onSave(updatedUser);
      alert('프로필이 성공적으로 업데이트되었습니다.');

    } catch (error) {
      console.error('Error updating profile:', error);
      alert(`프로필 업데이트 중 오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4">
        <div className="flex flex-col items-center space-y-4">
            <Avatar size="large">
                <AvatarImage src={previewUrl || ''} />
                <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이름</FormLabel>
              <FormControl><Input {...field} /></FormControl>
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
              <FormControl><Input type="email" {...field} readOnly disabled /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 mt-6">
          <Button type="button" variant="outlined" onClick={onCancel} disabled={isUploading}>
            취소
          </Button>
          <Button type="submit" disabled={isUploading}>
            {isUploading ? '저장 중...' : '저장'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
