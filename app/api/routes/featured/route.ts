import { getFeaturedRoutes } from '~/src/services/route/routeService';
import { z } from 'zod';
import { RoutePurpose } from '@prisma/client';
import { apiHandler, apiSuccess } from '~/src/lib/api-handler';

const featuredRoutesQuerySchema = z.object({
  districtId: z.string().optional(),
  creatorId: z.string().optional(),
  purpose: z.nativeEnum(RoutePurpose).optional(),
});

export const GET = apiHandler({
  querySchema: featuredRoutesQuerySchema,
  handler: async ({ query, session }) => {
    const { districtId, creatorId, purpose } = query;
    const currentUserId = session?.user?.id || undefined;

    const result = await getFeaturedRoutes(
      districtId || '',
      creatorId,
      currentUserId,
      purpose,
    );
    return apiSuccess(result);
  },
});
