import { db } from '~/lib/db';
import { apiHandler, apiSuccess } from '~/src/lib/api-handler';
import { z } from 'zod';

const getFollowingQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(8),
});

export const GET = apiHandler({
  auth: true,
  querySchema: getFollowingQuerySchema,
  handler: async ({ session, query }) => {
    const { cursor, limit } = query;
    const userId = session!.user.id;

    const followingRelations = await db.follow.findMany({
      where: {
        followerId: userId,
      },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor
        ? {
            followerId_followingId: {
              followerId: userId,
              followingId: cursor,
            },
          }
        : undefined,
      include: {
        following: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        followerId: 'asc',
        followingId: 'asc',
      },
    });

    const followingUsers = followingRelations
      .map((relation) => relation.following)
      .filter(
        (user): user is { id: string; name: string; image: string | null } =>
          user != null,
      );

    let nextCursor: string | undefined = undefined;
    if (followingRelations.length === limit) {
      nextCursor =
        followingRelations[followingRelations.length - 1].followingId;
    }

    return apiSuccess({
      data: followingUsers,
      nextCursor,
    });
  },
});
