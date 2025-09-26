
import { NextResponse } from 'next/server';
import { db } from '~/lib/db';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const passwordRegex =
  /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$&*?!%])[A-Za-z\d!@$%&*?]{8,15}$/;

const resetPasswordSchema = z.object({
  selector: z.string().min(1, { message: '선택자가 필요합니다.' }),
  validator: z.string().min(1, { message: '검증자가 필요합니다.' }),
  password: z
    .string()
    .min(8, { message: '비밀번호는 8자리 이상이어야 합니다' })
    .regex(passwordRegex, {
      message: '영문, 숫자, 특수문자(~!@#$%^&*)를 모두 조합해 주세요',
    }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { selector, validator, password } = resetPasswordSchema.parse(body);

    // Find the token using the selector
    const resetToken = await db.passwordResetToken.findUnique({
      where: {
        selector: selector,
      },
    });

    if (!resetToken || resetToken.expires < new Date()) {
      return NextResponse.json(
        { message: '유효하지 않거나 만료된 토큰입니다.' },
        { status: 400 },
      );
    }

    // Compare the provided validator with the stored hashedValidator
    const isMatch = await bcrypt.compare(validator, resetToken.hashedValidator);

    if (!isMatch) {
      return NextResponse.json(
        { message: '유효하지 않거나 만료된 토큰입니다.' },
        { status: 400 },
      );
    }

    const user = await db.user.findFirst({ where: { email: resetToken.email } });
    if (!user) {
      // This should theoretically not happen if a token exists
      return NextResponse.json({ message: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password and delete all reset tokens for this user
    await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      db.passwordResetToken.deleteMany({
        where: { email: resetToken.email },
      }),
    ]);

    return NextResponse.json({ message: '비밀번호가 성공적으로 재설정되었습니다.' });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.issues },
        { status: 400 },
      );
    }
    console.error('Password reset error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 },
    );
  }
}
