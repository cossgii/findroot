import * as bcrypt from 'bcryptjs';
import { db } from '~/lib/db';

interface LoginCredentials {
  loginId?: string;
  password?: string;
}

/**
 * 사용자 인증 로직
 * NextAuth의 CredentialsProvider에서 사용
 */
export async function validateCredentials(
  credentials: LoginCredentials | undefined,
) {
  // 입력 검증
  if (!credentials?.loginId || !credentials?.password) {
    throw new Error('아이디와 비밀번호를 입력해주세요.');
  }

  const GENERIC_ERROR = '아이디 또는 비밀번호가 올바르지 않습니다.';

  // 사용자 조회
  const user = await db.user.findUnique({
    where: { loginId: credentials.loginId },
  });

  if (!user) {
    throw new Error(GENERIC_ERROR);
  }

  // 소셜 로그인 계정 체크 (아이디 존재는 드러내지 않고, 로그인 방법만 안내)
  if (!user.password) {
    throw new Error(
      '이 아이디는 소셜 계정으로 가입되었습니다. 소셜 로그인을 이용해 주세요.',
    );
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
  };
}
