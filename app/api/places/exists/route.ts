import { checkPlaceExists } from '~/src/services/place/placeService';
import { z } from 'zod';
import { apiHandler, apiSuccess } from '~/src/lib/api-handler';

const querySchema = z.object({
  address: z.string().min(1, 'Address parameter is required'),
});

export const GET = apiHandler({
  auth: true,
  querySchema: querySchema,
  handler: async ({ query, session }) => {
    const { address } = query;
    const userId = session!.user.id;

    const exists = await checkPlaceExists(address, userId);
    return apiSuccess({ exists });
  },
});
