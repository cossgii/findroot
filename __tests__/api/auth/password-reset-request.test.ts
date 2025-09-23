/**
 * @jest-environment node
 */

import { POST } from '~/app/api/auth/password-reset/request/route';
import { db } from '~/lib/db';
import { sendPasswordResetEmail } from '~/lib/mailer';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

// 1. 의존성 모의 처리
jest.mock('~/lib/db', () => ({
  db: {
    user: {
      findUnique: jest.fn(),
    },
    passwordResetToken: {
      create: jest.fn(),
    },
  },
}));

jest.mock('~/lib/mailer', () => ({
  sendPasswordResetEmail: jest.fn(),
}));

jest.mock('crypto', () => ({
  randomBytes: jest.fn(() => ({ toString: () => 'mocked-secure-token' })),
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}));

// 2. 타입 캐스팅 및 변수 할당
const mockedDb = db as jest.Mocked<typeof db>;
const mockedMailer = { sendPasswordResetEmail } as jest.Mocked<
  typeof import('~/lib/mailer')
>;
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('POST /api/auth/password-reset/request', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('가입된 이메일로 요청 시, 비밀번호 재설정 토큰을 생성하고 이메일을 전송해야 한다', async () => {
    // Arrange
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
    };
    (mockedDb.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (mockedBcrypt.hash as jest.Mock).mockResolvedValue('hashed-token');
    (mockedDb.passwordResetToken.create as jest.Mock).mockResolvedValue({});
    mockedMailer.sendPasswordResetEmail.mockResolvedValue();

    const req = new NextRequest('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }),
    });

    // Act
    const response = await POST(req);
    const body = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(body.message).toContain('비밀번호 재설정 이메일이 전송되었습니다');
    expect(mockedDb.passwordResetToken.create).toHaveBeenCalledTimes(1);
    expect(mockedMailer.sendPasswordResetEmail).toHaveBeenCalledWith(
      'test@example.com',
      'mocked-secure-token',
      'mocked-secure-token',
    );
  });

  it('가입되지 않은 이메일로 요청 시, 보안을 위해 성공 메시지를 반환하지만 실제 작업은 수행하지 않아야 한다', async () => {
    // Arrange
    (mockedDb.user.findUnique as jest.Mock).mockResolvedValue(null);

    const req = new NextRequest('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ email: 'not-found@example.com' }),
    });

    // Act
    const response = await POST(req);
    const body = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(body.message).toContain('비밀번호 재설정 이메일이 전송되었습니다');
    expect(mockedDb.passwordResetToken.create).not.toHaveBeenCalled();
    expect(mockedMailer.sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it('유효하지 않은 이메일 형식으로 요청 시, 400 에러를 반환해야 한다', async () => {
    // Arrange
    const req = new NextRequest('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ email: 'invalid-email' }),
    });

    // Act
    const response = await POST(req);
    const body = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(body.message).toBe('Validation error');
  });

  it('이메일이 없는 요청 시, 400 에러를 반환해야 한다', async () => {
    // Arrange
    const req = new NextRequest('http://localhost', {
      method: 'POST',
      body: JSON.stringify({}), // Empty body or missing email field
    });

    // Act
    const response = await POST(req);
    const body = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(body.message).toBe('Validation error'); // Assuming a generic validation error message
    // You might also check for specific error details if your API provides them
    // expect(body.errors[0].path).toEqual(['email']);
  });
});
