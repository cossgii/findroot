/**
 * @jest-environment node
 */

import { POST, DELETE } from '~/app/api/likes/route';
import { GET as GET_STATUS } from '~/app/api/likes/status/route';
import { getServerSession } from 'next-auth';
import { addLike, removeLike, getLikeInfo, getLikeStatus } from '~/src/services/like/likeService';
import { NextRequest } from 'next/server';

jest.mock('next-auth');
jest.mock('~/src/services/like/likeService');
jest.mock('~/src/services/auth/authOptions', () => ({ authOptions: {} }));

const mockedGetServerSession = getServerSession as jest.Mock;
const mockedAddLike = addLike as jest.Mock;
const mockedRemoveLike = removeLike as jest.Mock;
const mockedGetLikeInfo = getLikeInfo as jest.Mock;
const mockedGetLikeStatus = getLikeStatus as jest.Mock;

const mockSession = { user: { id: 'user-1' } };
const mockLikeInfo = { likesCount: 1, isLiked: true };

const createRequest = (method: string, body?: object, searchParams?: Record<string, string>) => {
  const url = new URL('http://localhost/api/likes');
  if (searchParams) {
    Object.entries(searchParams).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  return new NextRequest(url, {
    method,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
};

const mockParams = Promise.resolve({});

describe('/api/likes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetServerSession.mockResolvedValue(mockSession);
  });

  // ============================================
  // POST /api/likes
  // ============================================
  describe('POST', () => {
    it('장소 좋아요 추가 시 201과 likeInfo를 반환한다', async () => {
      mockedAddLike.mockResolvedValue(undefined);
      mockedGetLikeInfo.mockResolvedValue(mockLikeInfo);

      const req = createRequest('POST', { placeId: 'place-1' });
      const res = await POST(req, { params: mockParams });
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body).toEqual(mockLikeInfo);
      expect(mockedAddLike).toHaveBeenCalledWith('user-1', { placeId: 'place-1' });
    });

    it('루트 좋아요 추가 시 201과 likeInfo를 반환한다', async () => {
      mockedAddLike.mockResolvedValue(undefined);
      mockedGetLikeInfo.mockResolvedValue(mockLikeInfo);

      const req = createRequest('POST', { routeId: 'route-1' });
      const res = await POST(req, { params: mockParams });

      expect(res.status).toBe(201);
    });

    it('인증 없이 요청 시 401을 반환한다', async () => {
      mockedGetServerSession.mockResolvedValue(null);

      const req = createRequest('POST', { placeId: 'place-1' });
      const res = await POST(req, { params: mockParams });

      expect(res.status).toBe(401);
    });

    it('placeId와 routeId 모두 없으면 400을 반환한다', async () => {
      const req = createRequest('POST', {});
      const res = await POST(req, { params: mockParams });

      expect(res.status).toBe(400);
    });

    it('placeId와 routeId 모두 있으면 400을 반환한다', async () => {
      const req = createRequest('POST', { placeId: 'place-1', routeId: 'route-1' });
      const res = await POST(req, { params: mockParams });

      expect(res.status).toBe(400);
    });
  });

  // ============================================
  // DELETE /api/likes
  // ============================================
  describe('DELETE', () => {
    it('좋아요 취소 시 200과 likeInfo를 반환한다', async () => {
      mockedRemoveLike.mockResolvedValue(undefined);
      mockedGetLikeInfo.mockResolvedValue({ likesCount: 0, isLiked: false });

      const req = createRequest('DELETE', undefined, { placeId: 'place-1' });
      const res = await DELETE(req, { params: mockParams });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.isLiked).toBe(false);
    });

    it('인증 없이 요청 시 401을 반환한다', async () => {
      mockedGetServerSession.mockResolvedValue(null);

      const req = createRequest('DELETE', undefined, { placeId: 'place-1' });
      const res = await DELETE(req, { params: mockParams });

      expect(res.status).toBe(401);
    });
  });
});

// ============================================
// GET /api/likes/status
// ============================================
describe('GET /api/likes/status', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetServerSession.mockResolvedValue(mockSession);
  });

  it('좋아요 상태가 true면 { liked: true }를 반환한다', async () => {
    mockedGetLikeStatus.mockResolvedValue(true);

    const req = createRequest('GET', undefined, { placeId: 'place-1' });
    const res = await GET_STATUS(req, { params: mockParams });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ liked: true });
  });

  it('비로그인 상태에서는 { liked: false }를 반환한다', async () => {
    mockedGetServerSession.mockResolvedValue(null);

    const req = createRequest('GET', undefined, { placeId: 'place-1' });
    const res = await GET_STATUS(req, { params: mockParams });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ liked: false });
  });

  it('쿼리 파라미터가 없으면 400을 반환한다', async () => {
    const req = createRequest('GET');
    const res = await GET_STATUS(req, { params: mockParams });

    expect(res.status).toBe(400);
  });
});
