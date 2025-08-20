import { db } from '~/lib/db';

interface LikeInput {
  placeId?: string;
  routeId?: string;
}

export async function addLike(userId: string, { placeId, routeId }: LikeInput) {
  if (!placeId && !routeId) {
    throw new Error('Place ID or Route ID is required.');
  }
  return db.like.create({
    data: {
      userId,
      placeId,
      routeId,
    },
  });
}

export async function removeLike(userId: string, { placeId, routeId }: LikeInput) {
  if (!placeId && !routeId) {
    throw new Error('Place ID or Route ID is required.');
  }
  return db.like.deleteMany({
    where: {
      userId,
      placeId,
      routeId,
    },
  });
}

export async function getLikeStatus(userId: string, { placeId, routeId }: LikeInput) {
  if (!placeId && !routeId) {
    return false;
  }
  const like = await db.like.findFirst({
    where: {
      userId,
      ...(placeId && { placeId }),
      ...(routeId && { routeId }),
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

export async function getRouteLikesCount(routeId: string) {
  return db.like.count({
    where: {
      routeId,
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

export async function getLikeInfo(
  { placeId, routeId }: LikeInput,
  userId?: string,
) {
  if (!placeId && !routeId) {
    throw new Error('Place ID or Route ID is required.');
  }

  const where = placeId ? { placeId } : { routeId };

  const countPromise = db.like.count({ where });

  const likedPromise = userId
    ? db.like
        .findFirst({
          where: {
            userId,
            ...where,
          },
        })
        .then((like) => !!like)
    : Promise.resolve(false);

  const [count, liked] = await Promise.all([countPromise, likedPromise]);

  return { count, liked };
}
