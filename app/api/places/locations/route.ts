import { getPlaceLocationsByDistrict } from '~/src/services/place/placeService';
import { z } from 'zod';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';
import { apiHandler, apiSuccess } from '~/src/lib/api-handler';

const districtNames = SEOUL_DISTRICTS.map((d) => d.name);
const locationQuerySchema = z.object({
  district: z
    .string()
    .refine((val) => districtNames.includes(val) || val === '전체', {
      message: 'Invalid district name',
    }),
  targetUserId: z.string().optional(),
});

export const GET = apiHandler({
  querySchema: locationQuerySchema,
  handler: async ({ query, session }) => {
    const currentUserId = session?.user?.id;
    const { district, targetUserId } = query;

    const locations = await getPlaceLocationsByDistrict(
      district,
      currentUserId,
      targetUserId,
    );
    return apiSuccess(locations);
  },
});
