import { z } from 'zod';
import { apiHandler, apiSuccess } from '~/src/lib/api-handler';
import {
  getAlternativesByRoutePlaceId,
  createAlternative,
} from '~/src/services/route/alternativeService';

const paramsSchema = z.object({
  routePlaceId: z.string().min(1),
});

const postBodySchema = z.object({
  placeId: z.string().min(1),
  explanation: z.string().min(1),
});

export const GET = apiHandler({
  handler: async ({ params }) => {
    const { routePlaceId } = paramsSchema.parse(params);
    const data = await getAlternativesByRoutePlaceId({ routePlaceId });
    return apiSuccess(data);
  },
});

export const POST = apiHandler({
  auth: true,
  bodySchema: postBodySchema,
  handler: async ({ params, session, body }) => {
    const { routePlaceId } = paramsSchema.parse(params);
    const newAlternative = await createAlternative({
      routePlaceId,
      placeId: body.placeId,
      explanation: body.explanation,
      userId: session!.user.id,
    });
    return apiSuccess(newAlternative, 201);
  },
});
