import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import { getLikeStatus } from '~/src/services/like/likeService';
import { z } from 'zod';

const likeStatusQuerySchema = z
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

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ liked: false }, { status: 200 });
  }

  const { searchParams } = new URL(request.url);
  const userId = session.user.id;

  try {
    const { placeId, routeId } = likeStatusQuerySchema.parse(
      Object.fromEntries(searchParams),
    );
    const liked = await getLikeStatus(userId, { placeId, routeId });
    return NextResponse.json({ liked }, { status: 200 });
  } catch (error) {
    console.error('Error fetching like status:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
