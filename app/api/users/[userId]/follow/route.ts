import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import { followUser, unfollowUser } from '~/src/services/user/followService';
import { z } from 'zod';

const UserFollowParamsSchema = z.object({
  userId: z.string({ message: '유효한 사용자 ID가 필요합니다.' }),
});

interface UserFollowParams {
  userId: string;
}

export async function POST(
  request: Request,
  context: { params: Promise<UserFollowParams> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { userId: followingId } = UserFollowParamsSchema.parse(
      await context.params,
    );
    const followerId = session.user.id;

    if (followerId === followingId) {
      return NextResponse.json(
        { message: 'Cannot follow yourself.' },
        { status: 400 },
      );
    }

    const follow = await followUser(followerId, followingId);
    return NextResponse.json(follow, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid user ID', errors: error.issues },
        { status: 400 },
      );
    }
    console.error('Error following user:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<UserFollowParams> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { userId: followingId } = UserFollowParamsSchema.parse(
      await context.params,
    );
    const followerId = session.user.id;

    await unfollowUser(followerId, followingId);
    return NextResponse.json({ message: 'Unfollowed successfully' }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid user ID', errors: error.issues },
        { status: 400 },
      );
    }
    console.error('Error unfollowing user:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
