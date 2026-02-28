'server-only';

import { db } from '~/lib/db';
import { Prisma, RoutePurpose } from '@prisma/client';
import { NewRouteInput, UpdateRouteInput } from '~/src/schemas/route-schema';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '~/src/utils/api-errors';

function serializeDatesInPlace<T extends { createdAt: Date; updatedAt: Date }>(
  place: T,
): Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
} {
  return {
    ...place,
    createdAt: place.createdAt.toISOString(),
    updatedAt: place.updatedAt.toISOString(),
  };
}

export async function createRoute(data: NewRouteInput, creatorId: string) {
  const { name, description, districtId, places, purpose } = data;

  return db.$transaction(async (prisma) => {
    const newRoute = await prisma.route.create({
      data: {
        name,
        description: description || '',
        districtId,
        creatorId,
        purpose,
      },
    });

    await prisma.routePlace.createMany({
      data: places.map((p) => ({
        routeId: newRoute.id,
        placeId: p.placeId,
        order: p.order,
        label: p.label,
      })),
    });

    return newRoute;
  });
}

const routeInclude = {
  creator: {
    select: { id: true, name: true, image: true },
  },
  places: {
    orderBy: {
      order: 'asc' as const,
    },
    include: {
      place: true,
    },
  },
};

export async function getRouteById(id: string, userId?: string) {
  const routeWithLikes = await db.route.findUnique({
    where: { id },
    include: {
      ...routeInclude,
      _count: { select: { comments: true } },
      likes: userId ? { where: { userId }, select: { userId: true } } : false,
      places: {
        orderBy: {
          order: 'asc' as const,
        },
        include: {
          place: true,
          alternatives: {
            include: {
              place: true,
            },
          },
        },
      },
    },
  });

  if (!routeWithLikes) {
    return null;
  }

  const allPlaceIds = (routeWithLikes.places || []).flatMap((p) => [
    p.place.id,
    ...(p.alternatives || []).map((a) => a.place.id),
  ]);

  const userLikes = userId
    ? await db.like.findMany({
        where: { userId, placeId: { in: allPlaceIds } },
        select: { placeId: true },
      })
    : [];

  const userLikedPlaceIds = new Set(userLikes.map((like) => like.placeId));

  const enrichedPlaces = routeWithLikes.places.map((routePlace) => {
    const { ...place } = routePlace.place;

    const serializedAlternatives = (routePlace.alternatives || []).map(
      (alt) => ({
        ...alt,
        place: serializeDatesInPlace(alt.place),
      }),
    );

    return {
      ...routePlace,
      place: {
        ...serializeDatesInPlace(place),
        isLiked: userLikedPlaceIds.has(place.id),
      },
      alternatives: serializedAlternatives,
    };
  });

  const isRouteLiked = !!(
    routeWithLikes.likes && routeWithLikes.likes.length > 0
  );
  const { _count, likes, ...routeData } = routeWithLikes;

  return {
    ...serializeDatesInPlace(routeData),
    places: enrichedPlaces,
    commentsCount: _count.comments,
    isLiked: isRouteLiked,
  };
}

export async function getRoutesByCreatorId(
  creatorId: string,
  page: number = 1,
  limit: number = 5,
  districtId?: string | null,
) {
  const whereClause: Prisma.RouteWhereInput = { creatorId };

  if (districtId && districtId !== 'all') {
    whereClause.districtId = districtId;
  }

  const [routesWithData, totalCount] = await db.$transaction([
    db.route.findMany({
      where: whereClause,
      include: {
        ...routeInclude,
        _count: {
          select: { comments: true },
        },
        likes: {
          where: {
            userId: creatorId,
          },
          select: {
            userId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.route.count({ where: whereClause }),
  ]);

  const allPlaceIds = routesWithData.flatMap((route) =>
    (route.places || []).map((rp) => rp.place.id),
  );

  const userLikes = creatorId
    ? await db.like.findMany({
        where: { userId: creatorId, placeId: { in: allPlaceIds } },
        select: { placeId: true },
      })
    : [];
  const userLikedPlaceIds = new Set(userLikes.map((like) => like.placeId));

  const routes = routesWithData.map(({ _count, likes, ...route }) => {
    const serializedRoute = serializeDatesInPlace(route);
    const serializedPlaces = route.places.map((rp) => ({
      ...rp,
      place: {
        ...serializeDatesInPlace(rp.place),
        isLiked: userLikedPlaceIds.has(rp.place.id),
      },
    }));
    return {
      ...serializedRoute,
      commentsCount: _count.comments,
      isLiked: (likes || []).length > 0,
      places: serializedPlaces,
    };
  });

  return {
    routes,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}

export async function getRoutes(
  districtId?: string,
  currentUserId?: string,
  page: number = 1,
  limit: number = 5,
  purpose?: RoutePurpose,
  targetUserId?: string,
  isRepresentative?: boolean,
  orderByLikes?: boolean,
) {
  const whereClause: Prisma.RouteWhereInput = {};

  if (targetUserId) {
    whereClause.creatorId = targetUserId;
  }

  if (districtId && districtId !== 'all') {
    whereClause.districtId = districtId;
  }

  if (purpose && purpose !== 'ENTIRE') {
    whereClause.purpose = purpose;
  }

  if (isRepresentative !== undefined) {
    whereClause.isRepresentative = isRepresentative;
  }

  const orderBy: Prisma.RouteOrderByWithRelationInput = orderByLikes
    ? { likesCount: 'desc' }
    : { createdAt: 'desc' };

  const [routesWithData, totalCount] = await db.$transaction([
    db.route.findMany({
      where: whereClause,
      include: {
        ...routeInclude,
        _count: {
          select: { comments: true },
        },
        likes: currentUserId
          ? {
              where: {
                userId: currentUserId,
              },
              select: {
                userId: true,
              },
            }
          : undefined,
      },
      orderBy: orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.route.count({ where: whereClause }),
  ]);

  const allPlaceIds = routesWithData.flatMap((route) =>
    (route.places || []).filter((rp) => rp.place).map((rp) => rp.place.id),
  );

  const userLikes = currentUserId
    ? await db.like.findMany({
        where: { userId: currentUserId, placeId: { in: allPlaceIds } },
        select: { placeId: true },
      })
    : [];
  const userLikedPlaceIds = new Set(userLikes.map((like) => like.placeId));

  const routes = routesWithData.map(({ _count, likes, ...route }) => {
    const serializedRoute = serializeDatesInPlace(route);
    const serializedPlaces = (route.places || [])
      .filter((rp) => rp.place)
      .map((rp) => ({
        ...rp,
        place: {
          ...serializeDatesInPlace(rp.place),
          isLiked: userLikedPlaceIds.has(rp.place.id),
        },
      }));
    return {
      ...serializedRoute,
      commentsCount: _count.comments,
      isLiked: (likes || []).length > 0,
      places: serializedPlaces,
    };
  });

  return {
    routes,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}

export async function getAllPublicRoutes(
  districtId?: string,
  currentUserId?: string,
  page: number = 1,
  limit: number = 5,
  purpose?: RoutePurpose,
  targetUserId?: string, // Add targetUserId
  orderByLikes?: boolean,
) {
  const whereClause: Prisma.RouteWhereInput = {};

  if (districtId && districtId !== 'all') {
    whereClause.districtId = districtId;
  }

  if (purpose && purpose !== 'ENTIRE') {
    whereClause.purpose = purpose;
  }

  if (targetUserId) {
    // Add this condition
    whereClause.creatorId = targetUserId;
  }

  const orderBy: Prisma.RouteOrderByWithRelationInput = orderByLikes
    ? { likesCount: 'desc' }
    : { createdAt: 'desc' };

  const [routesWithData, totalCount] = await db.$transaction([
    db.route.findMany({
      where: whereClause,
      include: {
        ...routeInclude,
        _count: {
          select: { comments: true },
        },
        likes: currentUserId
          ? {
              where: {
                userId: currentUserId,
              },
              select: {
                userId: true,
              },
            }
          : undefined,
      },
      orderBy: orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.route.count({ where: whereClause }),
  ]);

  const allPlaceIds = routesWithData.flatMap((route) =>
    (route.places || []).filter((rp) => rp.place).map((rp) => rp.place.id),
  );

  const userLikes = currentUserId
    ? await db.like.findMany({
        where: { userId: currentUserId, placeId: { in: allPlaceIds } },
        select: { placeId: true },
      })
    : [];
  const userLikedPlaceIds = new Set(userLikes.map((like) => like.placeId));

  const routes = routesWithData.map(({ _count, likes, ...route }) => {
    const serializedRoute = serializeDatesInPlace(route);
    const serializedPlaces = (route.places || [])
      .filter((rp) => rp.place)
      .map((rp) => ({
        ...rp,
        place: {
          ...serializeDatesInPlace(rp.place),
          isLiked: userLikedPlaceIds.has(rp.place.id),
        },
      }));
    return {
      ...serializedRoute,
      commentsCount: _count.comments,
      isLiked: (likes || []).length > 0,
      places: serializedPlaces,
    };
  });

  return {
    routes,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}

export async function getFeaturedRoutes(
  districtId: string,
  creatorId?: string,
  currentUserId?: string,
  purpose?: RoutePurpose,
) {
  const targetCreatorId = creatorId || process.env.MAIN_ACCOUNT_ID;
  const limit = 3;

  if (districtId && districtId !== 'all') {
    const { routes: districtRepresentativeRoutes } = await getRoutes(
      districtId,
      currentUserId,
      1,
      limit,
      purpose,
      targetCreatorId,
      true,
      true,
    );
    if (districtRepresentativeRoutes.length > 0) {
      return {
        routes: districtRepresentativeRoutes,
        type: 'creator_representative',
      };
    }

    const { routes: districtFallbackRoutes } = await getRoutes(
      districtId,
      currentUserId,
      1,
      limit,
      purpose,
      targetCreatorId,
      undefined,
      true,
    );

    return { routes: districtFallbackRoutes, type: 'creator_fallback' };
  }

  const { routes: overallRepresentativeRoutes } = await getRoutes(
    undefined, // 모든 자치구
    currentUserId,
    1,
    limit,
    purpose,
    targetCreatorId,
    true,
    true,
  );
  if (overallRepresentativeRoutes.length > 0) {
    return {
      routes: overallRepresentativeRoutes,
      type: 'creator_representative_overall',
    };
  }

  const { routes: overallFallbackRoutes } = await getRoutes(
    undefined, // 모든 자치구
    currentUserId,
    1,
    limit,
    purpose,
    targetCreatorId,
    undefined, // isRepresentative = undefined (전체)
    true,
  );
  console.log(
    '--- getFeaturedRoutes returning overallFallbackRoutes ---',
    overallFallbackRoutes.length,
  );
  return { routes: overallFallbackRoutes, type: 'creator_fallback' };
}

export async function deleteRoute(routeId: string, userId: string) {
  const routeToDelete = await db.route.findUnique({
    where: { id: routeId },
    select: { id: true, creatorId: true },
  });

  if (!routeToDelete) {
    throw new NotFoundError('루트를 찾을 수 없습니다.');
  }

  if (routeToDelete.creatorId !== userId) {
    throw new ForbiddenError('이 루트를 삭제할 권한이 없습니다.');
  }

  return db.route.delete({
    where: { id: routeId },
  });
}

export async function updateRoute(
  routeId: string,
  userId: string,
  data: UpdateRouteInput,
) {
  const routeToUpdate = await db.route.findUnique({
    where: { id: routeId },
    select: { id: true, creatorId: true },
  });

  if (!routeToUpdate) {
    throw new NotFoundError('루트를 찾을 수 없습니다.');
  }

  if (routeToUpdate.creatorId !== userId) {
    throw new ForbiddenError('이 루트를 수정할 권한이 없습니다.');
  }

  return db.$transaction(async (prisma) => {
    const updatedRoute = await prisma.route.update({
      where: { id: routeId },
      data: {
        name: data.name,
        description: data.description,
        districtId: data.districtId,
        purpose: data.purpose,
      },
    });

    if (data.places !== undefined) {
      await prisma.routePlace.deleteMany({
        where: { routeId: routeId },
      });

      if (data.places.length > 0) {
        await prisma.routePlace.createMany({
          data: data.places.map((p) => ({
            routeId: routeId,
            placeId: p.placeId,
            order: p.order,
            label: p.label,
          })),
        });
      }
    }

    return updatedRoute;
  });
}

export async function updateRouteIsRepresentative(
  routeId: string,
  userId: string,
  isRepresentative: boolean,
) {
  const routeToUpdate = await db.route.findUnique({
    where: { id: routeId },
    select: { id: true, creatorId: true, districtId: true },
  });

  if (!routeToUpdate) {
    throw new NotFoundError('루트를 찾을 수 없습니다.');
  }

  if (routeToUpdate.creatorId !== userId) {
    throw new ForbiddenError('이 루트를 수정할 권한이 없습니다.');
  }

  if (isRepresentative) {
    if (!routeToUpdate.districtId) {
      throw new BadRequestError(
        '대표 루트는 자치구가 설정된 루트만 가능합니다.',
      );
    }

    const representativeRoutesCount = await db.route.count({
      where: {
        creatorId: userId,
        districtId: routeToUpdate.districtId,
        isRepresentative: true,
      },
    });

    if (representativeRoutesCount >= 3) {
      throw new BadRequestError(
        `해당 자치구에는 대표 루트를 최대 3개까지 설정할 수 있습니다. (현재 ${representativeRoutesCount}개)`,
      );
    }
  }

  const updatedRoute = await db.route.update({
    where: { id: routeId },
    data: {
      isRepresentative: isRepresentative,
    },
  });

  return updatedRoute;
}
