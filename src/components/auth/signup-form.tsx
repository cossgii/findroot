'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

import Button from '~/src/components/common/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/src/components/common/form';
import Input from '~/src/components/common/input';

const formSchema = z
  .object({
    email: z.string().email({ message: '유효한 이메일 주소를 입력해주세요.' }),
    password: z
      .string()
      .min(6, { message: '비밀번호는 최소 6자 이상이어야 합니다.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword'],
  });

type SignupFormValues = z.infer<typeof formSchema>;

export function SignupForm() {
  const router = useRouter();
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: SignupFormValues) {
    try {
      const signupResponse = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      if (!signupResponse.ok) {
        const data = await signupResponse.json();
        if (data.message) {
          if (data.message.includes('email already exists')) {
            form.setError('email', { message: '이미 가입된 이메일입니다.' });
          } else {
            form.setError('root.serverError', { message: data.message });
          }
        } else {
          form.setError('root.serverError', { message: '회원가입에 실패했습니다.' });
        }
        return;
      }

      // 회원가입 성공 후 바로 로그인 시도
      const signInResponse = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false, // 페이지 새로고침 방지
      });

      if (signInResponse?.ok) {
        router.push('/'); // 로그인 성공 시 메인 페이지로 이동
      } else {
        // 자동 로그인 실패 시 (이론적으로는 발생하기 어려움)
        form.setError('root.serverError', {
          message: '회원가입은 완료되었으나, 자동 로그인에 실패했습니다. 다시 로그인해주세요.',
        });
        // 로그인 페이지로 리디렉션
        setTimeout(() => router.push('/login'), 3000);
      }
    } catch (error) {
      console.error('Signup error:', error);
      form.setError('root.serverError', { message: '네트워크 오류 또는 서버 문제' });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이메일</FormLabel>
              <FormControl>
                <Input placeholder="your@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>비밀번호</FormLabel>
              <FormControl>
                <Input type="password" placeholder="******" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>비밀번호 확인</FormLabel>
              <FormControl>
                <Input type="password" placeholder="******" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.formState.errors.root?.serverError && (
          <p className="text-red-500 text-sm text-center">
            {form.formState.errors.root.serverError.message}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? '가입하는 중...' : '회원가입'}
        </Button>
      </form>
      <div className="text-center text-sm mt-4">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="text-blue-500 hover:underline">
          로그인
        </Link>
      </div>
    </Form>
  );
}

