/**
 * @jest-environment node
 */

import { GET as GET_ME, PUT as PUT_ME } from '~/app/api/users/me/route';
import { POST as POST_FOLLOW, DELETE as DELETE_FOLLOW } from '~/app/api/users/[userId]/follow/route';
import { GET as GET_FOLLOW_STATUS } from '~/app/api/users/[userId]/follow/status/route';
import { getServerSession } from 'next-auth';
import { updateUser } from '~/src/services/user/userService';
import { followUser, unfollowUser, getFollowStatus } from '~/src/services/user/followService';
import { NextRequest } from 'next/server';

jest.mock('next-auth');
jest.mock('~/src/services/user/userService');
jest.mock('~/src/services/user/followService');
jest.mock('~/src/services/auth/authOptions', () => ({ authOptions: {} }));

const mockedGetServerSession = getServerSession as jest.Mock;
const mockedUpdateUser = updateUser as jest.Mock;
const mockedFollowUser = followUser as jest.Mock;
const mockedUnfollowUser = unfollowUser as jest.Mock;
const mockedGetFollowStatus = getFollowStatus as jest.Mock;

const mockSession = {
  user: { id: 'user-1', name: '테스트유저', email: 'test@example.com', image: null },
};

const mockUser = {
  id: 'user-1',
  name: '테스트유저',
  email: 'test@example.com',
  image: null,
};

const createRequest = (method: string, body?: object, searchParams?: Record<string, string>) => {
  const url = new URL('http://localhost/api/users/me');
  if (searchParams) {
    Object.entries(searchParams).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  return new NextRequest(url, {
    method,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
};

const mockParams = (params: Record<string, string> = {}) => Promise.resolve(params);

// ============================================
// GET /api/users/me
// ============================================
describe('GET /api/users/me', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetServerSession.mockResolvedValue(mockSession);
  });

  it('현재 로그인한 유저 정보를 반환한다', async () => {
    const req = createRequest('GET');
    const res = await GET_ME(req, { params: mockParams() });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.id).toBe('user-1');
  });

  it('인증 없이 요청 시 401을 반환한다', async () => {
    mockedGetServerSession.mockResolvedValue(null);

    const req = createRequest('GET');
    const res = await GET_ME(req, { params: mockParams() });

    expect(res.status).toBe(401);
  });
});

// ============================================
// PUT /api/users/me
// ============================================
describe('PUT /api/users/me', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetServerSession.mockResolvedValue(mockSession);
  });

  it('유저 정보 수정 시 200과 수정된 유저를 반환한다', async () => {
    const updated = { ...mockUser, name: '수정된이름' };
    mockedUpdateUser.mockResolvedValue(updated);

    const req = createRequest('PUT', { name: '수정된이름' });
    const res = await PUT_ME(req, { params: mockParams() });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.name).toBe('수정된이름');
  });

  it('인증 없이 수정 시 401을 반환한다', async () => {
    mockedGetServerSession.mockResolvedValue(null);

    const req = createRequest('PUT', { name: '이름' });
    const res = await PUT_ME(req, { params: mockParams() });

    expect(res.status).toBe(401);
  });

  it('잘못된 이미지 URL로 수정 시 400을 반환한다', async () => {
    const req = createRequest('PUT', { image: 'not-a-url' });
    const res = await PUT_ME(req, { params: mockParams() });

    expect(res.status).toBe(400);
  });
});

// ============================================
// POST /api/users/[userId]/follow
// ============================================
describe('/api/users/[userId]/follow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetServerSession.mockResolvedValue(mockSession);
  });

  describe('POST', () => {
    it('팔로우 시 201을 반환한다', async () => {
      const mockFollow = { followerId: 'user-1', followingId: 'user-2' };
      mockedFollowUser.mockResolvedValue(mockFollow);

      const req = createRequest('POST');
      const res = await POST_FOLLOW(req, { params: mockParams({ userId: 'user-2' }) });

      expect(res.status).toBe(201);
      expect(mockedFollowUser).toHaveBeenCalledWith('user-1', 'user-2');
    });

    it('인증 없이 팔로우 시 401을 반환한다', async () => {
      mockedGetServerSession.mockResolvedValue(null);

      const req = createRequest('POST');
      const res = await POST_FOLLOW(req, { params: mockParams({ userId: 'user-2' }) });

      expect(res.status).toBe(401);
    });
  });

  describe('DELETE', () => {
    it('언팔로우 시 200을 반환한다', async () => {
      mockedUnfollowUser.mockResolvedValue(undefined);

      const req = createRequest('DELETE');
      const res = await DELETE_FOLLOW(req, { params: mockParams({ userId: 'user-2' }) });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.message).toBe('언팔로우 성공');
    });

    it('인증 없이 언팔로우 시 401을 반환한다', async () => {
      mockedGetServerSession.mockResolvedValue(null);

      const req = createRequest('DELETE');
      const res = await DELETE_FOLLOW(req, { params: mockParams({ userId: 'user-2' }) });

      expect(res.status).toBe(401);
    });
  });
});

// ============================================
// GET /api/users/[userId]/follow/status
// ============================================
describe('GET /api/users/[userId]/follow/status', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetServerSession.mockResolvedValue(mockSession);
  });

  it('팔로우 상태를 반환한다', async () => {
    mockedGetFollowStatus.mockResolvedValue(true);

    const req = new NextRequest('http://localhost/api/users/user-2/follow/status', { method: 'GET' });
    const res = await GET_FOLLOW_STATUS(req, { params: mockParams({ userId: 'user-2' }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.isFollowing).toBe(true);
  });

  it('비로그인 상태에서는 { isFollowing: false }를 반환한다', async () => {
    mockedGetServerSession.mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/users/user-2/follow/status', { method: 'GET' });
    const res = await GET_FOLLOW_STATUS(req, { params: mockParams({ userId: 'user-2' }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.isFollowing).toBe(false);
  });
});
