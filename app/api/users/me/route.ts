import { updateUser } from '~/src/services/user/userService';
import { z } from 'zod';
import { apiHandler, apiSuccess } from '~/src/lib/api-handler';

const updateUserBodySchema = z.object({
  name: z.string().min(1, { message: '이름을 입력해주세요.' }).optional(),
  image: z
    .string()
    .url({ message: '유효한 이미지 URL을 입력해주세요.' })
    .optional()
    .nullable(),
});

export const GET = apiHandler({
  auth: true,
  handler: async ({ session }) => {
    return apiSuccess(session!.user);
  },
});

export const PUT = apiHandler({
  auth: true,
  bodySchema: updateUserBodySchema,
  handler: async ({ session, body }) => {
    const updatedUser = await updateUser(session!.user.id, body);
    return apiSuccess(updatedUser);
  },
});
