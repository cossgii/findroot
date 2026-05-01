import 'server-only';

import { PlaceCategory, Prisma } from '@prisma/client';
import { db } from '~/lib/db';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';
import { NotFoundError } from '~/src/utils/api-errors';

function serializeDates<T extends { createdAt: Date; updatedAt: Date }>(
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

  return db.$transaction(async (prisma) => {
    const existingLike = await prisma.like.findFirst({
      where: { userId, placeId, routeId },
    });

    if (existingLike) {
      return existingLike;
    }

    if (placeId) {
      const createLike = prisma.like.create({ data: { userId, placeId } });
      const updateCount = prisma.place.update({
        where: { id: placeId },
        data: { likesCount: { increment: 1 } },
      });
      const [newLike] = await Promise.all([createLike, updateCount]);
      return newLike;
    } else if (routeId) {
      const createLike = prisma.like.create({ data: { userId, routeId } });
      const updateCount = prisma.route.update({
        where: { id: routeId },
        data: { likesCount: { increment: 1 } },
      });
      const [newLike] = await Promise.all([createLike, updateCount]);
      return newLike;
    }
  });
}

export async function removeLike(
  userId: string,
  { placeId, routeId }: LikeInput,
) {
  if (!placeId && !routeId) {
    throw new Error('Place ID or Route ID is required.');
  }

  return db.$transaction(async (prisma) => {
    const where = { userId, placeId, routeId };
    const deletedResult = await prisma.like.deleteMany({ where });

    if (deletedResult.count > 0) {
      if (placeId) {
        await prisma.place.update({
          where: { id: placeId },
          data: { likesCount: { decrement: 1 } },
        });
      } else if (routeId) {
        await prisma.route.update({
          where: { id: routeId },
          data: { likesCount: { decrement: 1 } },
        });
      }
    }
    return deletedResult;
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
        place: true,
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
      return {
        ...serializeDates(like.place),
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
        route: true,
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
      return {
        ...serializeDates(like.route),
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

  let count = 0;
  if (placeId) {
    const place = await db.place.findUnique({
      where: { id: placeId },
      select: { likesCount: true },
    });
    if (!place) throw new NotFoundError('Place not found');
    count = place.likesCount;
  } else if (routeId) {
    const route = await db.route.findUnique({
      where: { id: routeId },
      select: { likesCount: true },
    });
    if (!route) throw new NotFoundError('Route not found');
    count = route.likesCount;
  }

  const liked = userId
    ? await getLikeStatus(userId, { placeId, routeId })
    : false;

  return { count, liked };
}
