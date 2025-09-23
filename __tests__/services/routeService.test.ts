/**
 * @jest-environment node
 */

import { db } from '~/lib/db';
import {
  createRoute,
  deleteRoute,
  updateRoute, // updateRoute import 추가
} from '~/src/services/route/routeService';
import { RouteStopLabel } from '~/src/types/shared';

// Prisma Client 모의 처리
jest.mock('~/lib/db', () => ({
  db: {
    route: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(), // update mock 추가
    },
    routePlace: {
      createMany: jest.fn(),
      deleteMany: jest.fn(), // update 시 사용될 수 있으므로 추가
    },
    $transaction: jest.fn(),
  },
}));

const mockedDb = db as jest.Mocked<typeof db>;

describe('routeService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- createRoute 테스트 ---
  describe('createRoute', () => {
    it('성공적으로 새로운 루트와 관련 장소들을 생성해야 한다', async () => {
      // Arrange
      const creatorId = 'user-1';
      const routeData = {
        name: 'Test Route',
        description: 'A great route',
        districtId: 'Gangnam-gu',
        places: [
          { placeId: 'place-1', order: 1, label: RouteStopLabel.MEAL },
          { placeId: 'place-2', order: 2, label: RouteStopLabel.CAFE },
        ],
      };
      const createdRoute = { id: 'route-1', ...routeData };

      (mockedDb.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const prisma = {
          route: {
            create: jest.fn().mockResolvedValue(createdRoute),
          },
          routePlace: {
            createMany: jest.fn().mockResolvedValue({ count: 2 }),
          },
        };
        return callback(prisma);
      });

      // Act
      const result = await createRoute(routeData, creatorId);

      // Assert
      expect(mockedDb.$transaction).toHaveBeenCalledTimes(1);
      expect(result.id).toBe('route-1');
      expect(result.name).toBe(routeData.name);
    });
  });

  // --- updateRoute 테스트 (추가된 부분) ---
  describe('updateRoute', () => {
    const routeId = 'route-1';
    const userId = 'user-1';
    const updateData = {
      name: 'Updated Test Route',
      description: 'An updated great route',
    };

    it('사용자가 루트의 소유자일 경우, 성공적으로 루트를 수정해야 한다', async () => {
      // Arrange
      (mockedDb.route.findUnique as jest.Mock).mockResolvedValue({ id: routeId, creatorId: userId });
      (mockedDb.$transaction as jest.Mock).mockImplementation(async (callback) => callback(mockedDb));
      (mockedDb.route.update as jest.Mock).mockResolvedValue({ id: routeId, ...updateData });

      // Act
      const result = await updateRoute(routeId, userId, updateData);

      // Assert
      expect(mockedDb.route.findUnique).toHaveBeenCalledWith({ where: { id: routeId } });
      expect(mockedDb.route.update).toHaveBeenCalledWith({
        where: { id: routeId },
        data: updateData,
      });
      expect(result.name).toBe(updateData.name);
    });

    it('루트가 존재하지 않으면 에러를 던져야 한다', async () => {
      // Arrange
      (mockedDb.route.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(updateRoute(routeId, userId, updateData)).rejects.toThrow('Route not found.');
    });

    it('사용자가 소유자가 아니면 에러를 던져야 한다', async () => {
      // Arrange
      (mockedDb.route.findUnique as jest.Mock).mockResolvedValue({ id: routeId, creatorId: 'another-user' });

      // Act & Assert
      await expect(updateRoute(routeId, userId, updateData)).rejects.toThrow('Unauthorized to update this route.');
      expect(mockedDb.route.update).not.toHaveBeenCalled();
    });
  });

  // --- deleteRoute 테스트 ---
  describe('deleteRoute', () => {
    const routeId = 'route-1';
    const userId = 'user-1';

    it('사용자가 루트의 소유자일 경우, 성공적으로 루트를 삭제해야 한다', async () => {
      // Arrange
      (mockedDb.route.findUnique as jest.Mock).mockResolvedValue({ id: routeId, creatorId: userId });
      (mockedDb.route.delete as jest.Mock).mockResolvedValue({ id: routeId });

      // Act
      await deleteRoute(routeId, userId);

      // Assert
      expect(mockedDb.route.findUnique).toHaveBeenCalledWith({ where: { id: routeId } });
      expect(mockedDb.route.delete).toHaveBeenCalledWith({ where: { id: routeId } });
    });

    it('루트가 존재하지 않으면 에러를 던져야 한다', async () => {
      // Arrange
      (mockedDb.route.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(deleteRoute(routeId, userId)).rejects.toThrow('Route not found.');
    });

    it('사용자가 소유자가 아니면 에러를 던져야 한다', async () => {
      // Arrange
      (mockedDb.route.findUnique as jest.Mock).mockResolvedValue({ id: routeId, creatorId: 'another-user' });

      // Act & Assert
      await expect(deleteRoute(routeId, userId)).rejects.toThrow('Unauthorized to delete this route.');
    });
  });
});
