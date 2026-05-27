/**
 * @jest-environment node
 */

import { db } from '~/lib/db';
import {
  followUser,
  unfollowUser,
  getFollowStatus,
  getFollowers,
  getFollowing,
} from '~/src/services/user/followService';
import { BadRequestError } from '~/src/utils/api-errors';

jest.mock('~/lib/db', () => ({
  db: {
    follow: {
      upsert: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

const mockedDb = db as jest.Mocked<typeof db>;

const mockFollow = {
  followerId: 'user-1',
  followingId: 'user-2',
  createdAt: new Date(),
};

describe('followService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // followUser
  // ============================================
  describe('followUser', () => {
    it('팔로우를 성공적으로 수행한다', async () => {
      (mockedDb.follow.upsert as jest.Mock).mockResolvedValue(mockFollow);

      const result = await followUser('user-1', 'user-2');

      expect(result).toEqual(mockFollow);
      expect(mockedDb.follow.upsert).toHaveBeenCalledWith({
        where: { followerId_followingId: { followerId: 'user-1', followingId: 'user-2' } },
        create: { followerId: 'user-1', followingId: 'user-2' },
        update: {},
      });
    });

    it('자기 자신을 팔로우하면 BadRequestError를 던진다', async () => {
      await expect(followUser('user-1', 'user-1')).rejects.toThrow(BadRequestError);
      expect(mockedDb.follow.upsert).not.toHaveBeenCalled();
    });

    it('이미 팔로우한 사용자를 다시 팔로우해도 upsert로 처리된다', async () => {
      (mockedDb.follow.upsert as jest.Mock).mockResolvedValue(mockFollow);

      await followUser('user-1', 'user-2');

      expect(mockedDb.follow.upsert).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================
  // unfollowUser
  // ============================================
  describe('unfollowUser', () => {
    it('언팔로우를 성공적으로 수행한다', async () => {
      (mockedDb.follow.delete as jest.Mock).mockResolvedValue(mockFollow);

      const result = await unfollowUser('user-1', 'user-2');

      expect(result).toEqual(mockFollow);
      expect(mockedDb.follow.delete).toHaveBeenCalledWith({
        where: {
          followerId_followingId: { followerId: 'user-1', followingId: 'user-2' },
        },
      });
    });
  });

  // ============================================
  // getFollowStatus
  // ============================================
  describe('getFollowStatus', () => {
    it('팔로우 중인 경우 true를 반환한다', async () => {
      (mockedDb.follow.findUnique as jest.Mock).mockResolvedValue(mockFollow);

      const result = await getFollowStatus('user-1', 'user-2');

      expect(result).toBe(true);
    });

    it('팔로우하지 않은 경우 false를 반환한다', async () => {
      (mockedDb.follow.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await getFollowStatus('user-1', 'user-2');

      expect(result).toBe(false);
    });
  });

  // ============================================
  // getFollowers
  // ============================================
  describe('getFollowers', () => {
    it('팔로워 목록을 반환한다', async () => {
      const mockFollowers = [
        { ...mockFollow, follower: { id: 'user-1', name: '팔로워1', image: null } },
      ];
      (mockedDb.follow.findMany as jest.Mock).mockResolvedValue(mockFollowers);

      const result = await getFollowers('user-2');

      expect(result).toHaveLength(1);
      expect(mockedDb.follow.findMany).toHaveBeenCalledWith({
        where: { followingId: 'user-2' },
        include: { follower: { select: { id: true, name: true, image: true } } },
      });
    });

    it('팔로워가 없으면 빈 배열을 반환한다', async () => {
      (mockedDb.follow.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getFollowers('user-2');

      expect(result).toHaveLength(0);
    });
  });

  // ============================================
  // getFollowing
  // ============================================
  describe('getFollowing', () => {
    it('팔로잉 목록을 반환한다', async () => {
      const mockFollowing = [
        { ...mockFollow, following: { id: 'user-2', name: '팔로잉1', image: null } },
      ];
      (mockedDb.follow.findMany as jest.Mock).mockResolvedValue(mockFollowing);

      const result = await getFollowing('user-1');

      expect(result).toHaveLength(1);
      expect(mockedDb.follow.findMany).toHaveBeenCalledWith({
        where: { followerId: 'user-1' },
        include: { following: { select: { id: true, name: true, image: true } } },
      });
    });

    it('팔로잉이 없으면 빈 배열을 반환한다', async () => {
      (mockedDb.follow.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getFollowing('user-1');

      expect(result).toHaveLength(0);
    });
  });
});
