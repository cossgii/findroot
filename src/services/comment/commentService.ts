import { db } from '~/lib/db';
import { Prisma } from '@prisma/client';
import { ForbiddenError, NotFoundError } from '~/src/utils/api-errors';

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

  const totalPages = Math.ceil(totalCount / limit);

  return {
    data: comments,
    totalCount,
    totalPages,
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
  const newComment = await db.comment.create({
    data: {
      routeId,
      authorId,
      content,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  return newComment;
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
    throw new NotFoundError('댓글을 찾을 수 없습니다.');
  }

  if (comment.authorId !== userId) {
    throw new ForbiddenError('이 댓글을 수정할 권한이 없습니다.');
  }

  return db.comment.update({
    where: { id: commentId },
    data: { content },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
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
    throw new NotFoundError('댓글을 찾을 수 없습니다.');
  }

  if (comment.authorId !== userId && comment.route.creatorId !== userId) {
    throw new ForbiddenError('이 댓글을 삭제할 권한이 없습니다.');
  }

  return db.comment.delete({
    where: { id: commentId },
  });
}

export async function deleteCommentWithRouteId({
  commentId,
  userId,
}: DeleteCommentProps) {
  const comment = await db.comment.findUnique({
    where: { id: commentId },
    include: {
      route: {
        select: {
          id: true,
          creatorId: true,
        },
      },
    },
  });

  if (!comment) {
    throw new NotFoundError('댓글을 찾을 수 없습니다.');
  }

  if (comment.authorId !== userId && comment.route.creatorId !== userId) {
    throw new ForbiddenError('이 댓글을 삭제할 권한이 없습니다.');
  }

  const routeId = comment.route.id;

  await db.comment.delete({
    where: { id: commentId },
  });

  return { routeId };
}
