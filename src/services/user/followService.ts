import { db } from '~/lib/db';

export async function followUser(followerId: string, followingId: string) {
  if (followerId === followingId) {
    throw new Error('Cannot follow yourself.');
  }

  return db.follow.create({
    data: {
      followerId,
      followingId,
    },
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
