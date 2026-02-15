import { db } from '~/lib/db';
import { z } from 'zod';
import { apiHandler, apiSuccess } from '~/src/lib/api-handler';

const searchSchema = z.object({
  q: z.string().min(1, { message: '검색어를 입력해주세요.' }),
});

export const GET = apiHandler({
  auth: true,
  querySchema: searchSchema,
  handler: async ({ query, session }) => {
    const { q } = query;

    const users = await db.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { loginId: { contains: q, mode: 'insensitive' } },
        ],
        NOT: {
          id: session!.user.id, // 검색하는 사용자 자신은 결과에서 제외
        },
      },
      select: {
        id: true,
        name: true,
        image: true,
        loginId: true,
      },
      take: 10, // 최대 10개의 결과만 반환
    });

    return apiSuccess(users);
  },
});
