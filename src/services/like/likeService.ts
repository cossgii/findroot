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

export async function getLikedPlacesByUserId(userId: string) {
  return db.like.findMany({
    where: {
      userId,
      placeId: { not: null },
    },
    include: {
      place: true, // 좋아요 누른 장소 정보 포함
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getLikedRoutesByUserId(userId: string) {
  return db.like.findMany({
    where: {
      userId,
      routeId: { not: null },
    },
    include: {
      route: true, // 좋아요 누른 루트 정보 포함
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}
