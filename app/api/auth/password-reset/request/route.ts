
import { NextResponse } from 'next/server';
import { db } from '~/lib/db';
import { sendPasswordResetEmail } from '~/lib/mailer';
import { z } from 'zod';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const requestResetSchema = z.object({
  email: z.string().email({ message: '유효한 이메일을 입력해주세요.' }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = requestResetSchema.parse(body);

    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      // Do not reveal if the user exists or not for security reasons.
      // Send a generic success message.
      return NextResponse.json(
        { message: '비밀번호 재설정 이메일이 전송되었습니다. 이메일함을 확인해주세요.' },
        { status: 200 },
      );
    }

    // Generate a secure token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(resetToken, 10);

    // Set token expiration to 1 hour from now
    const tokenExpires = new Date(Date.now() + 3600000); // 1 hour

    // Store the hashed token in the database
    await db.passwordResetToken.create({
      data: {
        email: user.email,
        token: hashedToken,
        expires: tokenExpires,
      },
    });

    // Construct the reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

    // --- EMAIL SENDING ---
    // In a real application, you would send an email to the user here.
    // For development, you can use Ethereal Email (https://ethereal.email/)
    // Configure your .env with Ethereal credentials:
    // EMAIL_SERVER_HOST=smtp.ethereal.email
    // EMAIL_SERVER_PORT=587
    // EMAIL_FROM=your_ethereal_email@ethereal.email
    // EMAIL_SERVER_PASSWORD=your_ethereal_password
    await sendPasswordResetEmail(user.email, resetToken);
    // --- END EMAIL SENDING ---

    return NextResponse.json(
      { message: '비밀번호 재설정 이메일이 전송되었습니다. 이메일함을 확인해주세요.' },
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
