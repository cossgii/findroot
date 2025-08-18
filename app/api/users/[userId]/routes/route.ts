import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import { getRoutesByCreatorId, getRoutesByCreatorIdAndDistrictId } from '~/src/services/route/routeService';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } },
) {
  const session = await getServerSession(authOptions);
  const userIdFromParams = params.userId;

  // 인증 및 권한 확인
  if (!session?.user?.id || session.user.id !== userIdFromParams) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const districtId = searchParams.get('districtId');

  try {
    let routes;
    if (districtId) {
      routes = await getRoutesByCreatorIdAndDistrictId(
        userIdFromParams,
        districtId,
      );
    } else {
      routes = await getRoutesByCreatorId(userIdFromParams);
    }
    return NextResponse.json(routes);
  } catch (error) {
    console.error('Error fetching user routes:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}