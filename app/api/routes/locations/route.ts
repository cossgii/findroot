import { getAllPublicRoutes } from '~/src/services/route/routeService';
import { z } from 'zod';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';
import { RoutePurpose } from '@prisma/client';
import { apiHandler, apiSuccess } from '~/src/lib/api-handler';

const districtIds = SEOUL_DISTRICTS.map((d) => d.id);
const routeLocationQuerySchema = z.object({
  districtId: z
    .string()
    .refine((val) => districtIds.includes(val) || val === 'all', {
      message: 'Invalid district ID',
    })
    .optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).default(5),
  purpose: z.nativeEnum(RoutePurpose).optional(),
  targetUserId: z.string().optional(),
});

export const GET = apiHandler({
  querySchema: routeLocationQuerySchema,
  handler: async ({ query, session }) => {
    const currentUserId = session?.user?.id;
    const { districtId, page, limit, purpose, targetUserId } = query;

    const paginatedData = await getAllPublicRoutes(
      districtId,
      currentUserId,
      page,
      limit,
      purpose,
      targetUserId,
      undefined,
    );
    return apiSuccess(paginatedData);
  },
});
