import { getLikedRoutesByUserId } from '~/src/services/like/likeService';
import { z } from 'zod';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';
import { apiHandler, apiSuccess } from '~/src/lib/api-handler';

const districtIds = SEOUL_DISTRICTS.map(d => d.id);
const likedRoutesQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).default(5),
  districtId: z.string().refine(val => districtIds.includes(val) || val === 'all', { message: 'Invalid district ID' }).optional(),
});

export const GET = apiHandler({
  auth: true,
  querySchema: likedRoutesQuerySchema,
  handler: async ({ query, session }) => {
    const { page, limit, districtId } = query;
    const paginatedData = await getLikedRoutesByUserId(
      session!.user.id,
      page,
      limit,
      districtId,
    );
    return apiSuccess(paginatedData);
  },
});
