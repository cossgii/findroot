import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth'; // Add this import
import { authOptions } from '~/src/services/auth/authOptions'; // Add this import
import { getPlaceLocationsByDistrict } from '~/src/services/place/placeService';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions); // Get session
  const currentUserId = session?.user?.id; // Get currentUserId

  const { searchParams } = new URL(request.url);
  const district = searchParams.get('district');

  if (!district) {
    return NextResponse.json({ error: 'District query parameter is required' }, { status: 400 });
  }

  try {
    const locations = await getPlaceLocationsByDistrict(district, currentUserId); // Pass currentUserId
    return NextResponse.json(locations);
  } catch (error) {
    console.error('Error fetching place locations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
