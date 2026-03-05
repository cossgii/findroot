import {
  addLike,
  removeLike,
  getLikeStatus,
  getLikedPlacesByUserId,
  getLikedRoutesByUserId,
  getLikeInfo,
} from '~/src/services/like/likeService';
import { db } from '~/lib/db';
import { PlaceCategory } from '@prisma/client';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';

// 트랜잭션 내부에서 사용할 mock prisma 객체
const mockPrisma = {
  like: {
    findFirst: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
  place: {
    update: jest.fn(),
  },
  route: {
    update: jest.fn(),
  },
};

jest.mock('~/lib/db', () => ({
  db: {
    like: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    place: {
      findUnique: jest.fn(),
    },
    route: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

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
    // 트랜잭션 콜백에 mockPrisma 전달
    (mockedDb.$transaction as jest.Mock).mockImplementation((cb) => {
      if (typeof cb === 'function') return cb(mockPrisma);
      return Promise.all(cb);
    });
  });

  describe('addLike', () => {
    it('placeId만 제공될 때 좋아요가 성공적으로 추가되어야 한다', async () => {
      const mockLike = {
        userId: mockUserId,
        placeId: mockPlaceId,
        routeId: null,
      };
      mockPrisma.like.findFirst.mockResolvedValue(null);
      mockPrisma.like.create.mockResolvedValue(mockLike);
      mockPrisma.place.update.mockResolvedValue({});

      const result = await addLike(mockUserId, { placeId: mockPlaceId });

      expect(mockPrisma.like.findFirst).toHaveBeenCalledWith({
        where: { userId: mockUserId, placeId: mockPlaceId, routeId: undefined },
      });
      expect(mockPrisma.like.create).toHaveBeenCalledWith({
        data: { userId: mockUserId, placeId: mockPlaceId },
      });
      expect(result).toEqual(mockLike);
    });

    it('routeId만 제공될 때 좋아요가 성공적으로 추가되어야 한다', async () => {
      const mockLike = {
        userId: mockUserId,
        placeId: null,
        routeId: mockRouteId,
      };
      mockPrisma.like.findFirst.mockResolvedValue(null);
      mockPrisma.like.create.mockResolvedValue(mockLike);
      mockPrisma.route.update.mockResolvedValue({});

      const result = await addLike(mockUserId, { routeId: mockRouteId });

      expect(mockPrisma.like.create).toHaveBeenCalledWith({
        data: { userId: mockUserId, routeId: mockRouteId },
      });
      expect(result).toEqual(mockLike);
    });

    it('이미 좋아요가 존재할 때 기존 좋아요를 반환해야 한다', async () => {
      const existingLike = {
        userId: mockUserId,
        placeId: mockPlaceId,
        routeId: null,
      };
      mockPrisma.like.findFirst.mockResolvedValue(existingLike);

      const result = await addLike(mockUserId, { placeId: mockPlaceId });

      expect(mockPrisma.like.create).not.toHaveBeenCalled();
      expect(result).toEqual(existingLike);
    });

    it('placeId와 routeId 모두 제공되지 않을 때 에러를 던져야 한다', async () => {
      await expect(addLike(mockUserId, {})).rejects.toThrow(
        'Place ID or Route ID is required.',
      );
      expect(mockedDb.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('removeLike', () => {
    it('placeId만 제공될 때 좋아요가 성공적으로 제거되어야 한다', async () => {
      mockPrisma.like.deleteMany.mockResolvedValue({ count: 1 });
      mockPrisma.place.update.mockResolvedValue({});

      const result = await removeLike(mockUserId, { placeId: mockPlaceId });

      expect(mockPrisma.like.deleteMany).toHaveBeenCalledWith({
        where: { userId: mockUserId, placeId: mockPlaceId, routeId: undefined },
      });
      expect(mockPrisma.place.update).toHaveBeenCalledWith({
        where: { id: mockPlaceId },
        data: { likesCount: { decrement: 1 } },
      });
      expect(result).toEqual({ count: 1 });
    });

    it('routeId만 제공될 때 좋아요가 성공적으로 제거되어야 한다', async () => {
      mockPrisma.like.deleteMany.mockResolvedValue({ count: 1 });
      mockPrisma.route.update.mockResolvedValue({});

      const result = await removeLike(mockUserId, { routeId: mockRouteId });

      expect(mockPrisma.like.deleteMany).toHaveBeenCalledWith({
        where: { userId: mockUserId, placeId: undefined, routeId: mockRouteId },
      });
      expect(mockPrisma.route.update).toHaveBeenCalledWith({
        where: { id: mockRouteId },
        data: { likesCount: { decrement: 1 } },
      });
      expect(result).toEqual({ count: 1 });
    });

    it('placeId와 routeId 모두 제공되지 않을 때 에러를 던져야 한다', async () => {
      await expect(removeLike(mockUserId, {})).rejects.toThrow(
        'Place ID or Route ID is required.',
      );
      expect(mockedDb.$transaction).not.toHaveBeenCalled();
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

  describe('getLikedPlacesByUserId', () => {
    const mockPlace = {
      id: mockPlaceId,
      name: 'Test Place',
      district: '강남구',
      category: PlaceCategory.MEAL,
      createdAt: new Date(),
      updatedAt: new Date(),
      likesCount: 3,
    };
    const mockLikedItem = { place: mockPlace };

    it('사용자가 좋아요한 장소 목록을 페이징과 함께 올바르게 반환해야 한다', async () => {
      (mockedDb.$transaction as jest.Mock).mockResolvedValue([
        [mockLikedItem],
        1,
      ]);

      const result = await getLikedPlacesByUserId(mockUserId, 1, 5);

      expect(result.places).toHaveLength(1);
      expect(result.places[0].id).toBe(mockPlaceId);
      expect(result.totalCount).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(result.currentPage).toBe(1);
    });

    it('districtId로 필터링이 올바르게 작동해야 한다', async () => {
      (mockedDb.$transaction as jest.Mock).mockResolvedValue([
        [mockLikedItem],
        1,
      ]);

      const gangnamDistrict = SEOUL_DISTRICTS.find((d) => d.name === '강남구');
      await getLikedPlacesByUserId(mockUserId, 1, 5, gangnamDistrict?.id, null);

      expect(mockedDb.$transaction).toHaveBeenCalled();
    });

    it('category로 필터링이 올바르게 작동해야 한다', async () => {
      (mockedDb.$transaction as jest.Mock).mockResolvedValue([
        [mockLikedItem],
        1,
      ]);

      await getLikedPlacesByUserId(mockUserId, 1, 5, null, PlaceCategory.MEAL);

      expect(mockedDb.$transaction).toHaveBeenCalled();
    });
  });

  describe('getLikedRoutesByUserId', () => {
    const mockRoute = {
      id: mockRouteId,
      title: 'Test Route',
      districtId: 'gangnam',
      createdAt: new Date(),
      updatedAt: new Date(),
      likesCount: 2,
    };
    const mockLikedItem = { route: mockRoute };

    it('사용자가 좋아요한 경로 목록을 페이징과 함께 올바르게 반환해야 한다', async () => {
      (mockedDb.$transaction as jest.Mock).mockResolvedValue([
        [mockLikedItem],
        1,
      ]);

      const result = await getLikedRoutesByUserId(mockUserId, 1, 5);

      expect(result.routes).toHaveLength(1);
      expect(result.routes[0].id).toBe(mockRouteId);
      expect(result.totalCount).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(result.currentPage).toBe(1);
    });

    it('districtId로 필터링이 올바르게 작동해야 한다', async () => {
      (mockedDb.$transaction as jest.Mock).mockResolvedValue([
        [mockLikedItem],
        1,
      ]);

      await getLikedRoutesByUserId(mockUserId, 1, 5, 'gangnam');

      expect(mockedDb.$transaction).toHaveBeenCalled();
    });
  });

  describe('getLikeInfo', () => {
    it('placeId만 제공될 때 좋아요 개수와 사용자 좋아요 여부를 올바르게 반환해야 한다', async () => {
      (mockedDb.place.findUnique as jest.Mock).mockResolvedValue({
        likesCount: 5,
      });
      (mockedDb.like.findFirst as jest.Mock).mockResolvedValue({
        id: 'like-id',
      });

      const result = await getLikeInfo({ placeId: mockPlaceId }, mockUserId);

      expect(mockedDb.place.findUnique).toHaveBeenCalledWith({
        where: { id: mockPlaceId },
        select: { likesCount: true },
      });
      expect(result).toEqual({ count: 5, liked: true });
    });

    it('routeId만 제공될 때 좋아요 개수와 사용자 좋아요 여부를 올바르게 반환해야 한다', async () => {
      (mockedDb.route.findUnique as jest.Mock).mockResolvedValue({
        likesCount: 10,
      });
      (mockedDb.like.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await getLikeInfo({ routeId: mockRouteId }, mockUserId);

      expect(mockedDb.route.findUnique).toHaveBeenCalledWith({
        where: { id: mockRouteId },
        select: { likesCount: true },
      });
      expect(result).toEqual({ count: 10, liked: false });
    });

    it('userId가 제공되지 않을 때 liked가 false로 반환되어야 한다', async () => {
      (mockedDb.place.findUnique as jest.Mock).mockResolvedValue({
        likesCount: 3,
      });

      const result = await getLikeInfo({ placeId: mockPlaceId });

      expect(mockedDb.like.findFirst).not.toHaveBeenCalled();
      expect(result).toEqual({ count: 3, liked: false });
    });

    it('placeId와 routeId 모두 제공되지 않을 때 에러를 던져야 한다', async () => {
      await expect(getLikeInfo({})).rejects.toThrow(
        'Place ID or Route ID is required.',
      );
      expect(mockedDb.place.findUnique).not.toHaveBeenCalled();
      expect(mockedDb.route.findUnique).not.toHaveBeenCalled();
    });
  });
});
