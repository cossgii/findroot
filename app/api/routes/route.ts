import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import { createRoute } from '~/src/services/route/routeService';
import { z } from 'zod';

const createRouteSchema = z.object({
  name: z.string().min(1, { message: '루트 이름을 입력해주세요.' }),
  description: z.string().optional(),
  districtId: z.string().min(1, { message: '자치구 ID를 입력해주세요.' }),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = createRouteSchema.parse(body);

    const newRoute = await createRoute(validatedData, session.user.id);

    return NextResponse.json(newRoute, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid request body', errors: error.errors },
        { status: 400 },
      );
    }
    console.error('Error creating route:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
