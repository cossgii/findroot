import { NextResponse } from 'next/server';
import { getPlaceLikesCount } from '~/src/services/like/likeService';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get('placeId');

  if (!placeId) {
    return NextResponse.json(
      { message: 'placeId is required' },
      { status: 400 },
    );
  }

  try {
    const count = await getPlaceLikesCount(placeId);
    return NextResponse.json({ count }, { status: 200 });
  } catch (error) {
    console.error('Error fetching likes count:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
