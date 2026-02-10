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

  // 사용자 조회
  const user = await db.user.findUnique({
    where: { loginId: credentials.loginId },
  });

  if (!user) {
    throw new Error('가입되지 않은 아이디입니다.');
  }

  // 소셜 로그인 계정 체크
  if (!user.password) {
    const account = await db.account.findFirst({
      where: { userId: user.id },
    });
    const provider = account?.provider.toUpperCase() || '다른';
    throw new Error(`이 아이디는 ${provider} 계정으로 가입되었습니다.`);
  }

  // 비밀번호 검증
  const isPasswordValid = await bcrypt.compare(
    credentials.password,
    user.password,
  );

  if (!isPasswordValid) {
    throw new Error('비밀번호가 일치하지 않습니다.');
  }

  // 성공 시 안전한 사용자 정보 반환
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}
