import { z } from 'zod';
import { apiHandler, apiSuccess } from '~/src/lib/api-handler';
import {
  updateAlternative,
  deleteAlternative,
} from '~/src/services/route/alternativeService';

const paramsSchema = z.object({
  alternativeId: z.string().min(1),
});

const putBodySchema = z.object({
  explanation: z.string().min(1, 'Explanation cannot be empty.'),
});

export const PUT = apiHandler({
  auth: true,
  bodySchema: putBodySchema,
  handler: async ({ params, session, body }) => {
    const { alternativeId } = paramsSchema.parse(params);
    const updated = await updateAlternative({
      alternativeId,
      explanation: body.explanation,
      userId: session!.user.id,
    });
    return apiSuccess(updated);
  },
});

export const DELETE = apiHandler({
  auth: true,
  handler: async ({ params, session }) => {
    const { alternativeId } = paramsSchema.parse(params);
    await deleteAlternative({ alternativeId, userId: session!.user.id });
    return apiSuccess(null, 204);
  },
});
