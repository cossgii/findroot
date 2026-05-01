import { db } from '~/lib/db';
import { BadRequestError } from '~/src/utils/api-errors';

export async function followUser(followerId: string, followingId: string) {
  if (followerId === followingId) {
    throw new BadRequestError('자기 자신을 팔로우할 수 없습니다.');
  }

  return db.follow.upsert({
    where: { followerId_followingId: { followerId, followingId } },
    create: { followerId, followingId },
    update: {},
  });
}

export async function unfollowUser(followerId: string, followingId: string) {
  return db.follow.delete({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  });
}

export async function getFollowStatus(followerId: string, followingId: string) {
  const follow = await db.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  });
  return !!follow;
}

export async function getFollowers(userId: string) {
  return db.follow.findMany({
    where: { followingId: userId },
    include: {
      follower: {
        select: { id: true, name: true, image: true },
      },
    },
  });
}

export async function getFollowing(userId: string) {
  return db.follow.findMany({
    where: { followerId: userId },
    include: {
      following: {
        select: { id: true, name: true, image: true },
      },
    },
  });
}
