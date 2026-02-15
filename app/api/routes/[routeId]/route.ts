import {
  deleteRoute,
  getRouteById,
  updateRoute,
} from '~/src/services/route/routeService';
import { UpdateRouteApiSchema } from '~/src/schemas/route-schema';
import { z } from 'zod';
import { apiHandler, apiSuccess } from '~/src/lib/api-handler';
import { NotFoundError } from '~/src/utils/api-errors';

const RouteParamsSchema = z.object({
  routeId: z.string({ message: '유효한 루트 ID가 필요합니다.' }),
});

export const GET = apiHandler({
  handler: async ({ params, session }) => {
    const { routeId } = RouteParamsSchema.parse(params);
    const userId = session?.user?.id;
    const route = await getRouteById(routeId, userId);

    if (!route) {
      throw new NotFoundError('루트를 찾을 수 없습니다.');
    }

    return apiSuccess(route);
  },
});

export const DELETE = apiHandler({
  auth: true,
  handler: async ({ params, session }) => {
    const { routeId } = RouteParamsSchema.parse(params);
    await deleteRoute(routeId, session!.user.id);
    return apiSuccess({ message: '루트가 성공적으로 삭제되었습니다.' });
  },
});

export const PUT = apiHandler({
  auth: true,
  bodySchema: UpdateRouteApiSchema,
  handler: async ({ params, session, body }) => {
    const { routeId } = RouteParamsSchema.parse(params);
    const updatedRoute = await updateRoute(routeId, session!.user.id, body);
    return apiSuccess(updatedRoute);
  },
});
