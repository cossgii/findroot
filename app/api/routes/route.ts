import { createRoute } from '~/src/services/route/routeService';
import { NewRouteApiSchema } from '~/src/schemas/route-schema';
import { apiHandler, apiSuccess } from '~/src/lib/api-handler';

export const POST = apiHandler({
  auth: true,
  bodySchema: NewRouteApiSchema,
  handler: async ({ body, session }) => {
    const newRoute = await createRoute(body, session!.user.id);
    return apiSuccess(newRoute, 201);
  },
});
