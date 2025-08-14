import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import { createRoute } from '~/src/services/route/routeService';
import { createRouteSchema } from '~/src/services/route/route-schema';
import { z } from 'zod';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    // Validate the body against the new schema
    const validatedData = createRouteSchema.parse(body);

    // Call the new createRoute service function
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
