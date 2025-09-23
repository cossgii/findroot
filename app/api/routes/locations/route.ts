import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import { getPublicRoutesByDistrict } from '~/src/services/route/routeService';
import { z } from 'zod';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';

const districtIds = SEOUL_DISTRICTS.map(d => d.id);
const routeLocationQuerySchema = z.object({
  districtId: z.string().refine(val => districtIds.includes(val) || val === 'all', { message: 'Invalid district ID' }),
  page: z.preprocess((val) => parseInt(z.string().parse(val), 10), z.number().min(1).default(1)),
  limit: z.preprocess((val) => parseInt(z.string().parse(val), 10), z.number().min(1).default(5)),
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

  const { searchParams } = new URL(request.url);

  try {
    const { districtId, page, limit } = routeLocationQuerySchema.parse(Object.fromEntries(searchParams));
    const paginatedData = await getPublicRoutesByDistrict(
      districtId,
      currentUserId,
      page,
      limit,
    );
    return NextResponse.json(paginatedData);
  } catch (error) {
    console.error('Error fetching public routes by district:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
