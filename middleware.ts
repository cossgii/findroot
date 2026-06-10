import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NEXTAUTH_SECRET } from '~/config';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // API 경로 CORS 처리
  if (pathname.startsWith('/api')) {
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
    }
    const response = NextResponse.next();
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  const token = await getToken({ req, secret: NEXTAUTH_SECRET });

  // 로그인된 사용자가 로그인/회원가입 페이지에 접근 시 메인 페이지로 리디렉션
  if (
    token &&
    (pathname === '/login' ||
      pathname === '/signup' ||
      pathname === '/forgot-password' ||
      pathname === '/reset-password')
  ) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // 보호가 필요한 경로 목록
  const isProtectedPath =
    pathname.startsWith('/mypage') || pathname.startsWith('/routes/');

  // 로그인되지 않은 사용자가 보호된 경로에 접근 시 로그인 페이지로 리디렉션
  if (!token && isProtectedPath) {
    const url = new URL('/login', req.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
