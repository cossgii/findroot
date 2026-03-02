import {
  getCommentsByRouteId,
  createComment,
} from '~/src/services/comment/commentService';
import { z } from 'zod';
import { apiHandler, apiSuccess } from '~/src/lib/api-handler';
import { db } from '~/lib/db';

const getCommentsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).default(10),
});

const paramsSchema = z.object({
  routeId: z.string(),
});

export const GET = apiHandler({
  querySchema: getCommentsQuerySchema,
  handler: async ({ params, query }) => {
    const { routeId } = paramsSchema.parse(params);
    const { page, limit } = query;
    const data = await getCommentsByRouteId({ routeId, page, limit });
    return apiSuccess(data);
  },
});

const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment content cannot be empty.'),
});

export const POST = apiHandler({
  auth: true,
  bodySchema: createCommentSchema,
  handler: async ({ params, session, body }) => {
    const { routeId } = paramsSchema.parse(params);
    const authorId = session!.user.id;
    const { content } = body;

    const newComment = await createComment({ routeId, authorId, content });

    const totalCommentsCount = await db.comment.count({
      where: { routeId },
    });

    return apiSuccess(
      {
        comment: newComment,
        commentsCount: totalCommentsCount,
      },
      201,
    );
  },
});
