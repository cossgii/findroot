/**
 * @jest-environment node
 */

import { db } from '~/lib/db';
import { getUserById, updateUser } from '~/src/services/user/userService';

jest.mock('~/lib/db', () => ({
  db: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const mockedDb = db as jest.Mocked<typeof db>;

const mockUser = {
  id: 'user-1',
  name: '홍길동',
  loginId: 'honggildong',
  email: 'hong@example.com',
  image: null,
};

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // getUserById
  // ============================================
  describe('getUserById', () => {
    it('존재하는 사용자를 반환한다', async () => {
      (mockedDb.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await getUserById('user-1');

      expect(result).toEqual(mockUser);
      expect(mockedDb.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: { id: true, name: true, loginId: true, email: true, image: true },
      });
    });

    it('존재하지 않는 사용자는 null을 반환한다', async () => {
      (mockedDb.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await getUserById('nonexistent');

      expect(result).toBeNull();
    });

    it('반환값에 password가 포함되지 않는다', async () => {
      (mockedDb.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await getUserById('user-1');

      expect(result).not.toHaveProperty('password');
    });
  });

  // ============================================
  // updateUser
  // ============================================
  describe('updateUser', () => {
    it('사용자 이름을 업데이트한다', async () => {
      const updatedUser = { ...mockUser, name: '수정된이름' };
      (mockedDb.user.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await updateUser('user-1', { name: '수정된이름' });

      expect(result.name).toBe('수정된이름');
      expect(mockedDb.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { name: '수정된이름' },
        select: { id: true, name: true, loginId: true, email: true, image: true },
      });
    });

    it('프로필 이미지를 업데이트한다', async () => {
      const updatedUser = { ...mockUser, image: 'https://example.com/image.png' };
      (mockedDb.user.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await updateUser('user-1', { image: 'https://example.com/image.png' });

      expect(result.image).toBe('https://example.com/image.png');
    });

    it('업데이트 결과에 password가 포함되지 않는다', async () => {
      (mockedDb.user.update as jest.Mock).mockResolvedValue(mockUser);

      const result = await updateUser('user-1', { name: '새이름' });

      expect(result).not.toHaveProperty('password');
    });
  });
});
