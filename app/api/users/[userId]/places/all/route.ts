import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import { getAllPlacesByCreatorId } from '~/src/services/place/placeService';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.id !== params.userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const places = await getAllPlacesByCreatorId(params.userId);
    return NextResponse.json(places);
  } catch (error) {
    console.error('Error fetching all user places:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
