import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NEXTAUTH_SECRET } from '~/config';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // 1. 로그인된 사용자가 로그인/회원가입 페이지에 접근 시 메인 페이지로 리디렉션
  if (token && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // 2. 보호가 필요한 경로 목록
  const protectedPaths = ['/mypage'];
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));

  // 3. 로그인되지 않은 사용자가 보호된 경로에 접근 시 로그인 페이지로 리디렉션
  if (!token && isProtectedPath) {
    const url = new URL('/login', req.url);
    url.searchParams.set('callbackUrl', pathname); // 원래 가려던 경로를 쿼리로 추가
    return NextResponse.redirect(url);
  }

  // 그 외의 경우는 요청을 그대로 통과
  return NextResponse.next();
}

// 미들웨어가 적용될 경로를 설정합니다.
// api, _next/static, _next/image, favicon.ico를 제외한 모든 경로에서 미들웨어를 실행합니다.
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};