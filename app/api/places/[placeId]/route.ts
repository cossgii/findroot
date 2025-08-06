import { NextResponse } from 'next/server';
import { getPlaceById } from '~/src/services/place/placeService';

export async function GET(
  request: Request,
  { params }: { params: { placeId: string } },
) {
  try {
    const placeId = params.placeId;
    const place = await getPlaceById(placeId);

    if (!place) {
      return NextResponse.json({ error: 'Place not found' }, { status: 404 });
    }

    return NextResponse.json(place);
  } catch (error) {
    console.error('Error fetching place by ID:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 },
    );
  }
}
