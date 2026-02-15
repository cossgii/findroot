import {
  deletePlace,
  getPlaceById,
  updatePlace,
} from '~/src/services/place/placeService';
import { z } from 'zod';
import { PlaceCategory } from '@prisma/client';
import { apiHandler, apiSuccess } from '~/src/lib/api-handler';
import { NotFoundError } from '~/src/utils/api-errors';

const paramsSchema = z.object({
  placeId: z.string(),
});

const updatePlaceBodySchema = z.object({
  name: z.string().min(1, { message: '이름을 입력해주세요.' }).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional(),
  district: z.string().optional(),
  description: z.string().optional(),
  link: z.string().url().optional().nullable(),
  category: z.nativeEnum(PlaceCategory).optional(),
});

export const GET = apiHandler({
  handler: async ({ params, session }) => {
    const { placeId } = paramsSchema.parse(params);
    const userId = session?.user?.id;
    const place = await getPlaceById(placeId, userId);

    if (!place) {
      throw new NotFoundError('Place not found');
    }
    return apiSuccess(place);
  },
});

export const DELETE = apiHandler({
  auth: true,
  handler: async ({ params, session }) => {
    const { placeId } = paramsSchema.parse(params);
    await deletePlace(placeId, session!.user.id);
    return apiSuccess({ message: 'Place deleted successfully' });
  },
});

export const PUT = apiHandler({
  auth: true,
  bodySchema: updatePlaceBodySchema,
  handler: async ({ params, session, body }) => {
    const { placeId } = paramsSchema.parse(params);
    const updatedPlace = await updatePlace(placeId, session!.user.id, body);
    return apiSuccess(updatedPlace);
  },
});
