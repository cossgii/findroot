import { NextResponse } from 'next/server';
import { getPlaceById } from '~/src/services/place/placeService';

// Define the expected type for params
interface PlaceRouteParams {
  placeId: string;
}

export async function GET(
  request: Request,
  context: { params: PlaceRouteParams }, // Use the defined interface
) {
  try {
    const placeId = context.params.placeId; // Access params from context
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
