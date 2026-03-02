import {
  updateComment,
  deleteComment,
  deleteCommentWithRouteId,
} from '~/src/services/comment/commentService';
import { z } from 'zod';
import { apiHandler, apiSuccess } from '~/src/lib/api-handler';
import { db } from '~/lib/db';

const putBodySchema = z.object({
  content: z.string().min(1, 'Comment content cannot be empty.'),
});

const paramsSchema = z.object({
  commentId: z.string(),
});

export const PUT = apiHandler({
  auth: true,
  bodySchema: putBodySchema,
  handler: async ({ params, session, body }) => {
    const { commentId } = paramsSchema.parse(params);
    const { content } = body;
    const userId = session!.user.id;

    const updatedComment = await updateComment({ commentId, userId, content });

    return apiSuccess(updatedComment);
  },
});

export const DELETE = apiHandler({
  auth: true,
  handler: async ({ params, session }) => {
    const { commentId } = paramsSchema.parse(params);
    const userId = session!.user.id;

    const { routeId } = await deleteCommentWithRouteId({ commentId, userId });

    const totalCommentsCount = await db.comment.count({
      where: { routeId },
    });

    return apiSuccess(
      {
        deleted: true,
        commentsCount: totalCommentsCount,
      },
      200,
    );
  },
});
