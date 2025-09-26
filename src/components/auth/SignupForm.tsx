'use client';

import { useForm, Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { z } from 'zod';

import Button from '~/src/components/common/Button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/src/components/common/Form';
import Input from '~/src/components/common/Input';
import { signupSchema } from '~/src/schemas/auth-schema';

type SignupFormValues = z.infer<typeof signupSchema>;

export function SignupForm() {
  const router = useRouter();
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      loginId: '',
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
          name: values.name,
          loginId: values.loginId,
          email: values.email,
          password: values.password,
          confirmPassword: values.confirmPassword,
        }),
      });

      if (!signupResponse.ok) {
        const data = await signupResponse.json();
        if (data.message === 'Validation error' && data.errors) {
          data.errors.forEach((err: z.ZodIssue) => {
            if (err.path && err.path.length > 0) {
              form.setError(err.path[0] as Path<SignupFormValues>, {
                message: err.message,
              });
            } else {
              form.setError('root.serverError', { message: err.message });
            }
          });
        } else if (data.message) {
          if (data.message.includes('email already exists')) {
            form.setError('email', { message: '이미 가입된 이메일입니다.' });
          } else {
            form.setError('root.serverError', { message: data.message });
          }
        } else {
          form.setError('root.serverError', {
            message: '회원가입에 실패했습니다.',
          });
        }
        return;
      }

      const signInResponse = await signIn('credentials', {
        loginId: values.loginId,
        password: values.password,
        redirect: false,
      });

      if (signInResponse?.ok) {
        router.push('/');
      } else {
        form.setError('root.serverError', {
          message:
            '회원가입은 완료되었으나, 자동 로그인에 실패했습니다. 다시 로그인해주세요.',
        });
        setTimeout(() => router.push('/login'), 3000);
      }
    } catch (error) {
      console.error('Signup error:', error);
      form.setError('root.serverError', {
        message: '네트워크 오류 또는 서버 문제',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="loginId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>아이디</FormLabel>
              <FormControl>
                <Input placeholder="로그인 아이디" {...field} />
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
                <Input placeholder="your@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이름</FormLabel>
              <FormControl>
                <Input placeholder="홍길동" {...field} />
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
        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
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
