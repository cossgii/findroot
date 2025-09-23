import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import { getLikedRoutesByUserId } from '~/src/services/like/likeService';
import { z } from 'zod';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';

const districtIds = SEOUL_DISTRICTS.map(d => d.id);
const likedRoutesQuerySchema = z.object({
  page: z.preprocess((val) => parseInt(z.string().parse(val), 10), z.number().min(1).default(1)),
  limit: z.preprocess((val) => parseInt(z.string().parse(val), 10), z.number().min(1).default(5)),
  districtId: z.string().refine(val => districtIds.includes(val) || val === 'all', { message: 'Invalid district ID' }).optional(),
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  try {
    const { page, limit, districtId } = likedRoutesQuerySchema.parse(Object.fromEntries(searchParams));
    const paginatedData = await getLikedRoutesByUserId(
      session.user.id,
      page,
      limit,
      districtId,
    );
    return NextResponse.json(paginatedData);
  } catch (error) {
    console.error('Error fetching liked routes:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
