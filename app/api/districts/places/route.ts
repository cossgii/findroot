import { NextResponse } from 'next/server';
import { getPlacesByDistrict } from '~/src/services/place/placeService';
import { PlaceCategory } from '@prisma/client';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';

const placesQuerySchema = z.object({
  districtName: z.string().min(1, { message: 'districtName is required' }),
  targetUserId: z.string().optional(),
  page: z.string().optional().default('1').transform(Number).pipe(z.number().min(1)),
  limit: z.string().optional().default('12').transform(Number).pipe(z.number().min(1)),
  sort: z.enum(['recent', 'likes']).default('recent'),
  category: z.nativeEnum(PlaceCategory).optional(),
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;
  const { searchParams } = new URL(request.url);

  try {
    const validatedParams = placesQuerySchema.parse(
      Object.fromEntries(searchParams),
    );

    const { districtName, targetUserId, page, limit, sort, category } =
      validatedParams;

    const data = await getPlacesByDistrict(
      districtName,
      currentUserId,
      page,
      limit,
      sort,
      category,
      targetUserId,
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching places by district:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
