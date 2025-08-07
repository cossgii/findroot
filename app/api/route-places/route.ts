import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import { addPlaceToRoute } from '~/src/services/route/routeService';
import { z } from 'zod';

const addPlaceToRouteSchema = z.object({
  routeId: z.string().min(1, { message: '루트 ID를 입력해주세요.' }),
  placeId: z.string().min(1, { message: '장소 ID를 입력해주세요.' }),
  order: z.number().int().min(0, { message: '순서는 0 이상이어야 합니다.' }),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = addPlaceToRouteSchema.parse(body);

    const routePlace = await addPlaceToRoute(
      validatedData.routeId,
      validatedData.placeId,
      validatedData.order,
    );

    return NextResponse.json(routePlace, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid request body', errors: error.errors },
        { status: 400 },
      );
    }
    console.error('Error adding place to route:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
