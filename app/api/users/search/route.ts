import { NextResponse } from 'next/server';
import { db } from '~/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import { z } from 'zod';

const searchSchema = z.object({
  q: z.string().min(1, { message: '검색어를 입력해주세요.' }),
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  try {
    const validatedParams = searchSchema.parse(Object.fromEntries(searchParams));
    const { q } = validatedParams;

    const users = await db.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { loginId: { contains: q, mode: 'insensitive' } },
        ],
        NOT: {
          id: session.user.id, // 검색하는 사용자 자신은 결과에서 제외
        },
      },
      select: {
        id: true,
        name: true,
        image: true,
        loginId: true,
      },
      take: 10, // 최대 10개의 결과만 반환
    });

    return NextResponse.json(users);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.issues },
        { status: 400 },
      );
    }
    console.error('Error searching users:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
