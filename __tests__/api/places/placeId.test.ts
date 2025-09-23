/**
 * @jest-environment node
 */

import { DELETE, PUT, GET } from '~/app/api/places/[placeId]/route';
import { getServerSession } from 'next-auth';
import { deletePlace, updatePlace, getPlaceById } from '~/src/services/place/placeService';
import { NextRequest } from 'next/server';

// 1. 의존성 모의 처리
jest.mock('next-auth');
jest.mock('~/src/services/place/placeService');

const mockedGetServerSession = getServerSession as jest.Mock;
const mockedDeletePlace = deletePlace as jest.Mock;
const mockedUpdatePlace = updatePlace as jest.Mock;
const mockedGetPlaceById = getPlaceById as jest.Mock;

const mockSession = {
  user: { id: 'user-1' },
};

const createTestContext = (placeId: string) => ({
  params: Promise.resolve({ placeId }),
});

describe('/api/places/[placeId]', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- GET ---
  describe('GET', () => {
    it('장소가 존재하면 200 상태 코드와 함께 장소 정보를 반환한다', async () => {
      const placeId = 'place-1';
      const mockPlace = { id: placeId, name: 'Test Place' };
      mockedGetPlaceById.mockResolvedValue(mockPlace);
      const req = new NextRequest('http://localhost');
      const context = createTestContext(placeId);

      const response = await GET(req, context);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual(mockPlace);
    });

    it('장소가 존재하지 않으면 404 상태 코드를 반환한다', async () => {
      const placeId = 'not-found-place';
      mockedGetPlaceById.mockResolvedValue(null);
      const req = new NextRequest('http://localhost');
      const context = createTestContext(placeId);

      const response = await GET(req, context);
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.error).toBe('Place not found');
    });
  });

  // --- DELETE ---
  describe('DELETE', () => {
    it('인증되지 않은 사용자면 401을 반환한다', async () => {
      mockedGetServerSession.mockResolvedValue(null);
      const req = new NextRequest('http://localhost');
      const context = createTestContext('place-1');

      const response = await DELETE(req, context);

      expect(response.status).toBe(401);
      expect(mockedDeletePlace).not.toHaveBeenCalled();
    });

    it('소유자가 아닌 사용자가 삭제 시도 시 403을 반환한다', async () => {
      mockedGetServerSession.mockResolvedValue(mockSession);
      mockedDeletePlace.mockRejectedValue(new Error('Unauthorized to delete this place.'));
      const req = new NextRequest('http://localhost');
      const context = createTestContext('place-owned-by-another');

      const response = await DELETE(req, context);
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.message).toBe('Unauthorized to delete this place.');
    });

    it('인증된 소유자가 성공적으로 삭제하면 200을 반환한다', async () => {
      mockedGetServerSession.mockResolvedValue(mockSession);
      mockedDeletePlace.mockResolvedValue({}); // 성공적으로 해결
      const req = new NextRequest('http://localhost');
      const context = createTestContext('place-1');

      const response = await DELETE(req, context);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.message).toBe('Place deleted successfully');
      expect(mockedDeletePlace).toHaveBeenCalledWith('place-1', mockSession.user.id);
    });
  });

  // --- PUT ---
  describe('PUT', () => {
    const updateData = { name: 'Updated Place' };
    const req = (data: Record<string, unknown>) => new NextRequest('http://localhost', {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    it('인증되지 않은 사용자면 401을 반환한다', async () => {
        mockedGetServerSession.mockResolvedValue(null);
        const context = createTestContext('place-1');
  
        const response = await PUT(req(updateData), context);
  
        expect(response.status).toBe(401);
        expect(mockedUpdatePlace).not.toHaveBeenCalled();
      });

    it('소유자가 아닌 사용자가 수정 시도 시 403을 반환한다', async () => {
      mockedGetServerSession.mockResolvedValue(mockSession);
      mockedUpdatePlace.mockRejectedValue(new Error('Unauthorized to update this place.'));
      const context = createTestContext('place-owned-by-another');

      const response = await PUT(req(updateData), context);
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.message).toBe('Unauthorized to update this place.');
    });

    it('존재하지 않는 장소를 수정 시도 시 404를 반환한다', async () => {
        mockedGetServerSession.mockResolvedValue(mockSession);
        mockedUpdatePlace.mockRejectedValue(new Error('Place not found.'));
        const context = createTestContext('not-found-place');
  
        const response = await PUT(req(updateData), context);
        const body = await response.json();
  
        expect(response.status).toBe(404);
        expect(body.message).toBe('Place not found.');
      });

    it('인증된 소유자가 유효한 데이터로 수정하면 200을 반환한다', async () => {
      mockedGetServerSession.mockResolvedValue(mockSession);
      mockedUpdatePlace.mockResolvedValue({ id: 'place-1', ...updateData });
      const context = createTestContext('place-1');

      const response = await PUT(req(updateData), context);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.name).toBe('Updated Place');
      expect(mockedUpdatePlace).toHaveBeenCalledWith('place-1', mockSession.user.id, updateData);
    });
  });
});
