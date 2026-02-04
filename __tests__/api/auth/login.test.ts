/**
 * @jest-environment node
 */

import bcrypt from 'bcryptjs';
import { db } from '~/lib/db';
import { validateCredentials } from '~/src/services/auth/validateCredentials';

// DB와 bcrypt를 Mock으로 설정
jest.mock('~/lib/db', () => ({
  db: {
    user: {
      findUnique: jest.fn(),
    },
    account: {
      findFirst: jest.fn(),
    },
  },
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

const mockedDb = db as jest.Mocked<typeof db>;
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('로그인 인증 단위 테스트 (validateCredentials)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // 성공 케이스
  // ============================================
  describe('성공 케이스', () => {
    it('유효한 자격 증명으로 로그인에 성공해야 한다', async () => {
      const mockUser = {
        id: 'user-1',
        loginId: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
        password: '$2a$10$hashedPassword',
        image: null,
        emailVerified: null,
      };

      (mockedDb.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await validateCredentials({
        loginId: 'testuser',
        password: 'correctPassword',
      });

      expect(result).toEqual({
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
      });
      expect(mockedDb.user.findUnique).toHaveBeenCalledWith({
        where: { loginId: 'testuser' },
      });
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        'correctPassword',
        '$2a$10$hashedPassword',
      );
    });
  });

  // ============================================
  // 실패 케이스 - 입력 검증
  // ============================================
  describe('실패 케이스 - 입력 검증', () => {
    it('loginId가 없으면 에러를 던져야 한다', async () => {
      await expect(
        validateCredentials({
          loginId: '',
          password: 'password123',
        }),
      ).rejects.toThrow('아이디와 비밀번호를 입력해주세요.');

      expect(mockedDb.user.findUnique).not.toHaveBeenCalled();
    });

    it('password가 없으면 에러를 던져야 한다', async () => {
      await expect(
        validateCredentials({
          loginId: 'testuser',
          password: '',
        }),
      ).rejects.toThrow('아이디와 비밀번호를 입력해주세요.');

      expect(mockedDb.user.findUnique).not.toHaveBeenCalled();
    });

    it('loginId와 password가 모두 없으면 에러를 던져야 한다', async () => {
      await expect(
        validateCredentials({
          loginId: '',
          password: '',
        }),
      ).rejects.toThrow('아이디와 비밀번호를 입력해주세요.');

      expect(mockedDb.user.findUnique).not.toHaveBeenCalled();
    });

    it('credentials가 빈 객체면 에러를 던져야 한다', async () => {
      await expect(validateCredentials({})).rejects.toThrow(
        '아이디와 비밀번호를 입력해주세요.',
      );

      expect(mockedDb.user.findUnique).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // 실패 케이스 - 사용자 조회
  // ============================================
  describe('실패 케이스 - 사용자 조회', () => {
    it('존재하지 않는 사용자로 로그인 시 에러를 던져야 한다', async () => {
      (mockedDb.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        validateCredentials({
          loginId: 'nonexistent',
          password: 'password123',
        }),
      ).rejects.toThrow('가입되지 않은 아이디입니다.');

      expect(mockedDb.user.findUnique).toHaveBeenCalledWith({
        where: { loginId: 'nonexistent' },
      });
      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // 실패 케이스 - 소셜 로그인 계정
  // ============================================
  describe('실패 케이스 - 소셜 로그인 계정', () => {
    it('Google 계정으로 가입된 사용자는 자격 증명 로그인 불가', async () => {
      const socialUser = {
        id: 'user-1',
        loginId: 'google_12345',
        email: 'social@example.com',
        name: 'Social User',
        password: null,
        image: null,
        emailVerified: null,
      };

      const googleAccount = {
        userId: 'user-1',
        provider: 'google',
        providerAccountId: '12345',
      };

      (mockedDb.user.findUnique as jest.Mock).mockResolvedValue(socialUser);
      (mockedDb.account.findFirst as jest.Mock).mockResolvedValue(
        googleAccount,
      );

      await expect(
        validateCredentials({
          loginId: 'google_12345',
          password: 'anyPassword',
        }),
      ).rejects.toThrow('이 아이디는 GOOGLE 계정으로 가입되었습니다.');

      expect(mockedDb.account.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
    });

    it('Kakao 계정으로 가입된 사용자는 자격 증명 로그인 불가', async () => {
      const socialUser = {
        id: 'user-2',
        loginId: 'kakao_67890',
        email: 'kakao@example.com',
        name: 'Kakao User',
        password: null,
        image: null,
        emailVerified: null,
      };

      const kakaoAccount = {
        userId: 'user-2',
        provider: 'kakao',
        providerAccountId: '67890',
      };

      (mockedDb.user.findUnique as jest.Mock).mockResolvedValue(socialUser);
      (mockedDb.account.findFirst as jest.Mock).mockResolvedValue(kakaoAccount);

      await expect(
        validateCredentials({
          loginId: 'kakao_67890',
          password: 'anyPassword',
        }),
      ).rejects.toThrow('이 아이디는 KAKAO 계정으로 가입되었습니다.');
    });

    it('provider 정보가 없으면 "다른" 계정으로 표시', async () => {
      const socialUser = {
        id: 'user-3',
        loginId: 'unknown_user',
        email: 'unknown@example.com',
        name: 'Unknown User',
        password: null,
        image: null,
        emailVerified: null,
      };

      (mockedDb.user.findUnique as jest.Mock).mockResolvedValue(socialUser);
      (mockedDb.account.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        validateCredentials({
          loginId: 'unknown_user',
          password: 'anyPassword',
        }),
      ).rejects.toThrow('이 아이디는 다른 계정으로 가입되었습니다.');
    });
  });

  // ============================================
  // 실패 케이스 - 비밀번호 검증
  // ============================================
  describe('실패 케이스 - 비밀번호 검증', () => {
    it('잘못된 비밀번호로 로그인 시 에러를 던져야 한다', async () => {
      const mockUser = {
        id: 'user-1',
        loginId: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
        password: '$2a$10$hashedPassword',
        image: null,
        emailVerified: null,
      };

      (mockedDb.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        validateCredentials({
          loginId: 'testuser',
          password: 'wrongPassword',
        }),
      ).rejects.toThrow('비밀번호가 일치하지 않습니다.');

      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        'wrongPassword',
        '$2a$10$hashedPassword',
      );
    });
  });

  // ============================================
  // 에러 처리
  // ============================================
  describe('에러 처리', () => {
    it('DB 조회 중 에러 발생 시 에러를 전파해야 한다', async () => {
      const dbError = new Error('Database connection failed');
      (mockedDb.user.findUnique as jest.Mock).mockRejectedValue(dbError);

      await expect(
        validateCredentials({
          loginId: 'testuser',
          password: 'password123',
        }),
      ).rejects.toThrow('Database connection failed');
    });

    it('bcrypt 비교 중 에러 발생 시 에러를 전파해야 한다', async () => {
      const mockUser = {
        id: 'user-1',
        loginId: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
        password: '$2a$10$hashedPassword',
        image: null,
        emailVerified: null,
      };

      (mockedDb.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const bcryptError = new Error('Bcrypt comparison failed');
      (mockedBcrypt.compare as jest.Mock).mockRejectedValue(bcryptError);

      await expect(
        validateCredentials({
          loginId: 'testuser',
          password: 'password123',
        }),
      ).rejects.toThrow('Bcrypt comparison failed');
    });
  });

  // ============================================
  // Edge Cases
  // ============================================
  describe('Edge Cases', () => {
    it('특수문자가 포함된 loginId를 처리할 수 있어야 한다', async () => {
      const mockUser = {
        id: 'user-1',
        loginId: 'test@user#123',
        email: 'test@example.com',
        name: 'Test User',
        password: '$2a$10$hashedPassword',
        image: null,
        emailVerified: null,
      };

      (mockedDb.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await validateCredentials({
        loginId: 'test@user#123',
        password: 'password123',
      });

      expect(result).toBeDefined();
      expect(result.id).toBe('user-1');
    });

    it('매우 긴 비밀번호를 처리할 수 있어야 한다', async () => {
      const longPassword = 'a'.repeat(1000);
      const mockUser = {
        id: 'user-1',
        loginId: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
        password: '$2a$10$hashedPassword',
        image: null,
        emailVerified: null,
      };

      (mockedDb.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await validateCredentials({
        loginId: 'testuser',
        password: longPassword,
      });

      expect(result).toBeDefined();
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        longPassword,
        '$2a$10$hashedPassword',
      );
    });
  });

  // ============================================
  // 반환값 검증
  // ============================================
  describe('반환값 검증', () => {
    it('성공 시 민감한 정보(password)를 포함하지 않아야 한다', async () => {
      const mockUser = {
        id: 'user-1',
        loginId: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
        password: '$2a$10$hashedPassword',
        image: null,
        emailVerified: null,
      };

      (mockedDb.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await validateCredentials({
        loginId: 'testuser',
        password: 'password123',
      });

      expect(result).toBeDefined();
      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('loginId');
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('name');
    });

    it('반환되는 사용자 객체의 타입이 올바라야 한다', async () => {
      const mockUser = {
        id: 'user-1',
        loginId: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
        password: '$2a$10$hashedPassword',
        image: null,
        emailVerified: null,
      };

      (mockedDb.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await validateCredentials({
        loginId: 'testuser',
        password: 'password123',
      });

      expect(result).toBeDefined();
      expect(typeof result.id).toBe('string');
      expect(typeof result.email).toBe('string');
      expect(typeof result.name).toBe('string');
    });
  });

  // ============================================
  // 보안 관련
  // ============================================
  describe('보안 관련', () => {
    it('SQL Injection 시도를 안전하게 처리해야 한다', async () => {
      const sqlInjection = "testuser' OR '1'='1";

      (mockedDb.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        validateCredentials({
          loginId: sqlInjection,
          password: 'password',
        }),
      ).rejects.toThrow('가입되지 않은 아이디입니다.');

      // Prisma는 자동으로 파라미터화하므로 안전
      expect(mockedDb.user.findUnique).toHaveBeenCalledWith({
        where: { loginId: sqlInjection },
      });
    });
  });
});
