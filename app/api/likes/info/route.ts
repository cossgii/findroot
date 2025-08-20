import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import { getLikeInfo } from '~/src/services/like/likeService';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get('placeId') || undefined;
  const routeId = searchParams.get('routeId') || undefined;

  if (!placeId && !routeId) {
    return NextResponse.json(
      { message: 'placeId or routeId is required' },
      { status: 400 },
    );
  }

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  try {
    const { count, liked } = await getLikeInfo({ placeId, routeId }, userId);
    return NextResponse.json({ count, liked }, { status: 200 });
  } catch (error) {
    console.error('Error fetching like info:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
