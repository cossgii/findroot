import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import { getRoutesByCreatorId } from '~/src/services/route/routeService';
import { z } from 'zod';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';

const districtIds = SEOUL_DISTRICTS.map(d => d.id);

const UserRoutesParamsSchema = z.object({
  userId: z.string({ message: '유효한 사용자 ID가 필요합니다.' }),
});

const UserRoutesQuerySchema = z.object({
  page: z.preprocess((val) => parseInt(z.string().parse(val), 10), z.number().min(1).default(1)),
  limit: z.preprocess((val) => parseInt(z.string().parse(val), 10), z.number().min(1).default(5)),
  districtId: z.string().refine(val => districtIds.includes(val) || val === 'all', { message: 'Invalid district ID' }).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);

  try {
    const { userId: userIdFromParams } = UserRoutesParamsSchema.parse(resolvedParams);
    const { searchParams } = new URL(request.url); // Re-introduce this line
    const { page, limit, districtId } = UserRoutesQuerySchema.parse(Object.fromEntries(searchParams));

    if (!session?.user?.id || session.user.id !== userIdFromParams) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const result = await getRoutesByCreatorId(
      userIdFromParams,
      page,
      limit,
      districtId,
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching user routes:', error);
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
