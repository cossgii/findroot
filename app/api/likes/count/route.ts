import {
  getPlaceLikesCount,
  getRouteLikesCount,
} from '~/src/services/like/likeService';
import { z } from 'zod';
import { apiHandler, apiSuccess } from '~/src/lib/api-handler';

const likeCountQuerySchema = z
  .object({
    placeId: z.string().optional(),
    routeId: z.string().optional(),
  })
  .refine((data) => data.placeId || data.routeId, {
    message: 'placeId or routeId is required',
  })
  .refine((data) => !(data.placeId && data.routeId), {
    message: 'Only one of placeId or routeId can be provided',
  });

export const GET = apiHandler({
  querySchema: likeCountQuerySchema,
  handler: async ({ query }) => {
    const { placeId, routeId } = query;
    let count = 0;

    if (placeId) {
      count = await getPlaceLikesCount(placeId);
    } else if (routeId) {
      count = await getRouteLikesCount(routeId);
    }

    return apiSuccess({ count });
  },
});
