import { getRoutesByCreatorId } from '~/src/services/route/routeService';
import { z } from 'zod';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';
import { apiHandler, apiSuccess } from '~/src/lib/api-handler';
import { ForbiddenError } from '~/src/utils/api-errors';

const districtIds = SEOUL_DISTRICTS.map((d) => d.id);

const UserRoutesParamsSchema = z.object({
  userId: z.string({ message: '유효한 사용자 ID가 필요합니다.' }),
});

const UserRoutesQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).default(5),
  districtId: z
    .string()
    .refine((val) => districtIds.includes(val) || val === 'all', {
      message: 'Invalid district ID',
    })
    .optional(),
});

export const GET = apiHandler({
  auth: true,
  querySchema: UserRoutesQuerySchema,
  handler: async ({ params, query, session }) => {
    const { userId: userIdFromParams } = UserRoutesParamsSchema.parse(params);
    const { page, limit, districtId } = query;

    const result = await getRoutesByCreatorId(
      userIdFromParams,
      page,
      limit,
      districtId,
    );
    return apiSuccess(result);
  },
});
