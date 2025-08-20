import { NextResponse } from 'next/server';
import {
  getPlaceLikesCount,
  getRouteLikesCount,
} from '~/src/services/like/likeService';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get('placeId');
  const routeId = searchParams.get('routeId');

  if (!placeId && !routeId) {
    return NextResponse.json(
      { message: 'placeId or routeId is required' },
      { status: 400 },
    );
  }

  try {
    let count;
    if (placeId) {
      count = await getPlaceLikesCount(placeId);
    } else if (routeId) {
      count = await getRouteLikesCount(routeId);
    } else {
      // This case is already handled by the check above, but for type safety
      return NextResponse.json({ count: 0 });
    }
    return NextResponse.json({ count }, { status: 200 });
  } catch (error) {
    console.error('Error fetching likes count:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
