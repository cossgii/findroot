import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import { getPlaceLocationsByDistrict } from '~/src/services/place/placeService';
import { z } from 'zod';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';

const districtNames = SEOUL_DISTRICTS.map((d) => d.name);
const locationQuerySchema = z.object({
  district: z
    .string()
    .refine((val) => districtNames.includes(val) || val === '전체', {
      message: 'Invalid district name',
    }),
  targetUserId: z.string().optional(),
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

  const { searchParams } = new URL(request.url);

  try {
    const validatedParams = locationQuerySchema.parse(
      Object.fromEntries(searchParams),
    );
    const { district, targetUserId } = validatedParams;

    const locations = await getPlaceLocationsByDistrict(
      district,
      currentUserId,
      targetUserId,
    );
    return NextResponse.json(locations);
  } catch (error) {
    console.error('Error fetching place locations:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
