import { getPlacesByDistrict } from '~/src/services/place/placeService';
import { PlaceCategory } from '@prisma/client';
import { z } from 'zod';
import { apiHandler, apiSuccess } from '~/src/lib/api-handler';

const placesQuerySchema = z.object({
  districtName: z.string().min(1, { message: 'districtName is required' }),
  targetUserId: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).default(12),
  sort: z.enum(['recent', 'likes']).default('recent'),
  category: z.nativeEnum(PlaceCategory).optional(),
});

export const GET = apiHandler({
  querySchema: placesQuerySchema,
  handler: async ({ query, session }) => {
    const currentUserId = session?.user?.id;
    const { districtName, targetUserId, page, limit, sort, category } = query;

    const data = await getPlacesByDistrict(
      districtName,
      currentUserId,
      page,
      limit,
      sort,
      category,
      targetUserId,
    );
    return apiSuccess(data);
  },
});
