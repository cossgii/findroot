import {
  getPlacesByDistrict,
  createPlace,
} from '~/src/services/place/placeService';
import { PlaceCategory } from '@prisma/client';
import { createPlaceSchema } from '~/src/schemas/place-schema';
import { apiHandler, apiSuccess } from '~/src/lib/api-handler';
import { z } from 'zod';

const getPlacesQuerySchema = z.object({
  district: z.string().default('전체'),
  sort: z.enum(['recent', 'likes']).default('recent'),
  page: z.coerce.number().default(1),
  category: z.nativeEnum(PlaceCategory).optional(),
});

export const GET = apiHandler({
  querySchema: getPlacesQuerySchema,
  handler: async ({ query, session }) => {
    const userId = session?.user?.id;
    const { district, sort, page, category } = query;

    const result = await getPlacesByDistrict(
      district,
      userId,
      page,
      12, // limit
      sort,
      category,
    );
    return apiSuccess(result);
  },
});

export const POST = apiHandler({
  auth: true,
  bodySchema: createPlaceSchema,
  handler: async ({ body, session }) => {
    const newPlace = await createPlace(body, session!.user.id);
    return apiSuccess(newPlace, 201);
  },
});
