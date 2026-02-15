import { getLikedPlacesByUserId } from '~/src/services/like/likeService';
import { PlaceCategory } from '@prisma/client';
import { z } from 'zod';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';
import { apiHandler, apiSuccess } from '~/src/lib/api-handler';

const districtIds = SEOUL_DISTRICTS.map((d) => d.id);
const likedPlacesQuerySchema = z.object({
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
  auth: true,
  querySchema: likedPlacesQuerySchema,
  handler: async ({ query, session }) => {
    const { page, limit, districtId, category } = query;
    const paginatedData = await getLikedPlacesByUserId(
      session!.user.id,
      page,
      limit,
      districtId,
      category,
    );
    return apiSuccess(paginatedData);
  },
});
