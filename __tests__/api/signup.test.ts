/**
 * @jest-environment node
 */

import { POST } from '~/app/api/signup/route';
import { db } from '~/lib/db';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

// Mock external dependencies ONLY: db, bcrypt, and config
jest.mock('~/config', () => ({ MAIN_ACCOUNT_ID: 'test-main-account-id' }));
jest.mock('~/lib/db', () => ({
  db: {
    user: { findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn() },
    $transaction: jest.fn(),
  },
}));
jest.mock('bcryptjs');

const mockedDb = db as jest.Mocked<typeof db>;

const createRequest = (data: object) =>
  new NextRequest('http://localhost/api/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  });

describe('POST /api/signup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('성공 케이스', () => {
    it('유효한 정보로 사용자 등록 시 201을 반환하고, 트랜잭션이 올바르게 실행된다', async () => {
      // Arrange: Mock setup for a successful signup flow
      (mockedDb.user.findFirst as jest.Mock).mockResolvedValue(null); // No existing user by email
      (mockedDb.user.findUnique as jest.Mock).mockResolvedValue(null); // No existing user by loginId
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');

      // Mock the transaction callback
      (mockedDb.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const prisma = {
          user: {
            create: jest.fn().mockResolvedValue({
              id: 'new-user-id',
              email: 'test@example.com',
              loginId: 'testuser',
              name: 'Test User',
            }),
            findUnique: jest.fn().mockResolvedValue({ id: 'test-main-account-id' }), // Main account exists
          },
          follow: { create: jest.fn() },
        };
        return callback(prisma);
      });

      const req = createRequest({
        email: 'test@example.com',
        loginId: 'testuser',
        name: 'Test User',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

      // Act
      const response = await POST(req);
      const body = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(body.message).toBe('User registered successfully');
      expect(body.user.email).toBe('test@example.com');

      // Verify that the correct functions were called
      expect(mockedDb.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(mockedDb.user.findUnique).toHaveBeenCalledWith({
        where: { loginId: 'testuser' },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('Password123!', 10);
      expect(mockedDb.$transaction).toHaveBeenCalledTimes(1);
    });
  });

  describe('클라이언트 오류 (400번대)', () => {
    it('중복된 이메일로 가입 시 409를 반환한다', async () => {
      // Arrange
      (mockedDb.user.findFirst as jest.Mock).mockResolvedValue({
        id: 'existing-user-id',
        email: 'test@example.com',
        name: 'Existing User',
      });
      (mockedDb.user.findUnique as jest.Mock).mockResolvedValue(null);


      const req = createRequest({
        email: 'test@example.com',
        loginId: 'testuser',
        name: 'Test User',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

      // Act
      const response = await POST(req);
      const body = await response.json();

      // Assert
      expect(response.status).toBe(409);
      expect(body.message).toBe('User with this email already exists');
    });

    it('중복된 아이디로 가입 시 409를 반환한다', async () => {
      // Arrange
      (mockedDb.user.findFirst as jest.Mock).mockResolvedValue(null);
      (mockedDb.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'existing-user-id',
        loginId: 'testuser',
        name: 'Existing User',
      });

      const req = createRequest({
        email: 'test@example.com',
        loginId: 'testuser',
        name: 'Test User',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

      // Act
      const response = await POST(req);
      const body = await response.json();

      // Assert
      expect(response.status).toBe(409);
      expect(body.message).toBe('User with this loginId already exists');
    });

    it('여러 유효성 검사 실패 시 400과 모든 에러 메시지를 반환한다', async () => {
      // Arrange
      const req = createRequest({
        loginId: 'a', // loginId too short
        email: 'invalid-email', // Invalid email format
        name: 'A', // Name too short
        password: 'short', // Password too short
        confirmPassword: 'different', // Passwords don't match
      });

      // Act
      const response = await POST(req);
      const body = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(body.message).toBe('Validation error');
      expect(body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ['name'],
            message: '이름은 2글자 이상이어야 합니다',
          }),
          expect.objectContaining({
            path: ['email'],
            message: '이메일 형식이 아닙니다',
          }),
          expect.objectContaining({
            path: ['password'],
            message: '비밀번호는 8자리 이상이어야 합니다',
          }),
          expect.objectContaining({
            path: ['confirmPassword'],
            message: '비밀번호가 일치하지 않습니다.',
          }),
        ]),
      );
    });

    it('비밀번호가 정규식 조건에 맞지 않으면 400을 반환한다', async () => {
      // Arrange
      const req = createRequest({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123', // Missing special character
        confirmPassword: 'password123',
      });

      // Act
      const response = await POST(req);
      const body = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(body.message).toBe('Validation error');
      expect(body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ['password'],
            message: '영문, 숫자, 특수문자(~!@#$%^&*)를 모두 조합해 주세요',
          }),
        ]),
      );
    });
  });

  describe('서버 오류 (500번대)', () => {
    it('비밀번호 해싱 중 오류 발생 시 500을 반환한다', async () => {
      // Arrange
      (mockedDb.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockImplementation(() => {
        throw new Error('Hashing failed');
      });

      const req = createRequest({
        email: 'test@example.com',
        loginId: 'testuser',
        name: 'Test User',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

      // Act
      const response = await POST(req);
      const body = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(body.message).toBe('Internal server error');
    });

    it('데이터베이스 트랜잭션 중 오류 발생 시 500을 반환한다', async () => {
      // Arrange
      (mockedDb.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
      (mockedDb.$transaction as jest.Mock).mockImplementation(async () => {
        throw new Error('DB transaction failed');
      });

      const req = createRequest({
        email: 'test@example.com',
        loginId: 'testuser',
        name: 'Test User',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

      // Act
      const response = await POST(req);
      const body = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(body.message).toBe('Internal server error');
    });
  });
});
