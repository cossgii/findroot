import { z } from 'zod';
import { apiHandler, apiSuccess } from '~/src/lib/api-handler';
import { getFollowStatus } from '~/src/services/user/followService';

const paramsSchema = z.object({
  userId: z.string({ message: '유효한 사용자 ID가 필요합니다.' }),
});

export const GET = apiHandler({
  optionalAuth: true,
  handler: async ({ params, session }) => {
    if (!session?.user?.id) {
      return apiSuccess({ isFollowing: false });
    }
    const { userId: followingId } = paramsSchema.parse(params);
    const isFollowing = await getFollowStatus(session.user.id, followingId);
    return apiSuccess({ isFollowing });
  },
});
