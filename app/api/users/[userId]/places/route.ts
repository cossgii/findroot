import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import { getPlacesByCreatorId } from '~/src/services/place/placeService';
import { PlaceCategory } from '~/src/types/shared';
import { z } from 'zod';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';

const districtIds = SEOUL_DISTRICTS.map(d => d.id);

const UserPlacesParamsSchema = z.object({
  userId: z.string({ message: '유효한 사용자 ID가 필요합니다.' }),
});

const UserPlacesQuerySchema = z.object({
  page: z.preprocess((val) => parseInt(z.string().parse(val), 10), z.number().min(1).default(1)),
  limit: z.preprocess((val) => parseInt(z.string().parse(val), 10), z.number().min(1).default(5)),
  districtId: z.string().refine(val => districtIds.includes(val) || val === 'all', { message: 'Invalid district ID' }).optional(),
  category: z.nativeEnum(PlaceCategory).optional().nullable(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const resolvedParams = await params;
  const { searchParams } = new URL(request.url);

  try {
    const { userId: creatorId } = UserPlacesParamsSchema.parse(resolvedParams);
    const { page, limit, districtId, category } = UserPlacesQuerySchema.parse(Object.fromEntries(searchParams));

    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;

    const paginatedData = await getPlacesByCreatorId(
      creatorId,
      page,
      limit,
      districtId,
      currentUserId,
      category,
    );
    return NextResponse.json(paginatedData);
  } catch (error) {
    console.error('Error fetching user places:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
