import { getLikeStatus } from '~/src/services/like/likeService';
import { z } from 'zod';
import { apiHandler, apiSuccess } from '~/src/lib/api-handler';

const likeStatusQuerySchema = z
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
  querySchema: likeStatusQuerySchema,
  handler: async ({ query, session }) => {
    const { placeId, routeId } = query;
    const userId = session?.user?.id;

    if (!userId) {
      return apiSuccess({ liked: false });
    }

    const liked = await getLikeStatus(userId, { placeId, routeId });
    return apiSuccess({ liked });
  },
});
