import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import { createPlaceSchema } from '~/src/schemas/place-schema';
import {
  createPlace,
  getPlacesForFeed,
  DuplicatePlaceError,
} from '~/src/services/place/placeService';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const places = await getPlacesForFeed(userId);
    return NextResponse.json(places);
  } catch (error) {
    console.error('Error fetching places:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = createPlaceSchema.parse(body);

    const newPlace = await createPlace(validatedData, userId);

    return NextResponse.json(newPlace, { status: 201 });
  } catch (error) {
    if (error instanceof DuplicatePlaceError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json(
        { error: 'Invalid request body', details: (error as any).issues },
        { status: 400 },
      );
    }
    console.error('Error creating place:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 },
    );
  }
}
