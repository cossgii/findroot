import { NextResponse } from 'next/server';
import { db } from '~/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod'; // Import z for ZodError
import { signupSchema } from '~/src/components/auth/auth-schema';
import { MAIN_ACCOUNT_ID } from '~/config';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = signupSchema.parse(body);

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 트랜잭션을 사용하여 유저 생성과 팔로우 작업을 원자적으로 처리합니다.
    const newUser = await db.$transaction(async (prisma) => {
      const createdUser = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
        },
      });

      // 새로운 유저가 대표 계정을 자동으로 팔로우합니다.
      // 피드에 초기 콘텐츠가 보이도록 보장합니다.
      // MAIN_ACCOUNT_ID가 존재하고, 새로 생성된 유저가 대표 계정이 아닌 경우에만 팔로우
      const mainAccountExists = await prisma.user.findUnique({
        where: { id: MAIN_ACCOUNT_ID },
      });

      if (mainAccountExists && createdUser.id !== MAIN_ACCOUNT_ID) {
        await prisma.follow.create({
          data: {
            followerId: createdUser.id,
            followingId: MAIN_ACCOUNT_ID,
          },
        });
      }
      return createdUser;
    });

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: { id: newUser.id, email: newUser.email, name: newUser.name },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Signup error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 },
    );
  }
}
