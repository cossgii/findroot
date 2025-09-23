/**
 * @jest-environment node
 */

import { middleware } from '~/middleware';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// next-auth/jwt 모듈 전체를 모킹합니다.
jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(),
}));

// getToken을 jest.Mock 타입으로 캐스팅하여 사용합니다.
const mockedGetToken = getToken as jest.Mock;

// NextRequest 객체를 생성하는 헬퍼 함수입니다.
const createMockRequest = (path: string) => {
  return new NextRequest(`http://localhost:3000${path}`);
};

describe('Middleware', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('로그인하지 않은 사용자 (토큰 없음)', () => {
    beforeEach(() => {
      // getToken이 항상 null을 반환하도록 설정합니다.
      mockedGetToken.mockResolvedValue(null);
    });

    it('보호된 경로(/mypage)에 접근 시 로그인 페이지로 리디렉션해야 한다', async () => {
      const req = createMockRequest('/mypage');
      const response = await middleware(req);

      // 응답이 리디렉션인지 확인합니다.
      expect(response.status).toBe(307); // NextResponse.redirect는 307 Temporary Redirect를 사용합니다.
      // 리디렉션 경로가 로그인 페이지이고 callbackUrl이 올바르게 설정되었는지 확인합니다.
      expect(response.headers.get('location')).toBe(
        'http://localhost:3000/login?callbackUrl=%2Fmypage',
      );
    });

    it('공개 경로(/)에 접근 시 요청을 그대로 통과시켜야 한다', async () => {
      const req = createMockRequest('/');
      const response = await middleware(req);

      // NextResponse.next()는 status 200을 반환합니다.
      expect(response.status).toBe(200);
      // 리디렉션 헤더가 없는지 확인합니다.
      expect(response.headers.get('location')).toBeNull();
    });

    it('로그인 페이지(/login)에 접근 시 요청을 그대로 통과시켜야 한다', async () => {
      const req = createMockRequest('/login');
      const response = await middleware(req);

      expect(response.status).toBe(200);
      expect(response.headers.get('location')).toBeNull();
    });
  });

  describe('로그인한 사용자 (토큰 있음)', () => {
    beforeEach(() => {
      // getToken이 유효한 토큰 객체를 반환하도록 설정합니다.
      mockedGetToken.mockResolvedValue({ id: 'test-user-id', email: 'test@example.com' });
    });

    it('보호된 경로(/mypage)에 접근 시 요청을 그대로 통과시켜야 한다', async () => {
      const req = createMockRequest('/mypage');
      const response = await middleware(req);

      expect(response.status).toBe(200);
      expect(response.headers.get('location')).toBeNull();
    });

    it('로그인 페이지(/login)에 접근 시 메인 페이지로 리디렉션해야 한다', async () => {
      const req = createMockRequest('/login');
      const response = await middleware(req);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe('http://localhost:3000/');
    });

    it('회원가입 페이지(/signup)에 접근 시 메인 페이지로 리디렉션해야 한다', async () => {
      const req = createMockRequest('/signup');
      const response = await middleware(req);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe('http://localhost:3000/');
    });

    it('공개 경로(/)에 접근 시 요청을 그대로 통과시켜야 한다', async () => {
      const req = createMockRequest('/');
      const response = await middleware(req);

      expect(response.status).toBe(200);
      expect(response.headers.get('location')).toBeNull();
    });
  });
});
