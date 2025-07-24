'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type z } from 'zod';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { loginSchema } from '~/src/components/auth/auth-schema';
import Button from '~/src/components/common/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
} from '~/src/components/common/form';
import Input from '~/src/components/common/input';

export default function LoginForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (result?.error) {
        console.error(result.error);
        alert('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
        return;
      }

      router.push('/');
    } catch (error) {
      console.error(error);
      alert('로그인 중 오류가 발생했습니다.');
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col gap-[24px]"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="email">아이디</FormLabel>
              <Input
                error={form.formState.errors.email?.message}
                type="email"
                placeholder="이메일을 입력해주세요"
                {...field}
              />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="password">비밀번호</FormLabel>
              <Input
                error={form.formState.errors.password?.message}
                type="password"
                placeholder="비밀번호를 입력해주세요"
                {...field}
              />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={!form.formState.isDirty || form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? '로그인 중...' : '로그인'}
        </Button>
      </form>
      <div className="flex flex-col gap-4">
        <Button onClick={() => signIn('google', { callbackUrl: '/' })} type="button">
          Google 로그인
        </Button>
        <Button onClick={() => signIn('kakao', { callbackUrl: '/' })} type="button">
          Kakao 로그인
        </Button>
      </div>
      <div className="text-center text-sm mt-4">
        계정이 없으신가요?{' '}
        <Link href="/signup" className="text-blue-500 hover:underline">
          회원가입
        </Link>
      </div>
    </Form>
  );
}

