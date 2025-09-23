import { loginSchema, signupSchema } from '~/src/schemas/auth-schema';
import { ZodError } from 'zod';

describe('Auth Schemas', () => {
  // --- loginSchema Tests ---
  describe('loginSchema', () => {
    it('유효한 이메일과 비밀번호를 제공하면 검증에 통과해야 한다', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      };
      expect(() => loginSchema.parse(validData)).not.toThrow();
    });

    it('유효하지 않은 이메일 형식을 제공하면 에러를 던져야 한다', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'password123',
      };
      expect(() => loginSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('비밀번호가 비어있으면 에러를 던져야 한다', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '',
      };
      expect(() => loginSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('이메일 필드가 없으면 에러를 던져야 한다', () => {
      const invalidData = {
        password: 'password123',
      };
      expect(() => loginSchema.parse(invalidData)).toThrow(ZodError);
    });
  });

  // --- signupSchema Tests ---
  describe('signupSchema', () => {
    let validData: Record<string, unknown>;

    beforeEach(() => {
      validData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      };
    });

    it('모든 필드가 유효하면 검증에 통과해야 한다', () => {
      expect(() => signupSchema.parse(validData)).not.toThrow();
    });

    it('이름이 2글자 미만이면 에러를 던져야 한다', () => {
      const invalidData = { ...validData, name: 'A' };
      expect(() => signupSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('비밀번호가 8자리 미만이면 에러를 던져야 한다', () => {
      const invalidData = { ...validData, password: 'Pass1!', confirmPassword: 'Pass1!' };
      expect(() => signupSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('비밀번호에 영문, 숫자, 특수문자가 모두 포함되지 않으면 에러를 던져야 한다', () => {
      const invalidPassword1 = { ...validData, password: 'password123', confirmPassword: 'password123' }; // 특수문자 없음
      const invalidPassword2 = { ...validData, password: 'Password!!', confirmPassword: 'Password!!' }; // 숫자 없음
      const invalidPassword3 = { ...validData, password: '12345678!', confirmPassword: '12345678!' }; // 영문 없음

      expect(() => signupSchema.parse(invalidPassword1)).toThrow(ZodError);
      expect(() => signupSchema.parse(invalidPassword2)).toThrow(ZodError);
      expect(() => signupSchema.parse(invalidPassword3)).toThrow(ZodError);
    });

    it('비밀번호와 비밀번호 확인이 일치하지 않으면 에러를 던져야 한다', () => {
      const invalidData = { ...validData, confirmPassword: 'different' };
      expect(() => signupSchema.parse(invalidData)).toThrow(ZodError);
    });
  });
});
