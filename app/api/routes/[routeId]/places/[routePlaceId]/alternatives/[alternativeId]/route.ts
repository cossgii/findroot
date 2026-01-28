import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import {
  updateAlternative,
  deleteAlternative,
} from '~/src/services/route/alternativeService';
import { z } from 'zod';

const putBodySchema = z.object({
  explanation: z.string().min(1, 'Explanation cannot be empty.'),
});

export async function PUT(
  request: NextRequest,
  { params: awaitedParams }: { params: Promise<{ routeId: string; routePlaceId: string; alternativeId: string }> },
) {
  const params = await awaitedParams;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { explanation } = putBodySchema.parse(body);
    const { alternativeId } = params;
    const userId = session.user.id;

    const updatedAlternative = await updateAlternative({
      alternativeId,
      explanation,
      userId,
    });

    return NextResponse.json(updatedAlternative);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid request body' },
        { status: 400 },
      );
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    console.error('Error updating alternative:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params: awaitedParams }: { params: Promise<{ routeId: string; routePlaceId: string; alternativeId: string }> },
) {
  const params = await awaitedParams;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { alternativeId } = params;
    const userId = session.user.id;

    await deleteAlternative({ alternativeId, userId });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    console.error('Error deleting alternative:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
