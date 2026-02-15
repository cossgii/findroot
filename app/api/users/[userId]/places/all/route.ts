import { getAllPlacesByCreatorId } from '~/src/services/place/placeService';
import { z } from 'zod';
import { apiHandler, apiSuccess } from '~/src/lib/api-handler';
import { ForbiddenError } from '~/src/utils/api-errors';

const UserPlacesAllParamsSchema = z.object({
  userId: z.string({ message: '유효한 사용자 ID가 필요합니다.' }),
});

export const GET = apiHandler({
  auth: true,
  handler: async ({ params, session }) => {
    const { userId } = UserPlacesAllParamsSchema.parse(params);

    if (session!.user.id !== userId) {
      throw new ForbiddenError('이 사용자의 장소를 조회할 권한이 없습니다.');
    }

    const places = await getAllPlacesByCreatorId(userId);
    return apiSuccess(places);
  },
});
