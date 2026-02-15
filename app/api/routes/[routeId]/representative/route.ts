import { updateRouteIsRepresentative } from '~/src/services/route/routeService';
import { z } from 'zod';
import { apiHandler, apiSuccess } from '~/src/lib/api-handler';

const paramsSchema = z.object({
  routeId: z.string(),
});

const bodySchema = z.object({
  isRepresentative: z.boolean(),
});

export const PATCH = apiHandler({
  auth: true,
  bodySchema: bodySchema,
  handler: async ({ params, session, body }) => {
    const { routeId } = paramsSchema.parse(params);
    const { isRepresentative } = body;

    const updatedRoute = await updateRouteIsRepresentative(
      routeId,
      session!.user.id,
      isRepresentative,
    );
    return apiSuccess(updatedRoute);
  },
});
