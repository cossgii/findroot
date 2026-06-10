import { followUser, unfollowUser } from '~/src/services/user/followService';
import { z } from 'zod';
import { apiHandler, apiSuccess } from '~/src/lib/api-handler';
import { sendPushNotification } from '~/lib/fcm';

const UserFollowParamsSchema = z.object({
  userId: z.string({ message: '유효한 사용자 ID가 필요합니다.' }),
});

export const POST = apiHandler({
  auth: true,
  handler: async ({ params, session }) => {
    const { userId: followingId } = UserFollowParamsSchema.parse(params);
    const followerId = session!.user.id;

    const follow = await followUser(followerId, followingId);

    // 팔로우 받은 사람에게 알림
    sendPushNotification(followingId, '새 팔로워', `${session!.user.name}님이 팔로우하기 시작했습니다.`);

    return apiSuccess(follow, 201);
  },
});

export const DELETE = apiHandler({
  auth: true,
  handler: async ({ params, session }) => {
    const { userId: followingId } = UserFollowParamsSchema.parse(params);
    const followerId = session!.user.id;

    await unfollowUser(followerId, followingId);
    return apiSuccess({ message: '언팔로우 성공' });
  },
});
