import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import {
  deletePlace,
  getPlaceById,
  updatePlace,
} from '~/src/services/place/placeService';
import { z } from 'zod';
import { PlaceCategory } from '~/src/types/shared';

const PlaceRouteParamsSchema = z.object({
  placeId: z.string({ message: '유효한 장소 ID가 필요합니다.' }),
});

interface PlaceRouteParams {
  placeId: string;
}
const updatePlaceSchema = z.object({
  name: z.string().min(1, { message: '이름을 입력해주세요.' }).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional(),
  district: z.string().optional(),
  description: z.string().optional(),
  link: z
    .string()
    .optional()
    .nullable()
    .transform((e) => (e === '' ? null : e)), // Add link field, transform empty string to null
  category: z.nativeEnum(PlaceCategory).optional(),
});

export async function GET(
  request: Request,
  context: { params: Promise<PlaceRouteParams> },
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const { placeId } = PlaceRouteParamsSchema.parse(await context.params); // Validate placeId
    const place = await getPlaceById(placeId, userId);

    if (!place) {
      return NextResponse.json({ error: 'Place not found' }, { status: 404 });
    }

    return NextResponse.json(place);
  } catch (error) {
    console.error('Error fetching place by ID:', error);
    if (error instanceof z.ZodError) { // Handle Zod errors for params
      return NextResponse.json(
        { message: 'Invalid place ID', errors: error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<PlaceRouteParams> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { placeId } = PlaceRouteParamsSchema.parse(await context.params); // Validate placeId
    await deletePlace(placeId, session.user.id);
    return NextResponse.json(
      { message: 'Place deleted successfully' },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error deleting place:', error);
    if (error instanceof z.ZodError) { // Handle Zod errors for params
      return NextResponse.json(
        { message: 'Invalid place ID', errors: error.issues },
        { status: 400 },
      );
    }
    else if (error instanceof Error) {
      if (error.message === 'Place not found.') {
        return NextResponse.json({ message: error.message }, { status: 404 });
      } else if (error.message === 'Unauthorized to delete this place.') {
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
  context: { params: Promise<PlaceRouteParams> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { placeId } = PlaceRouteParamsSchema.parse(await context.params); // Validate placeId
    const body = await request.json();
    const validatedData = updatePlaceSchema.parse(body);

    const updatedPlace = await updatePlace(
      placeId,
      session.user.id,
      validatedData,
    );
    return NextResponse.json(updatedPlace, { status: 200 });
  } catch (error) {
    console.error('Error updating place:', error);
    if (error instanceof z.ZodError) {
      // Check if it's a ZodError from body validation or param validation
      const isParamError = error.issues.some(issue => issue.path[0] === 'placeId');
      return NextResponse.json(
        { message: isParamError ? 'Invalid place ID' : 'Invalid request body', errors: error.issues },
        { status: 400 },
      );
    }
    else if (error instanceof Error) {
      if (error.message === 'Place not found.') {
        return NextResponse.json({ message: error.message }, { status: 404 });
      } else if (error.message === 'Unauthorized to update this place.') {
        return NextResponse.json({ message: error.message }, { status: 403 });
      }
    }
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
