import { NextResponse } from 'next/server';
import { getPlaceLocationsByDistrict } from '~/src/services/place/placeService';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const district = searchParams.get('district');

  if (!district) {
    return NextResponse.json({ error: 'District query parameter is required' }, { status: 400 });
  }

  try {
    const locations = await getPlaceLocationsByDistrict(district);
    return NextResponse.json(locations);
  } catch (error) {
    console.error('Error fetching place locations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
