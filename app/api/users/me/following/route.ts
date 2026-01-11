import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import { db } from '~/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const followingRelations = await db.follow.findMany({
      where: {
        followerId: session.user.id,
      },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        following: {
          name: 'asc',
        },
      },
    });

    const followingUsers = followingRelations.map((f) => f.following);

    return NextResponse.json(followingUsers);
  } catch (error) {
    console.error('Error fetching following list:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
