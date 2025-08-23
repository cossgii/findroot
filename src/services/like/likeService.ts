import { db } from '~/lib/db';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';

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

export async function getLikedPlacesByUserId(
  userId: string,
  page: number = 1,
  limit: number = 5,
  districtId?: string | null,
) {
  const whereClause: any = {
    userId,
    placeId: { not: null },
  };

  if (districtId && districtId !== 'all') {
    const districtName = SEOUL_DISTRICTS.find((d) => d.id === districtId)?.name;
    if (districtName) {
      whereClause.place = {
        district: districtName,
      };
    }
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
        ...placeDetails,
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
  const whereClause: any = {
    userId,
    routeId: { not: null },
  };

  if (districtId && districtId !== 'all') {
    whereClause.route = {
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
        ...routeDetails,
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
