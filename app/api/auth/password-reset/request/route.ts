import { NextResponse } from 'next/server';
import { db } from '~/lib/db';
import { sendPasswordResetEmail } from '~/lib/mailer';
import { z } from 'zod';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const requestResetSchema = z.object({
  loginId: z.string().min(1, { message: '아이디를 입력해주세요.' }),
  email: z.string().email({ message: '유효한 이메일을 입력해주세요.' }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { loginId, email } = requestResetSchema.parse(body);

    const user = await db.user.findFirst({ where: { loginId, email } });

    if (!user) {
      return NextResponse.json(
        {
          message:
            '비밀번호 재설정 이메일이 전송되었습니다. 이메일함을 확인해주세요.',
        },
        { status: 200 },
      );
    }

    const selector = crypto.randomBytes(16).toString('hex');
    const validator = crypto.randomBytes(32).toString('hex');
    const hashedValidator = await bcrypt.hash(validator, 10);
    const tokenExpires = new Date(Date.now() + 3600000);

    await db.passwordResetToken.create({
      data: {
        email: user.email,
        selector: selector,
        hashedValidator: hashedValidator,
        expires: tokenExpires,
      },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?selector=${selector}&validator=${validator}`;

    await sendPasswordResetEmail(user.email, selector, validator);

    return NextResponse.json(
      {
        message:
          '비밀번호 재설정 이메일이 전송되었습니다. 이메일함을 확인해주세요.',
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.issues },
        { status: 400 },
      );
    }
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 },
    );
  }
}
