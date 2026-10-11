import * as bcrypt from 'bcryptjs';
import { db } from '~/lib/db';
import { checkRateLimit, RATE_LIMITS } from '~/src/lib/rate-limiter';

interface LoginCredentials {
  loginId?: string;
  password?: string;
}

type HeaderSource =
  | Headers
  | Record<string, string | string[] | undefined>
  | undefined
  | null;

function getIp(headers: HeaderSource): string {
  if (!headers) return 'unknown';
  const get = (key: string): string | undefined => {
    if (headers instanceof Headers) return headers.get(key) ?? undefined;
    const value = headers[key];
    return Array.isArray(value) ? value[0] : value;
  };
  const forwarded = get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return get('x-real-ip') ?? 'unknown';
}

const GENERIC_ERROR = '아이디 또는 비밀번호가 올바르지 않습니다.';
const RATE_LIMIT_ERROR = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';

const DUMMY_HASH =
  '$2a$10$CwTycUXWue0Thq9StjUM0uJ8e8AQgJwN0hkQpA8r7ZH6QzXwBpVVa';

/**
 * 사용자 인증 로직
 * NextAuth의 CredentialsProvider와 모바일 앱용 /api/auth/app-login에서 사용
 */
export async function validateCredentials(
  credentials: LoginCredentials | undefined,
  requestHeaders?: HeaderSource,
) {
  // 입력 검증
  if (!credentials?.loginId || !credentials?.password) {
    throw new Error('아이디와 비밀번호를 입력해주세요.');
  }

  if (requestHeaders !== undefined) {
    const ip = getIp(requestHeaders);
    if (!checkRateLimit(`login:${ip}`, RATE_LIMITS.AUTH)) {
      throw new Error(RATE_LIMIT_ERROR);
    }
  }

  // 사용자 조회
  const user = await db.user.findUnique({
    where: { loginId: credentials.loginId },
  });

  if (!user || !user.password) {
    await bcrypt.compare(credentials.password, DUMMY_HASH);
    throw new Error(GENERIC_ERROR);
  }

  // 비밀번호 검증
  const isPasswordValid = await bcrypt.compare(
    credentials.password,
    user.password,
  );

  if (!isPasswordValid) {
    throw new Error(GENERIC_ERROR);
  }

  // 성공 시 안전한 사용자 정보 반환
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image ?? null,
  };
}
