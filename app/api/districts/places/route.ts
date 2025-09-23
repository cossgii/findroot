import { NextResponse } from 'next/server';
import { getPlacesByDistrict } from '~/src/services/place/placeService';
import { PlaceCategory } from '~/src/types/shared';
import { z } from 'zod';

const placesQuerySchema = z.object({
  districtName: z.string().min(1, { message: 'districtName is required' }),
  userId: z.string().optional(),
  page: z.preprocess(
    (val) => parseInt(z.string().parse(val), 10),
    z.number().min(1).default(1),
  ),
  limit: z.preprocess(
    (val) => parseInt(z.string().parse(val), 10),
    z.number().min(1).default(12),
  ),
  sort: z.enum(['recent', 'likes']).default('recent'),
  category: z.nativeEnum(PlaceCategory).optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  try {
    const validatedParams = placesQuerySchema.parse(
      Object.fromEntries(searchParams),
    );

    const { districtName, userId, page, limit, sort, category } =
      validatedParams;
    const data = await getPlacesByDistrict(
      districtName,
      userId,
      page,
      limit,
      sort,
      category,
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
