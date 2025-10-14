import { PlaceCategory, Prisma } from '@prisma/client';
import { db } from '~/lib/db';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';

function serializeDatesInPlace<T extends { createdAt: Date; updatedAt: Date }>(
  obj: T,
): Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
} {
  return {
    ...obj,
    createdAt: obj.createdAt.toISOString(),
    updatedAt: obj.updatedAt.toISOString(),
  };
}

interface LikeInput {
  placeId?: string;
  routeId?: string;
}

export async function addLike(userId: string, { placeId, routeId }: LikeInput) {
  if (!placeId && !routeId) {
    throw new Error('Place ID or Route ID is required.');
  }

  const where = placeId
    ? { userId_placeId: { userId, placeId } }
    : { userId_routeId: { userId, routeId: routeId! } };

  const create = {
    userId,
    placeId,
    routeId,
  };

  return db.like
    .upsert({
      where: where,
      create: create,
      update: {},
    })
    .catch((error) => {
      console.error('Prisma upsert error in addLike:', error);
      throw error;
    });
}

export async function removeLike(
  userId: string,
  { placeId, routeId }: LikeInput,
) {
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

export async function getLikeStatus(
  userId: string,
  { placeId, routeId }: LikeInput,
) {
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

export async function getLikedPlacesByUserId(
  userId: string,
  page: number = 1,
  limit: number = 5,
  districtId?: string | null,
  category?: PlaceCategory | null,
) {
  const whereClause: Prisma.LikeWhereInput = {
    userId,
    placeId: { not: null },
    place: {},
  };

  if (districtId && districtId !== 'all') {
    const districtName = SEOUL_DISTRICTS.find((d) => d.id === districtId)?.name;
    if (districtName) {
      (whereClause.place as Prisma.PlaceWhereInput).district = districtName;
    }
  }

  if (category) {
    (whereClause.place as Prisma.PlaceWhereInput).category = category;
  }

  const [likedItems, totalCount] = await db.$transaction([
    db.like.findMany({
      where: whereClause,
      include: {
        place: {
          include: {
            _count: {
              select: { likes: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.like.count({ where: whereClause }),
  ]);

  const places = likedItems
    .map((like) => {
      if (!like.place) return null;
      const { _count, ...placeDetails } = like.place;
      return {
        ...serializeDatesInPlace(placeDetails),
        likesCount: _count.likes,
        isLiked: true,
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  return {
    places,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}

export async function getLikedRoutesByUserId(
  userId: string,
  page: number = 1,
  limit: number = 5,
  districtId?: string | null,
) {
  const whereClause: Prisma.LikeWhereInput = {
    userId,
    routeId: { not: null },
  };

  if (districtId && districtId !== 'all') {
    (whereClause.route as Prisma.RouteWhereInput) = {
      districtId: districtId,
    };
  }

  const [likedItems, totalCount] = await db.$transaction([
    db.like.findMany({
      where: whereClause,
      include: {
        route: {
          include: {
            _count: {
              select: { likes: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.like.count({ where: whereClause }),
  ]);

  const routes = likedItems
    .map((like) => {
      if (!like.route) return null;
      const { _count, ...routeDetails } = like.route;
      return {
        ...serializeDatesInPlace(routeDetails),
        likesCount: _count.likes,
        isLiked: true,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  return {
    routes,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
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
