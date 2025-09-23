/**
 * @jest-environment node
 */

import { db } from '~/lib/db';
import {
  createPlace,
  deletePlace,
  updatePlace,
  DuplicatePlaceError,
} from '~/src/services/place/placeService';
import { PlaceCategory } from '~/src/types/shared';

// 1. Prisma Client 모의 처리
jest.mock('~/lib/db', () => ({
  db: {
    place: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const mockedDb = db as jest.Mocked<typeof db>;

describe('placeService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- createPlace 테스트 ---
  describe('createPlace', () => {
    const creatorId = 'user-1';
    const placeData = {
      name: 'Test Place',
      latitude: 37.123,
      longitude: 127.123,
      address: 'Test Address',
      description: 'Test Description',
      category: PlaceCategory.MEAL,
    };

    it('성공적으로 새로운 장소를 생성해야 한다', async () => {
      // Arrange
      (mockedDb.place.findFirst as jest.Mock).mockResolvedValue(null); // 중복 없음
      const expectedPlace = {
        ...placeData,
        id: 'place-1',
        creatorId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (mockedDb.place.create as jest.Mock).mockResolvedValue(expectedPlace);

      // Act
      const result = await createPlace(placeData, creatorId);

      // Assert
      expect(mockedDb.place.findFirst).toHaveBeenCalledWith({
        where: { creatorId, address: placeData.address },
      });
      expect(mockedDb.place.create).toHaveBeenCalledWith({
        data: { ...placeData, creatorId },
      });
      // serializeDatesInPlace 함수가 있으므로 주요 속성만 비교
      expect(result.name).toBe(expectedPlace.name);
      expect(result.address).toBe(expectedPlace.address);
    });

    it('동일한 주소의 장소가 이미 존재하면 DuplicatePlaceError를 던져야 한다', async () => {
      // Arrange
      (mockedDb.place.findFirst as jest.Mock).mockResolvedValue({
        id: 'existing-place',
      });

      // Act & Assert
      await expect(createPlace(placeData, creatorId)).rejects.toThrow(
        new DuplicatePlaceError('이미 동일한 주소의 장소를 등록하셨습니다.'),
      );
      expect(mockedDb.place.create).not.toHaveBeenCalled();
    });
  });

  // --- deletePlace 테스트 ---
  describe('deletePlace', () => {
    const placeId = 'place-1';
    const userId = 'user-1';

    it('사용자가 장소의 소유자일 경우, 성공적으로 장소를 삭제해야 한다', async () => {
      // Arrange
      (mockedDb.place.findUnique as jest.Mock).mockResolvedValue({
        id: placeId,
        creatorId: userId,
      });
      (mockedDb.place.delete as jest.Mock).mockResolvedValue({ id: placeId });

      // Act
      await deletePlace(placeId, userId);

      // Assert
      expect(mockedDb.place.findUnique).toHaveBeenCalledWith({
        where: { id: placeId },
      });
      expect(mockedDb.place.delete).toHaveBeenCalledWith({
        where: { id: placeId },
      });
    });

    it('장소가 존재하지 않으면 에러를 던져야 한다', async () => {
      // Arrange
      (mockedDb.place.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(deletePlace(placeId, userId)).rejects.toThrow(
        'Place not found.',
      );
    });

    it('사용자가 소유자가 아니면 에러를 던져야 한다', async () => {
      // Arrange
      (mockedDb.place.findUnique as jest.Mock).mockResolvedValue({
        id: placeId,
        creatorId: 'another-user',
      });

      // Act & Assert
      await expect(deletePlace(placeId, userId)).rejects.toThrow(
        'Unauthorized to delete this place.',
      );
    });
  });

  // --- updatePlace 테스트 ---
  describe('updatePlace', () => {
    const placeId = 'place-1';
    const userId = 'user-1';
    const updateData = { name: 'Updated Name' };

    it('사용자가 장소의 소유자일 경우, 성공적으로 장소를 수정해야 한다', async () => {
      // Arrange
      (mockedDb.place.findUnique as jest.Mock).mockResolvedValue({
        id: placeId,
        creatorId: userId,
      });
      (mockedDb.place.update as jest.Mock).mockResolvedValue({
        id: placeId,
        ...updateData,
      });

      // Act
      await updatePlace(placeId, userId, updateData);

      // Assert
      expect(mockedDb.place.update).toHaveBeenCalledWith({
        where: { id: placeId },
        data: updateData,
      });
    });

    it('사용자가 소유자가 아니면 에러를 던져야 한다', async () => {
      // Arrange
      (mockedDb.place.findUnique as jest.Mock).mockResolvedValue({
        id: placeId,
        creatorId: 'another-user',
      });

      // Act & Assert
      await expect(updatePlace(placeId, userId, updateData)).rejects.toThrow(
        'Unauthorized to update this place.',
      );
    });
  });
});
