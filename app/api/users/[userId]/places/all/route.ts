import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import { getAllPlacesByCreatorId } from '~/src/services/place/placeService';
import { z } from 'zod';

const UserPlacesAllParamsSchema = z.object({
  userId: z.string({ message: '유효한 사용자 ID가 필요합니다.' }),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);

  try {
    const { userId } = UserPlacesAllParamsSchema.parse(resolvedParams);

    if (!session?.user?.id || session.user.id !== userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const places = await getAllPlacesByCreatorId(userId);
    return NextResponse.json(places);
  } catch (error) {
    console.error('Error fetching all user places:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid user ID', errors: error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
