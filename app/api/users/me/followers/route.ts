import { db } from '~/lib/db';
import { apiHandler, apiSuccess } from '~/src/lib/api-handler';
import { z } from 'zod';

const getFollowersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export const GET = apiHandler({
  auth: true,
  querySchema: getFollowersQuerySchema,
  handler: async ({ session, query }) => {
    const { page, limit } = query;
    const userId = session!.user.id;

    const skip = (page - 1) * limit;

    const [followerRelations, totalCount] = await db.$transaction([
      db.follow.findMany({
        where: {
          followingId: userId,
        },
        include: {
          follower: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          follower: {
            name: 'asc',
          },
        },
        skip,
        take: limit,
      }),
      db.follow.count({
        where: {
          followingId: userId,
        },
      }),
    ]);

    const followers = followerRelations.map((f) => f.follower);
    const totalPages = Math.ceil(totalCount / limit);

    return apiSuccess({
      data: followers,
      totalCount,
      totalPages,
      currentPage: page,
    });
  },
});
