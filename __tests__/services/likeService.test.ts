/**
 * @jest-environment node
 */

import { db } from '~/lib/db';
import {
  addLike,
  removeLike,
  getLikeStatus,
  getLikeInfo,
} from '~/src/services/like/likeService';

// Prisma Client 모의 처리
jest.mock('~/lib/db', () => ({
  db: {
    like: {
      upsert: jest.fn(),
      deleteMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
    },
  },
}));

const mockedDb = db as jest.Mocked<typeof db>;

describe('likeService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const userId = 'user-1';
  const placeId = 'place-1';
  const routeId = 'route-1';

  // --- addLike 테스트 ---
  describe('addLike', () => {
    it('장소에 좋아요를 성공적으로 추가해야 한다', async () => {
      // Arrange
      (mockedDb.like.upsert as jest.Mock).mockResolvedValue({});

      // Act
      await addLike(userId, { placeId });

      // Assert
      expect(mockedDb.like.upsert).toHaveBeenCalledWith({
        where: { userId_placeId: { userId, placeId } },
        create: { userId, placeId, routeId: undefined },
        update: {},
      });
    });

    it('루트에 좋아요를 성공적으로 추가해야 한다', async () => {
      // Arrange
      (mockedDb.like.upsert as jest.Mock).mockResolvedValue({});

      // Act
      await addLike(userId, { routeId });

      // Assert
      expect(mockedDb.like.upsert).toHaveBeenCalledWith({
        where: { userId_routeId: { userId, routeId } },
        create: { userId, placeId: undefined, routeId },
        update: {},
      });
    });

    it('placeId와 routeId가 모두 없으면 에러를 던져야 한다', async () => {
      // Act & Assert
      await expect(addLike(userId, {})).rejects.toThrow(
        'Place ID or Route ID is required.'
      );
    });
  });

  // --- removeLike 테스트 ---
  describe('removeLike', () => {
    it('장소의 좋아요를 성공적으로 삭제해야 한다', async () => {
      // Arrange
      (mockedDb.like.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      // Act
      await removeLike(userId, { placeId });

      // Assert
      expect(mockedDb.like.deleteMany).toHaveBeenCalledWith({
        where: { userId, placeId, routeId: undefined },
      });
    });

    it('루트의 좋아요를 성공적으로 삭제해야 한다', async () => {
      // Arrange
      (mockedDb.like.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      // Act
      await removeLike(userId, { routeId });

      // Assert
      expect(mockedDb.like.deleteMany).toHaveBeenCalledWith({
        where: { userId, placeId: undefined, routeId },
      });
    });
  });

  // --- getLikeStatus 테스트 ---
  describe('getLikeStatus', () => {
    it('좋아요 상태이면 true를 반환해야 한다', async () => {
      // Arrange
      (mockedDb.like.findFirst as jest.Mock).mockResolvedValue({ id: 'like-1' });

      // Act
      const status = await getLikeStatus(userId, { placeId });

      // Assert
      expect(status).toBe(true);
    });

    it('좋아요 상태가 아니면 false를 반환해야 한다', async () => {
      // Arrange
      (mockedDb.like.findFirst as jest.Mock).mockResolvedValue(null);

      // Act
      const status = await getLikeStatus(userId, { placeId });

      // Assert
      expect(status).toBe(false);
    });
  });

  // --- getLikeInfo 테스트 ---
  describe('getLikeInfo', () => {
    it('좋아요 개수와 현재 사용자의 좋아요 여부를 반환해야 한다', async () => {
      // Arrange
      (mockedDb.like.count as jest.Mock).mockResolvedValue(15);
      (mockedDb.like.findFirst as jest.Mock).mockResolvedValue({ id: 'like-1' });

      // Act
      const result = await getLikeInfo({ placeId }, userId);

      // Assert
      expect(result.count).toBe(15);
      expect(result.liked).toBe(true);
    });

    it('사용자 ID가 없으면, 좋아요 여부는 항상 false여야 한다', async () => {
      // Arrange
      (mockedDb.like.count as jest.Mock).mockResolvedValue(10);

      // Act
      const result = await getLikeInfo({ placeId }); // userId is undefined

      // Assert
      expect(result.count).toBe(10);
      expect(result.liked).toBe(false);
      expect(mockedDb.like.findFirst).not.toHaveBeenCalled();
    });
  });
});