'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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

interface SendMessageFormProps {
  onMessageSent: () => void;
}

const sendMessageSchema = z.object({
  content: z.string().min(1, { message: '메시지 내용을 입력해주세요.' }),
});

type SendMessageFormValues = z.infer<typeof sendMessageSchema>;

export default function SendMessageForm({
  onMessageSent,
}: SendMessageFormProps) {
  const { data: session } = useSession();
  const form = useForm<SendMessageFormValues>({
    resolver: zodResolver(sendMessageSchema),
    defaultValues: {
      content: '',
    },
  });

  const onSubmit = async (values: SendMessageFormValues) => {
    if (!session?.user?.id) {
      alert('로그인 후 메시지를 보낼 수 있습니다.');
      return;
    }

    try {
      // 서버에서 MAIN_ACCOUNT_ID를 수신자로 설정하도록 API 호출
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: values.content,
          receiverId: 'MAIN_ACCOUNT_ID_PLACEHOLDER', // 이 값은 서버에서 실제 MAIN_ACCOUNT_ID로 대체됩니다.
        }),
      });

      if (response.ok) {
        alert('메시지가 성공적으로 전송되었습니다.');
        form.reset();
        onMessageSent();
      } else {
        const errorData = await response.json();
        alert(`메시지 전송 실패: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('메시지 전송 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">메시지 보내기 (대표 유저에게)</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>메시지 내용</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={!session?.user?.id || form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? '전송 중...' : '메시지 전송'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
