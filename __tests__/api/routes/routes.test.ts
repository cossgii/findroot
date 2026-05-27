/**
 * @jest-environment node
 */

import { POST } from '~/app/api/routes/route';
import { GET as GET_ROUTE, DELETE as DELETE_ROUTE, PUT as PUT_ROUTE } from '~/app/api/routes/[routeId]/route';
import { GET as GET_FEATURED } from '~/app/api/routes/featured/route';
import { getServerSession } from 'next-auth';
import {
  createRoute,
  getRouteById,
  deleteRoute,
  updateRoute,
  getFeaturedRoutes,
} from '~/src/services/route/routeService';
import { NextRequest } from 'next/server';

jest.mock('next-auth');
jest.mock('~/src/services/route/routeService');
jest.mock('~/src/services/auth/authOptions', () => ({ authOptions: {} }));

const mockedGetServerSession = getServerSession as jest.Mock;
const mockedCreateRoute = createRoute as jest.Mock;
const mockedGetRouteById = getRouteById as jest.Mock;
const mockedDeleteRoute = deleteRoute as jest.Mock;
const mockedUpdateRoute = updateRoute as jest.Mock;
const mockedGetFeaturedRoutes = getFeaturedRoutes as jest.Mock;

const mockSession = { user: { id: 'user-1' } };

const mockRoute = {
  id: 'route-1',
  name: '테스트 루트',
  description: '설명',
  districtId: 'district-1',
  creatorId: 'user-1',
  purpose: 'TOUR',
  creator: { id: 'user-1', name: '테스트유저', image: null },
  places: [],
  _count: { comments: 0 },
  likes: [],
  isLiked: false,
  likesCount: 0,
};

const createRequest = (method: string, body?: object, searchParams?: Record<string, string>) => {
  const url = new URL('http://localhost/api/routes');
  if (searchParams) {
    Object.entries(searchParams).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  return new NextRequest(url, {
    method,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
};

const mockParams = (params: Record<string, string> = {}) => Promise.resolve(params);

const validRouteBody = {
  name: '테스트 루트',
  description: '설명',
  districtId: 'district-1',
  purpose: 'ENTIRE',
  places: [
    { placeId: 'place-1', order: 1, label: 'MEAL' },
    { placeId: 'place-2', order: 2, label: 'CAFE' },
  ],
};

describe('/api/routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetServerSession.mockResolvedValue(mockSession);
  });

  // ============================================
  // POST /api/routes
  // ============================================
  describe('POST', () => {
    it('루트 생성 시 201과 새 루트를 반환한다', async () => {
      mockedCreateRoute.mockResolvedValue(mockRoute);

      const req = createRequest('POST', validRouteBody);
      const res = await POST(req, { params: mockParams() });
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.id).toBe('route-1');
      expect(mockedCreateRoute).toHaveBeenCalledWith(validRouteBody, 'user-1');
    });

    it('인증 없이 요청 시 401을 반환한다', async () => {
      mockedGetServerSession.mockResolvedValue(null);

      const req = createRequest('POST', validRouteBody);
      const res = await POST(req, { params: mockParams() });

      expect(res.status).toBe(401);
    });

    it('필수 필드 없으면 400을 반환한다', async () => {
      const req = createRequest('POST', { name: '이름만' });
      const res = await POST(req, { params: mockParams() });

      expect(res.status).toBe(400);
    });
  });

  // ============================================
  // GET /api/routes/[routeId]
  // ============================================
  describe('GET /api/routes/[routeId]', () => {
    it('루트 조회 시 200과 루트 데이터를 반환한다', async () => {
      mockedGetRouteById.mockResolvedValue(mockRoute);

      const req = createRequest('GET');
      const res = await GET_ROUTE(req, { params: mockParams({ routeId: 'route-1' }) });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.id).toBe('route-1');
    });

    it('존재하지 않는 루트 조회 시 404를 반환한다', async () => {
      mockedGetRouteById.mockResolvedValue(null);

      const req = createRequest('GET');
      const res = await GET_ROUTE(req, { params: mockParams({ routeId: 'nonexistent' }) });

      expect(res.status).toBe(404);
    });

    it('비로그인 상태에서도 루트 조회 가능하다', async () => {
      mockedGetServerSession.mockResolvedValue(null);
      mockedGetRouteById.mockResolvedValue(mockRoute);

      const req = createRequest('GET');
      const res = await GET_ROUTE(req, { params: mockParams({ routeId: 'route-1' }) });

      expect(res.status).toBe(200);
    });
  });

  // ============================================
  // DELETE /api/routes/[routeId]
  // ============================================
  describe('DELETE /api/routes/[routeId]', () => {
    it('루트 삭제 시 200을 반환한다', async () => {
      mockedDeleteRoute.mockResolvedValue(undefined);

      const req = createRequest('DELETE');
      const res = await DELETE_ROUTE(req, { params: mockParams({ routeId: 'route-1' }) });

      expect(res.status).toBe(200);
      expect(mockedDeleteRoute).toHaveBeenCalledWith('route-1', 'user-1');
    });

    it('인증 없이 삭제 시 401을 반환한다', async () => {
      mockedGetServerSession.mockResolvedValue(null);

      const req = createRequest('DELETE');
      const res = await DELETE_ROUTE(req, { params: mockParams({ routeId: 'route-1' }) });

      expect(res.status).toBe(401);
    });
  });

  // ============================================
  // PUT /api/routes/[routeId]
  // ============================================
  describe('PUT /api/routes/[routeId]', () => {
    it('루트 수정 시 200과 수정된 루트를 반환한다', async () => {
      const updated = { ...mockRoute, name: '수정된 루트' };
      mockedUpdateRoute.mockResolvedValue(updated);

      const req = createRequest('PUT', { name: '수정된 루트' });
      const res = await PUT_ROUTE(req, { params: mockParams({ routeId: 'route-1' }) });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.name).toBe('수정된 루트');
    });

    it('인증 없이 수정 시 401을 반환한다', async () => {
      mockedGetServerSession.mockResolvedValue(null);

      const req = createRequest('PUT', { name: '수정' });
      const res = await PUT_ROUTE(req, { params: mockParams({ routeId: 'route-1' }) });

      expect(res.status).toBe(401);
    });
  });
});

// ============================================
// GET /api/routes/featured
// ============================================
describe('GET /api/routes/featured', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetServerSession.mockResolvedValue(mockSession);
  });

  it('추천 루트 목록을 반환한다', async () => {
    mockedGetFeaturedRoutes.mockResolvedValue([mockRoute]);

    const req = createRequest('GET', undefined, { districtId: 'district-1' });
    const res = await GET_FEATURED(req, { params: mockParams() });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
  });

  it('비로그인 상태에서도 추천 루트 목록을 반환한다', async () => {
    mockedGetServerSession.mockResolvedValue(null);
    mockedGetFeaturedRoutes.mockResolvedValue([mockRoute]);

    const req = createRequest('GET');
    const res = await GET_FEATURED(req, { params: mockParams() });

    expect(res.status).toBe(200);
  });
});
