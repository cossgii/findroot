/**
 * @jest-environment node
 */

import { GET as GET_COMMENTS, POST as POST_COMMENT } from '~/app/api/routes/[routeId]/comments/route';
import { PUT as PUT_COMMENT, DELETE as DELETE_COMMENT } from '~/app/api/routes/[routeId]/comments/[commentId]/route';
import { getServerSession } from 'next-auth';
import {
  getCommentsByRouteId,
  createComment,
  updateComment,
  deleteCommentWithRouteId,
} from '~/src/services/comment/commentService';
import { NextRequest } from 'next/server';

jest.mock('next-auth');
jest.mock('~/src/services/comment/commentService');
jest.mock('~/src/services/auth/authOptions', () => ({ authOptions: {} }));
jest.mock('~/lib/db', () => ({
  db: {
    comment: {
      count: jest.fn().mockResolvedValue(1),
    },
  },
}));

const mockedGetServerSession = getServerSession as jest.Mock;
const mockedGetCommentsByRouteId = getCommentsByRouteId as jest.Mock;
const mockedCreateComment = createComment as jest.Mock;
const mockedUpdateComment = updateComment as jest.Mock;
const mockedDeleteCommentWithRouteId = deleteCommentWithRouteId as jest.Mock;

const mockSession = { user: { id: 'user-1' } };

const mockComment = {
  id: 'comment-1',
  content: '테스트 댓글',
  routeId: 'route-1',
  authorId: 'user-1',
  author: { id: 'user-1', name: '테스트유저', image: null },
  createdAt: new Date(),
  updatedAt: new Date(),
};

const createRequest = (method: string, body?: object, searchParams?: Record<string, string>) => {
  const url = new URL('http://localhost/api/routes/route-1/comments');
  if (searchParams) {
    Object.entries(searchParams).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  return new NextRequest(url, {
    method,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
};

const mockParams = (params: Record<string, string> = {}) => Promise.resolve(params);

describe('/api/routes/[routeId]/comments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetServerSession.mockResolvedValue(mockSession);
  });

  // ============================================
  // GET /api/routes/[routeId]/comments
  // ============================================
  describe('GET', () => {
    it('댓글 목록을 반환한다', async () => {
      mockedGetCommentsByRouteId.mockResolvedValue({
        comments: [mockComment],
        totalCount: 1,
        totalPages: 1,
        currentPage: 1,
      });

      const req = createRequest('GET');
      const res = await GET_COMMENTS(req, { params: mockParams({ routeId: 'route-1' }) });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(mockedGetCommentsByRouteId).toHaveBeenCalledWith({
        routeId: 'route-1',
        page: 1,
        limit: 10,
      });
    });

    it('비로그인 상태에서도 댓글 목록을 조회할 수 있다', async () => {
      mockedGetServerSession.mockResolvedValue(null);
      mockedGetCommentsByRouteId.mockResolvedValue({ comments: [], totalCount: 0 });

      const req = createRequest('GET');
      const res = await GET_COMMENTS(req, { params: mockParams({ routeId: 'route-1' }) });

      expect(res.status).toBe(200);
    });
  });

  // ============================================
  // POST /api/routes/[routeId]/comments
  // ============================================
  describe('POST', () => {
    it('댓글 생성 시 201과 댓글 데이터를 반환한다', async () => {
      mockedCreateComment.mockResolvedValue(mockComment);

      const req = createRequest('POST', { content: '테스트 댓글' });
      const res = await POST_COMMENT(req, { params: mockParams({ routeId: 'route-1' }) });
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.comment.id).toBe('comment-1');
      expect(mockedCreateComment).toHaveBeenCalledWith({
        routeId: 'route-1',
        authorId: 'user-1',
        content: '테스트 댓글',
      });
    });

    it('인증 없이 댓글 작성 시 401을 반환한다', async () => {
      mockedGetServerSession.mockResolvedValue(null);

      const req = createRequest('POST', { content: '테스트 댓글' });
      const res = await POST_COMMENT(req, { params: mockParams({ routeId: 'route-1' }) });

      expect(res.status).toBe(401);
    });

    it('빈 댓글 내용으로 요청 시 400을 반환한다', async () => {
      const req = createRequest('POST', { content: '' });
      const res = await POST_COMMENT(req, { params: mockParams({ routeId: 'route-1' }) });

      expect(res.status).toBe(400);
    });
  });
});

// ============================================
// PUT/DELETE /api/routes/[routeId]/comments/[commentId]
// ============================================
describe('/api/routes/[routeId]/comments/[commentId]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetServerSession.mockResolvedValue(mockSession);
  });

  describe('PUT', () => {
    it('댓글 수정 시 200과 수정된 댓글을 반환한다', async () => {
      const updated = { ...mockComment, content: '수정된 댓글' };
      mockedUpdateComment.mockResolvedValue(updated);

      const req = createRequest('PUT', { content: '수정된 댓글' });
      const res = await PUT_COMMENT(req, { params: mockParams({ routeId: 'route-1', commentId: 'comment-1' }) });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.content).toBe('수정된 댓글');
    });

    it('인증 없이 댓글 수정 시 401을 반환한다', async () => {
      mockedGetServerSession.mockResolvedValue(null);

      const req = createRequest('PUT', { content: '수정된 댓글' });
      const res = await PUT_COMMENT(req, { params: mockParams({ routeId: 'route-1', commentId: 'comment-1' }) });

      expect(res.status).toBe(401);
    });
  });

  describe('DELETE', () => {
    it('댓글 삭제 시 200을 반환한다', async () => {
      mockedDeleteCommentWithRouteId.mockResolvedValue({ routeId: 'route-1' });

      const req = createRequest('DELETE');
      const res = await DELETE_COMMENT(req, { params: mockParams({ routeId: 'route-1', commentId: 'comment-1' }) });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.deleted).toBe(true);
    });

    it('인증 없이 댓글 삭제 시 401을 반환한다', async () => {
      mockedGetServerSession.mockResolvedValue(null);

      const req = createRequest('DELETE');
      const res = await DELETE_COMMENT(req, { params: mockParams({ routeId: 'route-1', commentId: 'comment-1' }) });

      expect(res.status).toBe(401);
    });
  });
});
