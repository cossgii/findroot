import { NextResponse } from 'next/server';
import {
  getPlaceLikesCount,
  getRouteLikesCount,
} from '~/src/services/like/likeService';
import { z } from 'zod';

const likeCountQuerySchema = z
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

  try {
    const { placeId, routeId } = likeCountQuerySchema.parse(
      Object.fromEntries(searchParams),
    );
    let count;
    if (placeId) {
      count = await getPlaceLikesCount(placeId);
    } else if (routeId) {
      count = await getRouteLikesCount(routeId);
    } else {
      // This case is already handled by the check above, but for type safety
      return NextResponse.json({ count: 0 });
    }
    return NextResponse.json({ count }, { status: 200 });
  } catch (error) {
    console.error('Error fetching likes count:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
