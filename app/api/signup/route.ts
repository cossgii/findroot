import { NextResponse } from 'next/server';
import { db } from '~/lib/db';
import bcrypt from 'bcryptjs'; // bcryptjs 설치 필요: pnpm add bcryptjs

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 1. 입력값 유효성 검사
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 },
      );
    }

    // 2. 이메일 중복 확인
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 },
      );
    }

    // 3. 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10); // saltRounds 10

    // 4. 사용자 생성 및 저장
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword, // 해싱된 비밀번호 저장
      },
    });

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: { id: user.id, email: user.email },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 },
    );
  }
}
