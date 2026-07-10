import { getUserById } from '~/src/services/user/userService';
import { apiHandler, apiSuccess, apiError } from '~/src/lib/api-handler';

export const GET = apiHandler({
  optionalAuth: true,
  handler: async ({ params }) => {
    const { userId } = await params;
    const user = await getUserById(userId as string);
    if (!user) {
      return apiError('사용자를 찾을 수 없습니다.', 404);
    }
    return apiSuccess(user);
  },
});
