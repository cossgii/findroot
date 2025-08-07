import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import { getPlacesByCreatorId } from '~/src/services/place/placeService';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } },
) {
  const resolvedParams = await Promise.resolve(params);
  const userId = resolvedParams.userId;
  const session = await getServerSession(authOptions);
  // 요청하는 userId와 세션의 userId가 일치하는지 확인 (보안 강화)
  if (!session?.user?.id || session.user.id !== userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const places = await getPlacesByCreatorId(userId);
    return NextResponse.json(places);
  } catch (error) {
    console.error('Error fetching user places:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
