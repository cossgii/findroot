import { db } from '~/lib/db';

export async function addLike(userId: string, placeId: string) {
  return db.like.create({
    data: {
      userId,
      placeId,
    },
  });
}

export async function removeLike(userId: string, placeId: string) {
  return db.like.deleteMany({
    where: {
      userId,
      placeId,
    },
  });
}

export async function getLikeStatus(userId: string, placeId: string) {
  const like = await db.like.findUnique({
    where: {
      userId_placeId: {
        userId,
        placeId,
      },
    },
  });
  return !!like;
}

export async function getPlaceLikesCount(placeId: string) {
  return db.like.count({
    where: {
      placeId,
    },
  });
}
