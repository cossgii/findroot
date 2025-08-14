import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import { getLikeStatus } from '~/src/services/like/likeService';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ liked: false }, { status: 200 }); // 로그인 안했으면 좋아요 안 누른 상태로 간주
  }

  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get('placeId');
  const userId = session.user.id;

  if (!placeId) {
    return NextResponse.json(
      { message: 'placeId is required' },
      { status: 400 },
    );
  }

  try {
    const liked = await getLikeStatus(userId, placeId);
    return NextResponse.json({ liked }, { status: 200 });
  } catch (error) {
    console.error('Error fetching like status:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
