import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import { getFeaturedRoutes } from '~/src/services/route/routeService';
import { RoutePurpose } from '@prisma/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const districtId = searchParams.get('districtId') || '';
  const creatorId = searchParams.get('creatorId') || undefined;
  const purpose = searchParams.get('purpose') as RoutePurpose | undefined;

  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id || undefined;

  try {
    const result = await getFeaturedRoutes(
      districtId,
      creatorId || undefined,
      currentUserId,
      purpose,
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching featured routes:', error);
    return NextResponse.json(
      { message: 'Failed to fetch featured routes' },
      { status: 500 },
    );
  }
}
