import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import { getPlacesByCreatorId } from '~/src/services/place/placeService';
import { PlaceCategory } from '~/src/types/shared';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const resolvedParams = await params;
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '5', 10);
  const districtId = searchParams.get('districtId');
  const category = searchParams.get('category') as PlaceCategory | null;

  const creatorId = resolvedParams.userId;
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

  try {
    const paginatedData = await getPlacesByCreatorId(
      creatorId,
      page,
      limit,
      districtId,
      currentUserId,
      category,
    );
    return NextResponse.json(paginatedData);
  } catch (error) {
    console.error('Error fetching user places:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
