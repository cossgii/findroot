import { NextResponse } from 'next/server';
import { getPlacesByDistrict } from '~/src/services/place/placeService';
import { PlaceCategory } from '~/src/types/shared';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const districtName = searchParams.get('districtName');
  const userId = searchParams.get('userId') || undefined;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '12', 10);
  const sort = (searchParams.get('sort') as 'recent' | 'likes') || 'recent';
  const category = searchParams.get('category') as PlaceCategory | undefined;

  if (!districtName) {
    return NextResponse.json(
      { message: 'districtName is required' },
      { status: 400 },
    );
  }

  try {
    const data = await getPlacesByDistrict(
      districtName,
      userId,
      page,
      limit,
      sort,
      category,
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching places by district:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
