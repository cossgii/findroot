import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import { getLikedPlacesByUserId } from '~/src/services/like/likeService';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const likedPlaces = await getLikedPlacesByUserId(session.user.id);
    return NextResponse.json(likedPlaces);
  } catch (error) {
    console.error('Error fetching liked places:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
