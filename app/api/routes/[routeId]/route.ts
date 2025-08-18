import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import { deleteRoute, getRouteById, updateRoute, UpdateRouteApiSchema } from '~/src/services/route/routeService';
import { z } from 'zod';
import { RouteStopLabel } from '@prisma/client';

// Define the expected type for params
interface RouteRouteParams {
  routeId: string;
}

export async function GET(
  request: Request,
  context: { params: RouteRouteParams },
) {
  try {
    const routeId = context.params.routeId;
    const route = await getRouteById(routeId);

    if (!route) {
      return NextResponse.json({ error: 'Route not found' }, { status: 404 });
    }

    return NextResponse.json(route);
  } catch (error) {
    console.error('Error fetching route by ID:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: RouteRouteParams },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const routeId = context.params.routeId;
    await deleteRoute(routeId, session.user.id);
    return NextResponse.json({ message: 'Route deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting route:', error);
    if (error instanceof Error) {
      if (error.message === 'Route not found.') {
        return NextResponse.json({ message: error.message }, { status: 404 });
      } else if (error.message === 'Unauthorized to delete this route.') {
        return NextResponse.json({ message: error.message }, { status: 403 });
      }
    }
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: RouteRouteParams },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const routeId = context.params.routeId;
    const body = await request.json();
    const validatedData = UpdateRouteApiSchema.parse(body);

    const updatedRoute = await updateRoute(routeId, session.user.id, validatedData);
    return NextResponse.json(updatedRoute, { status: 200 });
  } catch (error) {
    console.error('Error updating route:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid request body', errors: error.issues },
        { status: 400 },
      );
    } else if (error instanceof Error) {
      if (error.message === 'Route not found.') {
        return NextResponse.json({ message: error.message }, { status: 404 });
      } else if (error.message === 'Unauthorized to update this route.') {
        return NextResponse.json({ message: error.message }, { status: 403 });
      }
    }
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}