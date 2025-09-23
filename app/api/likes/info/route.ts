import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import { getLikeInfo } from '~/src/services/like/likeService';
import { z } from 'zod';

const likeInfoQuerySchema = z
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
  const { searchParams } = new URL(request.url);

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  try {
    const { placeId, routeId } = likeInfoQuerySchema.parse(
      Object.fromEntries(searchParams),
    );
    const { count, liked } = await getLikeInfo({ placeId, routeId }, userId);
    return NextResponse.json({ count, liked }, { status: 200 });
  } catch (error) {
    console.error('Error fetching like info:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
