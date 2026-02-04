import {
  addLike,
  removeLike,
  getLikeStatus,
  getPlaceLikesCount,
  getRouteLikesCount,
  getLikedPlacesByUserId,
  getLikedRoutesByUserId,
  getLikeInfo,
} from '~/src/services/like/likeService';
import { db } from '~/lib/db';
import { PlaceCategory } from '@prisma/client';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';

// Prisma 클라이언트 모의 처리
jest.mock('~/lib/db', () => ({
  db: {
    like: {
      upsert: jest.fn(),
      deleteMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb()),
  },
}));

// Enum 모의 처리
jest.mock('@prisma/client', () => ({
  ...jest.requireActual('@prisma/client'),
  PlaceCategory: {
    MEAL: 'MEAL',
    DRINK: 'DRINK',
  },
  RouteStopLabel: {
    MEAL: 'MEAL',
    CAFE: 'CAFE',
    BAR: 'BAR',
  },
}));

// SEOUL_DISTRICTS 모의 처리 (필요한 경우)
jest.mock('~/src/utils/districts', () => ({
  SEOUL_DISTRICTS: [
    { id: 'gangnam', name: '강남구' },
    { id: 'jongno', name: '종로구' },
  ],
}));

const mockedDb = db as jest.Mocked<typeof db>;

const mockUserId = 'test-user-id';
const mockPlaceId = 'test-place-id';
const mockRouteId = 'test-route-id';

describe('LikeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addLike', () => {
    it('placeId만 제공될 때 좋아요가 성공적으로 추가되어야 한다', async () => {
      (mockedDb.like.upsert as jest.Mock).mockResolvedValue({
        userId: mockUserId,
        placeId: mockPlaceId,
        routeId: null,
      });

      const result = await addLike(mockUserId, { placeId: mockPlaceId });

      expect(mockedDb.like.upsert).toHaveBeenCalledWith({
        where: { userId_placeId: { userId: mockUserId, placeId: mockPlaceId } },
        create: {
          userId: mockUserId,
          placeId: mockPlaceId,
          routeId: undefined,
        },
        update: {},
      });
      expect(result).toEqual({
        userId: mockUserId,
        placeId: mockPlaceId,
        routeId: null,
      });
    });

    it('routeId만 제공될 때 좋아요가 성공적으로 추가되어야 한다', async () => {
      (mockedDb.like.upsert as jest.Mock).mockResolvedValue({
        userId: mockUserId,
        placeId: null,
        routeId: mockRouteId,
      });

      const result = await addLike(mockUserId, { routeId: mockRouteId });

      expect(mockedDb.like.upsert).toHaveBeenCalledWith({
        where: { userId_routeId: { userId: mockUserId, routeId: mockRouteId } },
        create: {
          userId: mockUserId,
          placeId: undefined,
          routeId: mockRouteId,
        },
        update: {},
      });
      expect(result).toEqual({
        userId: mockUserId,
        placeId: null,
        routeId: mockRouteId,
      });
    });

    it('placeId와 routeId 모두 제공되지 않을 때 에러를 던져야 한다', async () => {
      await expect(addLike(mockUserId, {})).rejects.toThrow(
        'Place ID or Route ID is required.',
      );
      expect(mockedDb.like.upsert).not.toHaveBeenCalled();
    });

    it('Prisma upsert에서 에러 발생 시 서비스가 에러를 다시 던져야 한다', async () => {
      const mockError = new Error('DB Error');
      (mockedDb.like.upsert as jest.Mock).mockRejectedValue(mockError);

      await expect(
        addLike(mockUserId, { placeId: mockPlaceId }),
      ).rejects.toThrow('DB Error');
      expect(mockedDb.like.upsert).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeLike', () => {
    it('placeId만 제공될 때 좋아요가 성공적으로 제거되어야 한다', async () => {
      (mockedDb.like.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await removeLike(mockUserId, { placeId: mockPlaceId });

      expect(mockedDb.like.deleteMany).toHaveBeenCalledWith({
        where: { userId: mockUserId, placeId: mockPlaceId, routeId: undefined },
      });
      expect(result).toEqual({ count: 1 });
    });

    it('routeId만 제공될 때 좋아요가 성공적으로 제거되어야 한다', async () => {
      (mockedDb.like.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await removeLike(mockUserId, { routeId: mockRouteId });

      expect(mockedDb.like.deleteMany).toHaveBeenCalledWith({
        where: { userId: mockUserId, placeId: undefined, routeId: mockRouteId },
      });
      expect(result).toEqual({ count: 1 });
    });

    it('placeId와 routeId 모두 제공되지 않을 때 에러를 던져야 한다', async () => {
      await expect(removeLike(mockUserId, {})).rejects.toThrow(
        'Place ID or Route ID is required.',
      );
      expect(mockedDb.like.deleteMany).not.toHaveBeenCalled();
    });
  });

  describe('getLikeStatus', () => {
    it('placeId만 제공될 때 좋아요 상태를 올바르게 반환해야 한다 (true)', async () => {
      (mockedDb.like.findFirst as jest.Mock).mockResolvedValue({
        id: 'like-id',
      });
      const status = await getLikeStatus(mockUserId, { placeId: mockPlaceId });
      expect(mockedDb.like.findFirst).toHaveBeenCalledWith({
        where: { userId: mockUserId, placeId: mockPlaceId },
      });
      expect(status).toBe(true);
    });

    it('routeId만 제공될 때 좋아요 상태를 올바르게 반환해야 한다 (true)', async () => {
      (mockedDb.like.findFirst as jest.Mock).mockResolvedValue({
        id: 'like-id',
      });
      const status = await getLikeStatus(mockUserId, { routeId: mockRouteId });
      expect(mockedDb.like.findFirst).toHaveBeenCalledWith({
        where: { userId: mockUserId, routeId: mockRouteId },
      });
      expect(status).toBe(true);
    });

    it('좋아요가 존재하지 않을 때 false를 반환해야 한다', async () => {
      (mockedDb.like.findFirst as jest.Mock).mockResolvedValue(null);
      const status = await getLikeStatus(mockUserId, { placeId: mockPlaceId });
      expect(status).toBe(false);
    });

    it('placeId와 routeId 모두 제공되지 않을 때 false를 반환하고 findFirst가 호출되지 않아야 한다', async () => {
      const status = await getLikeStatus(mockUserId, {});
      expect(status).toBe(false);
      expect(mockedDb.like.findFirst).not.toHaveBeenCalled();
    });
  });

  describe('getPlaceLikesCount', () => {
    it('특정 장소의 좋아요 개수를 올바르게 반환해야 한다', async () => {
      (mockedDb.like.count as jest.Mock).mockResolvedValue(5);
      const count = await getPlaceLikesCount(mockPlaceId);
      expect(mockedDb.like.count).toHaveBeenCalledWith({
        where: { placeId: mockPlaceId },
      });
      expect(count).toBe(5);
    });
  });

  describe('getRouteLikesCount', () => {
    it('특정 경로의 좋아요 개수를 올바르게 반환해야 한다', async () => {
      (mockedDb.like.count as jest.Mock).mockResolvedValue(10);
      const count = await getRouteLikesCount(mockRouteId);
      expect(mockedDb.like.count).toHaveBeenCalledWith({
        where: { routeId: mockRouteId },
      });
      expect(count).toBe(10);
    });
  });

  describe('getLikedPlacesByUserId', () => {
    const mockPlace = {
      id: mockPlaceId,
      name: 'Test Place',
      district: '강남구',
      category: PlaceCategory.MEAL,
      createdAt: new Date(),
      updatedAt: new Date(),
      _count: { likes: 3 },
    };
    const mockLikedItem = { place: mockPlace };

    it('사용자가 좋아요한 장소 목록을 페이징과 함께 올바르게 반환해야 한다', async () => {
      (mockedDb.$transaction as jest.Mock).mockImplementation(() =>
        Promise.all([
          Promise.resolve([mockLikedItem]),
          Promise.resolve(1), // totalCount
        ]),
      );

      const result = await getLikedPlacesByUserId(mockUserId, 1, 5);

      expect(mockedDb.like.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: mockUserId, placeId: { not: null }, place: {} },
          skip: 0,
          take: 5,
        }),
      );
      expect(result.places).toHaveLength(1);
      expect(result.places[0].id).toBe(mockPlaceId);
      expect(result.totalCount).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(result.currentPage).toBe(1);
    });

    it('districtId로 필터링이 올바르게 작동해야 한다', async () => {
      (mockedDb.$transaction as jest.Mock).mockImplementation(() =>
        Promise.all([
          Promise.resolve([mockLikedItem]),
          Promise.resolve(1), // totalCount
        ]),
      );

      const gangnamDistrict = SEOUL_DISTRICTS.find((d) => d.name === '강남구');
      await getLikedPlacesByUserId(mockUserId, 1, 5, gangnamDistrict?.id, null);

      expect(mockedDb.like.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: mockUserId,
            placeId: { not: null },
            place: { district: '강남구' },
          },
        }),
      );
    });

    it('category로 필터링이 올바르게 작동해야 한다', async () => {
      (mockedDb.$transaction as jest.Mock).mockImplementation(() =>
        Promise.all([
          Promise.resolve([mockLikedItem]),
          Promise.resolve(1), // totalCount
        ]),
      );

      await getLikedPlacesByUserId(mockUserId, 1, 5, null, PlaceCategory.MEAL);

      expect(mockedDb.like.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: mockUserId,
            placeId: { not: null },
            place: { category: PlaceCategory.MEAL },
          },
        }),
      );
    });
  });

  describe('getLikedRoutesByUserId', () => {
    const mockRoute = {
      id: mockRouteId,
      title: 'Test Route',
      districtId: 'gangnam',
      createdAt: new Date(),
      updatedAt: new Date(),
      _count: { likes: 2 },
    };
    const mockLikedItem = { route: mockRoute };

    it('사용자가 좋아요한 경로 목록을 페이징과 함께 올바르게 반환해야 한다', async () => {
      (mockedDb.$transaction as jest.Mock).mockImplementation(() =>
        Promise.all([
          Promise.resolve([mockLikedItem]),
          Promise.resolve(1), // totalCount
        ]),
      );

      const result = await getLikedRoutesByUserId(mockUserId, 1, 5);

      expect(mockedDb.like.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: mockUserId, routeId: { not: null } },
          skip: 0,
          take: 5,
        }),
      );
      expect(result.routes).toHaveLength(1);
      expect(result.routes[0].id).toBe(mockRouteId);
      expect(result.totalCount).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(result.currentPage).toBe(1);
    });

    it('districtId로 필터링이 올바르게 작동해야 한다', async () => {
      (mockedDb.$transaction as jest.Mock).mockImplementation(() =>
        Promise.all([
          Promise.resolve([mockLikedItem]),
          Promise.resolve(1), // totalCount
        ]),
      );

      await getLikedRoutesByUserId(mockUserId, 1, 5, 'gangnam');

      expect(mockedDb.like.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: mockUserId,
            routeId: { not: null },
            route: { districtId: 'gangnam' },
          },
        }),
      );
    });
  });

  describe('getLikeInfo', () => {
    it('placeId만 제공될 때 좋아요 개수와 사용자 좋아요 여부를 올바르게 반환해야 한다', async () => {
      (mockedDb.like.count as jest.Mock).mockResolvedValue(5);
      (mockedDb.like.findFirst as jest.Mock).mockResolvedValue({
        id: 'like-id',
      });

      const result = await getLikeInfo({ placeId: mockPlaceId }, mockUserId);

      expect(mockedDb.like.count).toHaveBeenCalledWith({
        where: { placeId: mockPlaceId },
      });
      expect(mockedDb.like.findFirst).toHaveBeenCalledWith({
        where: { userId: mockUserId, placeId: mockPlaceId },
      });
      expect(result).toEqual({ count: 5, liked: true });
    });

    it('routeId만 제공될 때 좋아요 개수와 사용자 좋아요 여부를 올바르게 반환해야 한다', async () => {
      (mockedDb.like.count as jest.Mock).mockResolvedValue(10);
      (mockedDb.like.findFirst as jest.Mock).mockResolvedValue(null); // Not liked by user

      const result = await getLikeInfo({ routeId: mockRouteId }, mockUserId);

      expect(mockedDb.like.count).toHaveBeenCalledWith({
        where: { routeId: mockRouteId },
      });
      expect(mockedDb.like.findFirst).toHaveBeenCalledWith({
        where: { userId: mockUserId, routeId: mockRouteId },
      });
      expect(result).toEqual({ count: 10, liked: false });
    });

    it('userId가 제공되지 않을 때 liked가 false로 반환되어야 한다', async () => {
      (mockedDb.like.count as jest.Mock).mockResolvedValue(3);
      const result = await getLikeInfo({ placeId: mockPlaceId });
      expect(mockedDb.like.count).toHaveBeenCalledWith({
        where: { placeId: mockPlaceId },
      });
      expect(mockedDb.like.findFirst).not.toHaveBeenCalled();
      expect(result).toEqual({ count: 3, liked: false });
    });

    it('placeId와 routeId 모두 제공되지 않을 때 에러를 던져야 한다', async () => {
      await expect(getLikeInfo({})).rejects.toThrow(
        'Place ID or Route ID is required.',
      );
      expect(mockedDb.like.count).not.toHaveBeenCalled();
      expect(mockedDb.like.findFirst).not.toHaveBeenCalled();
    });
  });
});
