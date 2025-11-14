import { NextRequest, NextResponse } from 'next/server';
import {
  getPlacesByDistrict,
  createPlace,
} from '~/src/services/place/placeService';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '~/src/services/auth/authOptions';
import { PlaceCategory } from '~/src/types/shared';
import { createPlaceSchema } from '~/src/schemas/place-schema';

// 문자열이 PlaceCategory enum의 유효한 값인지 확인하는 타입 가드 함수
function isPlaceCategory(value: string): value is PlaceCategory {
  return Object.values(PlaceCategory).includes(value as PlaceCategory);
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const { searchParams } = new URL(request.url);
  const district = searchParams.get('district') || '전체';
  const sort = (searchParams.get('sort') as 'recent' | 'likes') || 'recent';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const categoryParam = searchParams.get('category');
  let category: PlaceCategory | undefined = undefined;

  if (categoryParam && isPlaceCategory(categoryParam)) {
    category = categoryParam;
  }

  try {
    const result = await getPlacesByDistrict(
      district,
      userId,
      page,
      12,
      sort,
      category
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching places:', error);
    return NextResponse.json(
      { error: 'Failed to fetch places' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const validationResult = createPlaceSchema.safeParse(body);

  if (!validationResult.success) {
    return NextResponse.json(
      { error: validationResult.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const newPlace = await createPlace(validationResult.data, userId);
    return NextResponse.json(newPlace, { status: 201 });
  } catch (error) {
    console.error('Error creating place:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
