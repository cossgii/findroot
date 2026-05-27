/**
 * @jest-environment node
 */

import { db } from '~/lib/db';
import {
  getAlternativesByRoutePlaceId,
  createAlternative,
  updateAlternative,
  deleteAlternative,
} from '~/src/services/route/alternativeService';
import { NotFoundError, ForbiddenError, BadRequestError } from '~/src/utils/api-errors';

jest.mock('~/lib/db', () => ({
  db: {
    routePlace: {
      findUnique: jest.fn(),
    },
    alternative: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

const mockedDb = db as jest.Mocked<typeof db>;

const mockRoutePlace = {
  id: 'route-place-1',
  route: { creatorId: 'creator-1' },
};

const mockAlternative = {
  id: 'alt-1',
  routePlaceId: 'route-place-1',
  placeId: 'place-1',
  explanation: '대안 설명',
  createdAt: new Date(),
  routePlace: { route: { creatorId: 'creator-1' } },
};

describe('alternativeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // getAlternativesByRoutePlaceId
  // ============================================
  describe('getAlternativesByRoutePlaceId', () => {
    it('경유지의 대안 장소 목록을 반환한다', async () => {
      (mockedDb.alternative.findMany as jest.Mock).mockResolvedValue([mockAlternative]);

      const result = await getAlternativesByRoutePlaceId({ routePlaceId: 'route-place-1' });

      expect(result).toHaveLength(1);
      expect(mockedDb.alternative.findMany).toHaveBeenCalledWith({
        where: { routePlaceId: 'route-place-1' },
        include: { place: true },
        orderBy: { createdAt: 'asc' },
      });
    });

    it('대안 장소가 없으면 빈 배열을 반환한다', async () => {
      (mockedDb.alternative.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getAlternativesByRoutePlaceId({ routePlaceId: 'route-place-1' });

      expect(result).toHaveLength(0);
    });
  });

  // ============================================
  // createAlternative
  // ============================================
  describe('createAlternative', () => {
    it('루트 작성자가 대안 장소를 등록할 수 있다', async () => {
      (mockedDb.routePlace.findUnique as jest.Mock).mockResolvedValue(mockRoutePlace);
      (mockedDb.alternative.count as jest.Mock).mockResolvedValue(0);
      (mockedDb.alternative.create as jest.Mock).mockResolvedValue(mockAlternative);

      const result = await createAlternative({
        routePlaceId: 'route-place-1',
        placeId: 'place-1',
        explanation: '대안 설명',
        userId: 'creator-1',
      });

      expect(result).toEqual(mockAlternative);
    });

    it('경유지당 대안 장소가 3개 이상이면 BadRequestError를 던진다', async () => {
      (mockedDb.routePlace.findUnique as jest.Mock).mockResolvedValue(mockRoutePlace);
      (mockedDb.alternative.count as jest.Mock).mockResolvedValue(3);

      await expect(
        createAlternative({
          routePlaceId: 'route-place-1',
          placeId: 'place-2',
          explanation: '초과 등록',
          userId: 'creator-1',
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it('존재하지 않는 경유지에 대안 등록 시 NotFoundError를 던진다', async () => {
      (mockedDb.routePlace.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        createAlternative({
          routePlaceId: 'nonexistent',
          placeId: 'place-1',
          explanation: '설명',
          userId: 'creator-1',
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it('루트 작성자가 아닌 사용자가 등록 시 ForbiddenError를 던진다', async () => {
      (mockedDb.routePlace.findUnique as jest.Mock).mockResolvedValue(mockRoutePlace);

      await expect(
        createAlternative({
          routePlaceId: 'route-place-1',
          placeId: 'place-1',
          explanation: '설명',
          userId: 'other-user',
        }),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  // ============================================
  // updateAlternative
  // ============================================
  describe('updateAlternative', () => {
    it('루트 작성자가 대안 장소 설명을 수정할 수 있다', async () => {
      const updated = { ...mockAlternative, explanation: '수정된 설명' };
      (mockedDb.alternative.findUnique as jest.Mock).mockResolvedValue(mockAlternative);
      (mockedDb.alternative.update as jest.Mock).mockResolvedValue(updated);

      const result = await updateAlternative({
        alternativeId: 'alt-1',
        explanation: '수정된 설명',
        userId: 'creator-1',
      });

      expect(result.explanation).toBe('수정된 설명');
    });

    it('존재하지 않는 대안 장소 수정 시 NotFoundError를 던진다', async () => {
      (mockedDb.alternative.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        updateAlternative({ alternativeId: 'nonexistent', explanation: '설명', userId: 'creator-1' }),
      ).rejects.toThrow(NotFoundError);
    });

    it('루트 작성자가 아닌 사용자가 수정 시 ForbiddenError를 던진다', async () => {
      (mockedDb.alternative.findUnique as jest.Mock).mockResolvedValue(mockAlternative);

      await expect(
        updateAlternative({ alternativeId: 'alt-1', explanation: '설명', userId: 'other-user' }),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  // ============================================
  // deleteAlternative
  // ============================================
  describe('deleteAlternative', () => {
    it('루트 작성자가 대안 장소를 삭제할 수 있다', async () => {
      (mockedDb.alternative.findUnique as jest.Mock).mockResolvedValue(mockAlternative);
      (mockedDb.alternative.delete as jest.Mock).mockResolvedValue(mockAlternative);

      await deleteAlternative({ alternativeId: 'alt-1', userId: 'creator-1' });

      expect(mockedDb.alternative.delete).toHaveBeenCalledWith({
        where: { id: 'alt-1' },
      });
    });

    it('존재하지 않는 대안 장소 삭제 시 NotFoundError를 던진다', async () => {
      (mockedDb.alternative.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        deleteAlternative({ alternativeId: 'nonexistent', userId: 'creator-1' }),
      ).rejects.toThrow(NotFoundError);
    });

    it('루트 작성자가 아닌 사용자가 삭제 시 ForbiddenError를 던진다', async () => {
      (mockedDb.alternative.findUnique as jest.Mock).mockResolvedValue(mockAlternative);

      await expect(
        deleteAlternative({ alternativeId: 'alt-1', userId: 'other-user' }),
      ).rejects.toThrow(ForbiddenError);
    });
  });
});
