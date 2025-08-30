
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import { db } from '~/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const passwordRegex =
  /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$&*?!%])[A-Za-z\d!@$%&*?]{8,15}$/;

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: '현재 비밀번호를 입력해주세요.' }),
  newPassword: z
    .string()
    .min(8, { message: '새 비밀번호는 8자리 이상이어야 합니다' })
    .regex(passwordRegex, {
      message: '영문, 숫자, 특수문자(~!@#$%^&*)를 모두 조합해 주세요',
    }),
});

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { currentPassword, newPassword } = changePasswordSchema.parse(body);

    const user = await db.user.findUnique({ where: { id: session.user.id } });

    if (!user || !user.password) {
      return NextResponse.json(
        { message: '사용자 정보를 찾을 수 없거나, 소셜 로그인 유저입니다.' },
        { status: 404 },
      );
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: '현재 비밀번호가 일치하지 않습니다.' },
        { status: 403 },
      );
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await db.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    });

    return NextResponse.json({ message: '비밀번호가 성공적으로 변경되었습니다.' });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.issues },
        { status: 400 },
      );
    }
    console.error('Change password error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 },
    );
  }
}
