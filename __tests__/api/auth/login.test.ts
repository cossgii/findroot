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
        image: null,
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
      ).rejects.toThrow('아이디 또는 비밀번호가 올바르지 않습니다.');

      expect(mockedDb.user.findUnique).toHaveBeenCalledWith({
        where: { loginId: 'nonexistent' },
      });
      expect(mockedBcrypt.compare).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================
  // 로그인 시도 제한 (rate limit)
  // ============================================
  describe('로그인 시도 제한', () => {
    it('같은 IP에서 짧은 시간 내 허용치를 초과하면 요청을 거부해야 한다', async () => {
      (mockedDb.user.findUnique as jest.Mock).mockResolvedValue(null);
      const headers = { 'x-forwarded-for': '203.0.113.9' };

      for (let i = 0; i < 10; i++) {
        await expect(
          validateCredentials(
            { loginId: 'nonexistent', password: 'pw' },
            headers,
          ),
        ).rejects.toThrow('아이디 또는 비밀번호가 올바르지 않습니다.');
      }

      await expect(
        validateCredentials(
          { loginId: 'nonexistent', password: 'pw' },
          headers,
        ),
      ).rejects.toThrow('요청이 너무 많습니다');
    });
  });

  // ============================================
  // 실패 케이스 - 소셜 로그인 계정
  // ============================================
  describe('실패 케이스 - 소셜 로그인 계정', () => {
    it('소셜 계정으로 가입된 사용자는 일반 실패 메시지와 함께 자격 증명 로그인이 거부되어야 한다 (가입 방식 노출 금지)', async () => {
      const socialUser = {
        id: 'user-1',
        loginId: 'google_12345',
        email: 'social@example.com',
        name: 'Social User',
        password: null,
        image: null,
        emailVerified: null,
      };

      (mockedDb.user.findUnique as jest.Mock).mockResolvedValue(socialUser);

      await expect(
        validateCredentials({
          loginId: 'google_12345',
          password: 'anyPassword',
        }),
      ).rejects.toThrow('아이디 또는 비밀번호가 올바르지 않습니다.');

      // 계정 열거(user enumeration) 방지: provider 조회 자체를 하지 않아야 한다
      expect(mockedDb.account.findFirst).not.toHaveBeenCalled();
    });

    it('provider 종류와 무관하게 항상 동일한 일반 메시지를 반환해야 한다', async () => {
      const kakaoUser = {
        id: 'user-2',
        loginId: 'kakao_67890',
        email: 'kakao@example.com',
        name: 'Kakao User',
        password: null,
        image: null,
        emailVerified: null,
      };

      (mockedDb.user.findUnique as jest.Mock).mockResolvedValue(kakaoUser);

      await expect(
        validateCredentials({
          loginId: 'kakao_67890',
          password: 'anyPassword',
        }),
      ).rejects.toThrow('아이디 또는 비밀번호가 올바르지 않습니다.');
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
      ).rejects.toThrow('아이디 또는 비밀번호가 올바르지 않습니다.');

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
      ).rejects.toThrow('아이디 또는 비밀번호가 올바르지 않습니다.');

      // Prisma는 자동으로 파라미터화하므로 안전
      expect(mockedDb.user.findUnique).toHaveBeenCalledWith({
        where: { loginId: sqlInjection },
      });
    });
  });
});
