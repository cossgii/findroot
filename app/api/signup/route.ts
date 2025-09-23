import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { db } from '~/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { signupSchema } from '~/src/schemas/auth-schema';
import { MAIN_ACCOUNT_ID } from '~/config';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let email, password, name;

    try {
      ({ email, password, name } = signupSchema.parse(body));
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { message: 'Validation error', errors: validationError.issues },
          { status: 400 },
        );
      }
      throw validationError;
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 },
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.$transaction(
      async (prisma: Prisma.TransactionClient) => {
        const createdUser = await prisma.user.create({
          data: {
            email,
            name,
            password: hashedPassword,
          },
        });

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
      },
    );

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
