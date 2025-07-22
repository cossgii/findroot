'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type z } from 'zod';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

import { loginSchema } from '~/src/components/auth/auth-schema';
import Button from '~/src/components/common/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
} from '~/src/components/common/form';
import Input from '~/src/components/common/input';
// import { useLogin } from '~/src/services/auths/use-login';

export default function LoginForm() {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  //   const { mutate: Login, isPending } = useLogin(form);

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    // Login(values);
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
        <Button type="submit" disabled={!form.formState.isDirty}>
          로그인
        </Button>
      </form>
      <div className="flex flex-col gap-4">
        <Button onClick={() => signIn('google')} type="button">
          Google 로그인
        </Button>
        <Button onClick={() => signIn('kakao')} type="button">
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
