import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import { getPublicRoutesByDistrict } from '~/src/services/route/routeService';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

  const { searchParams } = new URL(request.url);
  const districtId = searchParams.get('districtId');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '5', 10);

  if (!districtId) {
    return NextResponse.json(
      { message: 'districtId query parameter is required' },
      { status: 400 },
    );
  }

  try {
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
