/**
 * @jest-environment node
 */

import { db } from '~/lib/db';
import {
  getCommentsByRouteId,
  createComment,
  updateComment,
  deleteComment,
  deleteCommentWithRouteId,
} from '~/src/services/comment/commentService';
import { NotFoundError, ForbiddenError } from '~/src/utils/api-errors';

jest.mock('~/lib/db', () => ({
  db: {
    comment: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

const mockedDb = db as jest.Mocked<typeof db>;

const mockAuthor = { id: 'author-1', name: '작성자', image: null };

const mockComment = {
  id: 'comment-1',
  routeId: 'route-1',
  authorId: 'author-1',
  content: '좋은 루트네요!',
  createdAt: new Date(),
  updatedAt: new Date(),
  author: mockAuthor,
};

describe('commentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // getCommentsByRouteId
  // ============================================
  describe('getCommentsByRouteId', () => {
    it('루트의 댓글 목록을 페이지네이션으로 반환한다', async () => {
      (mockedDb.$transaction as jest.Mock).mockResolvedValue([
        [mockComment],
        1,
      ]);

      const result = await getCommentsByRouteId({ routeId: 'route-1' });

      expect(result.data).toHaveLength(1);
      expect(result.totalCount).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(result.currentPage).toBe(1);
    });

    it('댓글이 없으면 빈 배열을 반환한다', async () => {
      (mockedDb.$transaction as jest.Mock).mockResolvedValue([[], 0]);

      const result = await getCommentsByRouteId({ routeId: 'route-1' });

      expect(result.data).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it('totalPages를 올바르게 계산한다', async () => {
      (mockedDb.$transaction as jest.Mock).mockResolvedValue([
        [mockComment],
        25,
      ]);

      const result = await getCommentsByRouteId({
        routeId: 'route-1',
        page: 1,
        limit: 10,
      });

      expect(result.totalPages).toBe(3);
    });
  });

  // ============================================
  // createComment
  // ============================================
  describe('createComment', () => {
    it('댓글을 성공적으로 생성한다', async () => {
      (mockedDb.comment.create as jest.Mock).mockResolvedValue(mockComment);

      const result = await createComment({
        routeId: 'route-1',
        authorId: 'author-1',
        content: '좋은 루트네요!',
      });

      expect(result).toEqual(mockComment);
      expect(mockedDb.comment.create).toHaveBeenCalledWith({
        data: { routeId: 'route-1', authorId: 'author-1', content: '좋은 루트네요!' },
        include: { author: { select: { id: true, name: true, image: true } } },
      });
    });
  });

  // ============================================
  // updateComment
  // ============================================
  describe('updateComment', () => {
    it('작성자가 댓글을 수정할 수 있다', async () => {
      const updatedComment = { ...mockComment, content: '수정된 내용' };
      (mockedDb.comment.findUnique as jest.Mock).mockResolvedValue(mockComment);
      (mockedDb.comment.update as jest.Mock).mockResolvedValue(updatedComment);

      const result = await updateComment({
        commentId: 'comment-1',
        userId: 'author-1',
        content: '수정된 내용',
      });

      expect(result.content).toBe('수정된 내용');
    });

    it('존재하지 않는 댓글 수정 시 NotFoundError를 던진다', async () => {
      (mockedDb.comment.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        updateComment({ commentId: 'nonexistent', userId: 'author-1', content: '내용' }),
      ).rejects.toThrow(NotFoundError);
    });

    it('작성자가 아닌 사용자가 수정 시 ForbiddenError를 던진다', async () => {
      (mockedDb.comment.findUnique as jest.Mock).mockResolvedValue(mockComment);

      await expect(
        updateComment({ commentId: 'comment-1', userId: 'other-user', content: '내용' }),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  // ============================================
  // deleteComment
  // ============================================
  describe('deleteComment', () => {
    const mockCommentWithRoute = {
      ...mockComment,
      route: { creatorId: 'route-creator-1' },
    };

    it('작성자가 댓글을 삭제할 수 있다', async () => {
      (mockedDb.comment.findUnique as jest.Mock).mockResolvedValue(mockCommentWithRoute);
      (mockedDb.comment.delete as jest.Mock).mockResolvedValue(mockComment);

      await deleteComment({ commentId: 'comment-1', userId: 'author-1' });

      expect(mockedDb.comment.delete).toHaveBeenCalledWith({
        where: { id: 'comment-1' },
      });
    });

    it('루트 작성자도 댓글을 삭제할 수 있다', async () => {
      (mockedDb.comment.findUnique as jest.Mock).mockResolvedValue(mockCommentWithRoute);
      (mockedDb.comment.delete as jest.Mock).mockResolvedValue(mockComment);

      await deleteComment({ commentId: 'comment-1', userId: 'route-creator-1' });

      expect(mockedDb.comment.delete).toHaveBeenCalled();
    });

    it('존재하지 않는 댓글 삭제 시 NotFoundError를 던진다', async () => {
      (mockedDb.comment.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        deleteComment({ commentId: 'nonexistent', userId: 'author-1' }),
      ).rejects.toThrow(NotFoundError);
    });

    it('권한 없는 사용자가 삭제 시 ForbiddenError를 던진다', async () => {
      (mockedDb.comment.findUnique as jest.Mock).mockResolvedValue(mockCommentWithRoute);

      await expect(
        deleteComment({ commentId: 'comment-1', userId: 'other-user' }),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  // ============================================
  // deleteCommentWithRouteId
  // ============================================
  describe('deleteCommentWithRouteId', () => {
    const mockCommentWithRouteId = {
      ...mockComment,
      route: { id: 'route-1', creatorId: 'route-creator-1' },
    };

    it('댓글 삭제 후 routeId를 반환한다', async () => {
      (mockedDb.comment.findUnique as jest.Mock).mockResolvedValue(mockCommentWithRouteId);
      (mockedDb.comment.delete as jest.Mock).mockResolvedValue(mockComment);

      const result = await deleteCommentWithRouteId({
        commentId: 'comment-1',
        userId: 'author-1',
      });

      expect(result).toEqual({ routeId: 'route-1' });
    });

    it('존재하지 않는 댓글 삭제 시 NotFoundError를 던진다', async () => {
      (mockedDb.comment.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        deleteCommentWithRouteId({ commentId: 'nonexistent', userId: 'author-1' }),
      ).rejects.toThrow(NotFoundError);
    });

    it('권한 없는 사용자가 삭제 시 ForbiddenError를 던진다', async () => {
      (mockedDb.comment.findUnique as jest.Mock).mockResolvedValue(mockCommentWithRouteId);

      await expect(
        deleteCommentWithRouteId({ commentId: 'comment-1', userId: 'other-user' }),
      ).rejects.toThrow(ForbiddenError);
    });
  });
});
