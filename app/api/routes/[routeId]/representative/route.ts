import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import { updateRouteIsRepresentative } from '~/src/services/route/routeService';

export async function PATCH(
  request: Request,
  { params }: { params: { routeId: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { routeId } = params;
  const { isRepresentative } = await request.json();

  if (typeof isRepresentative !== 'boolean') {
    return NextResponse.json(
      { message: 'Invalid request body: isRepresentative must be a boolean' },
      { status: 400 },
    );
  }

  try {
    const updatedRoute = await updateRouteIsRepresentative(
      routeId,
      session.user.id,
      isRepresentative,
    );
    return NextResponse.json(updatedRoute, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Route not found.') {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    if (error.message === 'Unauthorized to update this route.') {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }
    console.error('Error updating route isRepresentative status:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
