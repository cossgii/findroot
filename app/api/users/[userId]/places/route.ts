import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import { getPlacesByCreatorId } from '~/src/services/place/placeService';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const resolvedParams = await params;
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '5', 10);

  const userId = resolvedParams.userId;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.id !== userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const paginatedData = await getPlacesByCreatorId(userId, page, limit);
    return NextResponse.json(paginatedData);
  } catch (error) {
    console.error('Error fetching user places:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
