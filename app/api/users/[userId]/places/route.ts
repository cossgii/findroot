import { getPlacesByCreatorId } from '~/src/services/place/placeService';
import { PlaceCategory } from '@prisma/client';
import { z } from 'zod';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';
import { apiHandler, apiSuccess } from '~/src/lib/api-handler';

const districtIds = SEOUL_DISTRICTS.map((d) => d.id);

const UserPlacesParamsSchema = z.object({
  userId: z.string({ message: '유효한 사용자 ID가 필요합니다.' }),
});

const UserPlacesQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).default(5),
  districtId: z
    .string()
    .refine((val) => districtIds.includes(val) || val === 'all', {
      message: 'Invalid district ID',
    })
    .optional(),
  category: z.nativeEnum(PlaceCategory).optional().nullable(),
});

export const GET = apiHandler({
  querySchema: UserPlacesQuerySchema,
  handler: async ({ params, query, session }) => {
    const { userId: creatorId } = UserPlacesParamsSchema.parse(params);
    const { page, limit, districtId, category } = query;
    const currentUserId = session?.user?.id;

    const paginatedData = await getPlacesByCreatorId(
      creatorId,
      page,
      limit,
      districtId,
      currentUserId,
      category,
    );
    return apiSuccess(paginatedData);
  },
});
