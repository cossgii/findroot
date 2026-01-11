import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import { getFollowStatus } from '~/src/services/user/followService';
import { z } from 'zod';

const UserFollowStatusParamsSchema = z.object({
  userId: z.string({ message: '유효한 사용자 ID가 필요합니다.' }),
});

interface UserFollowStatusParams {
  userId: string;
}

export async function GET(
  request: Request,
  context: { params: Promise<UserFollowStatusParams> },
) {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

  if (!currentUserId) {
    return NextResponse.json({ isFollowing: false }, { status: 200 });
  }

  try {
    const { userId: followingId } = UserFollowStatusParamsSchema.parse(
      await context.params,
    );

    const isFollowing = await getFollowStatus(currentUserId, followingId);
    return NextResponse.json({ isFollowing });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid user ID', errors: error.issues },
        { status: 400 },
      );
    }
    console.error('Error fetching follow status:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
