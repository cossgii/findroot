import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import { db } from '~/lib/db';
import { MAIN_ACCOUNT_ID } from '~/config';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.id !== MAIN_ACCOUNT_ID) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const messages = await db.message.findMany({
      where: {
        receiverId: MAIN_ACCOUNT_ID,
      },
      include: {
        sender: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching admin messages:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
