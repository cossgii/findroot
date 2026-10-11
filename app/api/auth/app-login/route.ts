import { NextRequest, NextResponse } from 'next/server';
import { validateCredentials } from '~/src/services/auth/validateCredentials';
import { signAppToken } from '~/lib/app-jwt';

export async function POST(req: NextRequest) {
  try {
    const { loginId, password } = await req.json();
    const user = await validateCredentials({ loginId, password }, req.headers);
    const token = await signAppToken(user.id);
    return NextResponse.json({ token, user: { id: user.id, name: user.name, email: user.email, image: user.image } });
  } catch (error) {
    const message = error instanceof Error ? error.message : '로그인에 실패했습니다.';
    const status = message.includes('너무 많') ? 429 : 401;
    return NextResponse.json({ message }, { status });
  }
}
