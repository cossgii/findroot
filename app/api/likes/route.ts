import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import { addLike, removeLike } from '~/src/services/like/likeService';
import { z } from 'zod';

const likeSchema = z
  .object({
    placeId: z.string().optional(),
    routeId: z.string().optional(),
  })
  .refine((data) => data.placeId || data.routeId, {
    message: 'placeId or routeId is required',
  })
  .refine((data) => !(data.placeId && data.routeId), {
    message: 'Only one of placeId or routeId can be provided',
  });

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { placeId, routeId } = likeSchema.parse(await request.json());
    const like = await addLike(session.user.id, { placeId, routeId });
    return NextResponse.json(like, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.issues },
        { status: 400 },
      );
    }
    console.error('--- DETAILED LIKE API ERROR ---');
    console.error('ERROR OBJECT:', error);
    console.error('--- END OF DETAILED ERROR ---');
    return NextResponse.json(
      { message: 'Internal Server Error', errorDetail: String(error) },
      { status: 500 }, // Changed status back to 500
    );
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Add try-catch block here
    const { placeId, routeId } = likeSchema.parse(await request.json()); // Use the same schema

    await removeLike(session.user.id, { placeId, routeId });
    return NextResponse.json({ message: 'Like removed' }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Handle Zod errors
      return NextResponse.json(
        { message: 'Validation error', errors: error.issues },
        { status: 400 },
      );
    }
    console.error('Error removing like:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
