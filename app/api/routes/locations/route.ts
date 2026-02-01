import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import { getAllPublicRoutes } from '~/src/services/route/routeService';
import { z } from 'zod';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';
import { RoutePurpose } from '@prisma/client';

const districtIds = SEOUL_DISTRICTS.map((d) => d.id);
const routeLocationQuerySchema = z.object({
  districtId: z
    .string()
    .refine((val) => districtIds.includes(val) || val === 'all', {
      message: 'Invalid district ID',
    })
    .optional(),
  page: z.preprocess(
    (val) => parseInt(z.string().parse(val), 10),
    z.number().min(1).default(1),
  ),
  limit: z.preprocess(
    (val) => parseInt(z.string().parse(val), 10),
    z.number().min(1).default(5),
  ),
  purpose: z.nativeEnum(RoutePurpose).optional(),
  targetUserId: z.string().optional(),
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

  const { searchParams } = new URL(request.url);

  try {
    const validatedParams = routeLocationQuerySchema.parse(
      Object.fromEntries(searchParams),
    );
    const { districtId, page, limit, purpose, targetUserId } = validatedParams;

    const paginatedData = await getAllPublicRoutes(
      districtId,
      currentUserId,
      page,
      limit,
      purpose,
      targetUserId,
      undefined,
    );
    return NextResponse.json(paginatedData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid query parameters', errors: error.issues },
        { status: 400 },
      );
    }
    console.error('Error fetching public routes by district:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
