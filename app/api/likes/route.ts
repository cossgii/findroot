import {
  addLike,
  removeLike,
  getLikeInfo,
} from '~/src/services/like/likeService';
import { z } from 'zod';
import { apiHandler, apiSuccess } from '~/src/lib/api-handler';
import { db } from '~/lib/db';
import { sendPushNotification } from '~/lib/fcm';

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
    const userId = session!.user.id;
    await addLike(userId, body);
    const likeInfo = await getLikeInfo(body, userId);

    // 푸시 알림 (본인 콘텐츠 제외)
    if (body.placeId) {
      const place = await db.place.findUnique({ where: { id: body.placeId }, select: { creatorId: true, name: true } });
      if (place && place.creatorId !== userId) {
        sendPushNotification(place.creatorId, '새 좋아요', `${session!.user.name}님이 회원님의 장소를 좋아합니다.`);
      }
    } else if (body.routeId) {
      const route = await db.route.findUnique({ where: { id: body.routeId }, select: { creatorId: true, name: true } });
      if (route && route.creatorId !== userId) {
        sendPushNotification(route.creatorId, '새 좋아요', `${session!.user.name}님이 회원님의 루트를 좋아합니다.`);
      }
    }

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
