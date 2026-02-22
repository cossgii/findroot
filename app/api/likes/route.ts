import {
  addLike,
  removeLike,
  getLikeInfo,
} from '~/src/services/like/likeService';
import { z } from 'zod';
import { apiHandler, apiSuccess } from '~/src/lib/api-handler';

const likeSchema = z
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

export const POST = apiHandler({
  auth: true,
  bodySchema: likeSchema,
  handler: async ({ session, body }) => {
    await addLike(session!.user.id, body);
    const likeInfo = await getLikeInfo(body, session!.user.id);
    return apiSuccess(likeInfo, 201);
  },
});

export const DELETE = apiHandler({
  auth: true,
  querySchema: likeSchema,
  handler: async ({ session, query }) => {
    await removeLike(session!.user.id, query);

    const likeInfo = await getLikeInfo(query, session!.user.id);
    return apiSuccess(likeInfo);
  },
});
