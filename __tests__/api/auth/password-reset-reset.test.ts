/**
 * @jest-environment node
 */

import { POST } from '~/app/api/auth/password-reset/reset/route';
import { db } from '~/lib/db';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

// 1. 의존성 모의 처리
jest.mock('~/lib/db', () => ({
  db: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    passwordResetToken: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock('bcryptjs');

// 2. 타입 캐스팅 및 변수 할당
const mockedDb = db as jest.Mocked<typeof db>;
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('POST /api/auth/password-reset/reset', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('유효한 토큰과 비밀번호로, 성공적으로 비밀번호를 재설정해야 한다', async () => {
    // Arrange
    const mockToken = 'valid-token';
    const mockHashedValidator = 'hashed-valid-token'; // Consistent with bcrypt.hash mock

    (mockedBcrypt.hash as jest.Mock).mockResolvedValueOnce('new-hashed-password'); // For new password
    (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true); // For validator comparison

    // Mock the findUnique call for passwordResetToken
    (mockedDb.passwordResetToken.findUnique as jest.Mock).mockResolvedValue({
      id: 'token123',
      email: 'test@example.com', // Important: API uses email from token
      selector: mockToken,
      hashedValidator: mockHashedValidator,
      expires: new Date(Date.now() + 3600000), // 1 hour from now
    });

    // Mock the user findFirst call
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    (mockedDb.user.findFirst as jest.Mock).mockResolvedValue(mockUser);

    // Mock the transaction
    (mockedDb.$transaction as jest.Mock).mockResolvedValue([{}, {}]);

    const req = new NextRequest('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ selector: mockToken, validator: mockToken, password: 'newPassword123!' }),
    });

    // Act
    const response = await POST(req);
    const body = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(body.message).toBe('비밀번호가 성공적으로 재설정되었습니다.');
    expect(mockedBcrypt.compare).toHaveBeenCalledWith(mockToken, mockHashedValidator); // Compare with hashedValidator
    expect(mockedDb.user.update).toHaveBeenCalledWith({
      where: { id: mockUser.id },
      data: { password: 'new-hashed-password' },
    });
    expect(mockedDb.passwordResetToken.deleteMany).toHaveBeenCalledWith({
      where: { email: mockUser.email },
    });
  });

  it('유효하지 않은 토큰이면, 400 에러를 반환해야 한다', async () => {
    // Arrange
    (mockedDb.passwordResetToken.findUnique as jest.Mock).mockResolvedValue(null); // Use findUnique mock

    const req = new NextRequest('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ selector: 'invalid-selector', validator: 'invalid-validator', password: 'newPassword123!' }),
    });

    // Act
    const response = await POST(req);
    const body = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(body.message).toBe('유효하지 않거나 만료된 토큰입니다.');
  });

  it('비밀번호가 유효성 검사를 통과하지 못하면, 400 에러를 반환해야 한다', async () => {
    // Arrange
    const req = new NextRequest('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ token: 'valid-token', password: 'short' }),
    });

    // Act
    const response = await POST(req);
    const body = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(body.message).toBe('Validation error');
  });

  it('만료된 토큰이면, 400 에러를 반환해야 한다', async () => {
    // Arrange
    const mockToken = 'expired-token';
    const mockHashedValidator = 'hashed-expired-token';

    // Mock the findUnique call for passwordResetToken to return an expired token
    (mockedDb.passwordResetToken.findUnique as jest.Mock).mockResolvedValue({
      id: 'token123',
      email: 'test@example.com',
      selector: mockToken,
      hashedValidator: mockHashedValidator,
      expires: new Date(Date.now() - 3600000), // 1 hour ago (expired)
    });

    // Mock bcrypt.compare to return true (token itself is valid, but expired)
    (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);

    const req = new NextRequest('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ selector: mockToken, validator: mockToken, password: 'newPassword123!' }),
    });

    // Act
    const response = await POST(req);
    const body = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(body.message).toBe('유효하지 않거나 만료된 토큰입니다.');
    expect(mockedDb.user.update).not.toHaveBeenCalled(); // Ensure password is not updated
    expect(mockedDb.passwordResetToken.deleteMany).not.toHaveBeenCalled(); // Ensure token is not deleted
  });
});
