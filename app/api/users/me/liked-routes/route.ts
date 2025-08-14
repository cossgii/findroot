import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import { getLikedRoutesByUserId } from '~/src/services/like/likeService';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const likedRoutes = await getLikedRoutesByUserId(session.user.id);
    return NextResponse.json(likedRoutes);
  } catch (error) {
    console.error('Error fetching liked routes:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
