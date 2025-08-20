import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import { addLike, removeLike } from '~/src/services/like/likeService';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { placeId, routeId } = await request.json();

  if (!placeId && !routeId) {
    return NextResponse.json(
      { message: 'placeId or routeId is required' },
      { status: 400 },
    );
  }

  try {
    const like = await addLike(session.user.id, { placeId, routeId });
    return NextResponse.json(like, { status: 201 });
  } catch (error) {
    console.error('Error adding like:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { placeId, routeId } = await request.json();

  if (!placeId && !routeId) {
    return NextResponse.json(
      { message: 'placeId or routeId is required' },
      { status: 400 },
    );
  }

  try {
    await removeLike(session.user.id, { placeId, routeId });
    return NextResponse.json({ message: 'Like removed' }, { status: 200 });
  } catch (error) {
    console.error('Error removing like:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
