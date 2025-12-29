import { db } from '~/lib/db';
import { Prisma } from '@prisma/client';

interface GetCommentsProps {
  routeId: string;
  page?: number;
  limit?: number;
}

export async function getCommentsByRouteId({
  routeId,
  page = 1,
  limit = 10,
}: GetCommentsProps) {
  const where: Prisma.CommentWhereInput = { routeId };

  const [comments, totalCount] = await db.$transaction([
    db.comment.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.comment.count({ where }),
  ]);

  return {
    comments,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}

interface CreateCommentProps {
  routeId: string;
  authorId: string;
  content: string;
}

export async function createComment({
  routeId,
  authorId,
  content,
}: CreateCommentProps) {
  return db.comment.create({
    data: {
      routeId,
      authorId,
      content,
    },
  });
}

interface UpdateCommentProps {
  commentId: string;
  userId: string;
  content: string;
}

export async function updateComment({
  commentId,
  userId,
  content,
}: UpdateCommentProps) {
  const comment = await db.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw new Error('Comment not found');
  }

  if (comment.authorId !== userId) {
    throw new Error('Unauthorized');
  }

  return db.comment.update({
    where: { id: commentId },
    data: { content },
  });
}

interface DeleteCommentProps {
  commentId: string;
  userId: string;
}

export async function deleteComment({ commentId, userId }: DeleteCommentProps) {
  const comment = await db.comment.findUnique({
    where: { id: commentId },
    include: {
      route: {
        select: {
          creatorId: true,
        },
      },
    },
  });

  if (!comment) {
    throw new Error('Comment not found');
  }

  // Allow deletion if the user is the author of the comment OR the owner of the route
  if (comment.authorId !== userId && comment.route.creatorId !== userId) {
    throw new Error('Unauthorized');
  }

  return db.comment.delete({
    where: { id: commentId },
  });
}
