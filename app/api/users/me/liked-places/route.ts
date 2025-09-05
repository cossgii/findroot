import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import { getLikedPlacesByUserId } from '~/src/services/like/likeService';
import { PlaceCategory } from '~/src/types/shared';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '5', 10);
  const districtId = searchParams.get('districtId');
  const category = searchParams.get('category') as PlaceCategory | null;

  try {
    const paginatedData = await getLikedPlacesByUserId(
      session.user.id,
      page,
      limit,
      districtId,
      category,
    );
    return NextResponse.json(paginatedData);
  } catch (error) {
    console.error('Error fetching liked places:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
