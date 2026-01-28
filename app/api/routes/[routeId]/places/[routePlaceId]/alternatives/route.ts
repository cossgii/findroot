import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import {
  getAlternativesByRoutePlaceId,
  createAlternative,
} from '~/src/services/route/alternativeService';
import { z } from 'zod';

export async function GET(
  request: NextRequest,
  { params: awaitedParams }: { params: Promise<{ routeId: string; routePlaceId: string }> },
) {
  try {
    const params = await awaitedParams;
    const { routePlaceId } = params;
    const data = await getAlternativesByRoutePlaceId({ routePlaceId });
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid query parameters' }, { status: 400 });
    }
    console.error('Error fetching alternatives:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

const postBodySchema = z.object({
  placeId: z.string().min(1),
  explanation: z.string().min(1),
});

export async function POST(
  request: NextRequest,
  { params: awaitedParams }: { params: Promise<{ routeId: string; routePlaceId: string }> },
) {
  const params = await awaitedParams;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { placeId, explanation } = postBodySchema.parse(body);
    const { routePlaceId } = params;
    const userId = session.user.id;

    const newAlternative = await createAlternative({
      routePlaceId,
      placeId,
      explanation,
      userId,
    });

    return NextResponse.json(newAlternative, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }
    if (error instanceof Error) {
        if (error.message.includes('Maximum of 3 alternatives')) {
            return NextResponse.json({ message: error.message }, { status: 400 });
        }
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }
    }
    console.error('Error creating alternative:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
