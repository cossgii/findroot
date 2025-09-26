'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type z } from 'zod';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { loginSchema } from '~/src/schemas/auth-schema';
import Button from '~/src/components/common/Button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/src/components/common/Form';
import Input from '~/src/components/common/Input';

export default function LoginForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      loginId: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    try {
      const result = await signIn('credentials', {
        redirect: false,
        loginId: values.loginId,
        password: values.password,
      });

      if (result?.error) {
        form.setError('root.serverError', {
          message: '아이디 또는 비밀번호가 올바르지 않습니다.',
        });
        return;
      }

      router.push('/');
    } catch (error) {
      console.error(error);
      form.setError('root.serverError', {
        message: '로그인 중 알 수 없는 오류가 발생했습니다.',
      });
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
          name="loginId"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="loginId">아이디</FormLabel>
              <Input
                error={form.formState.errors.loginId?.message}
                type="text"
                placeholder="아이디를 입력해주세요"
                {...field}
              />
              <FormMessage />
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
              <FormMessage />
            </FormItem>
          )}
        />
        {form.formState.errors.root?.serverError && (
          <FormMessage className="text-center">
            {form.formState.errors.root.serverError.message}
          </FormMessage>
        )}
        <Button
          type="submit"
          disabled={!form.formState.isDirty || form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? '로그인 중...' : '로그인'}
        </Button>
      </form>
      <div className="flex flex-col gap-4">
        <Button
          onClick={() => signIn('google', { callbackUrl: '/' })}
          type="button"
        >
          Google 로그인
        </Button>
        <Button
          onClick={() => signIn('kakao', { callbackUrl: '/' })}
          type="button"
        >
          Kakao 로그인
        </Button>
      </div>
      <div className="flex justify-between text-sm mt-4">
        <Link href="/forgot-password" className="text-blue-500 hover:underline">
          비밀번호를 잊으셨나요?
        </Link>
        <span>
          계정이 없으신가요?{' '}
          <Link href="/signup" className="text-blue-500 hover:underline">
            회원가입
          </Link>
        </span>
      </div>
    </Form>
  );
}
