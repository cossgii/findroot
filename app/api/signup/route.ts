import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

// The hardcoded ID of the main account that every new user will follow.
const MAIN_ACCOUNT_ID = 'cmdgvgj7o0001bsv4avsk90hh'; // TODO: Replace with a real, permanent admin/main account ID

export async function POST(request: Request) {
  try {
    // Note: The original code didn't include 'name', but it's good practice for a user model.
    // Assuming the client will send 'name' along with email and password.
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { message: 'Email, password, and name are required' },
        { status: 400 },
      );
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    // Automatically follow the main account
    // This ensures that new users will have content in their feed.
    if (newUser.id !== MAIN_ACCOUNT_ID) { // Prevents the main account from following itself
      await db.follow.create({
        data: {
          followerId: newUser.id,
          followingId: MAIN_ACCOUNT_ID,
        },
      });
    }

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: { id: newUser.id, email: newUser.email, name: newUser.name },
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
