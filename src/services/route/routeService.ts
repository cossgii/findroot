import { db } from '~/lib/db';
import { Prisma } from '@prisma/client';
import { NewRouteInput, UpdateRouteInput } from '~/src/schemas/route-schema';

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
  const { name, description, districtId, places } = data;

  return db.$transaction(async (prisma) => {
    const newRoute = await prisma.route.create({
      data: {
        name,
        description,
        districtId,
        creatorId,
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
      place: {
        include: {
          _count: { select: { likes: true } },
        },
      },
    },
  },
};

export async function getRouteById(id: string, userId?: string) {
  const routeWithLikes = await db.route.findUnique({
    where: { id },
    include: {
      ...routeInclude,
      _count: { select: { likes: true } },
      likes: userId ? { where: { userId }, select: { userId: true } } : false,
    },
  });

  if (!routeWithLikes) {
    return null;
  }

  const allPlaceIds = (routeWithLikes.places || []).map((p) => p.place.id);

  const userLikes = userId
    ? await db.like.findMany({
        where: { userId, placeId: { in: allPlaceIds } },
        select: { placeId: true },
      })
    : [];

  const userLikedPlaceIds = new Set(userLikes.map((like) => like.placeId));

  const enrichedPlaces = routeWithLikes.places.map((routePlace) => {
    const { _count, ...place } = routePlace.place;
    return {
      ...routePlace,
      place: {
        ...serializeDatesInPlace(place),
        likesCount: _count.likes,
        isLiked: userLikedPlaceIds.has(place.id),
      },
    };
  });

  const isRouteLiked = !!(
    routeWithLikes.likes && routeWithLikes.likes.length > 0
  );
  const { _count, likes, ...routeData } = routeWithLikes;

  return {
    ...serializeDatesInPlace(routeData),
    places: enrichedPlaces,
    likesCount: _count.likes,
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

  const [routesWithLikes, totalCount] = await db.$transaction([
    db.route.findMany({
      where: whereClause,
      include: {
        ...routeInclude,
        _count: {
          select: { likes: true },
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

  const allPlaceIds = routesWithLikes.flatMap((route) =>
    (route.places || []).map((rp) => rp.place.id),
  );

  const likeCounts = await db.like.groupBy({
    by: ['placeId'],
    where: { placeId: { in: allPlaceIds } },
    _count: { placeId: true },
  });

  const userLikes = creatorId
    ? await db.like.findMany({
        where: { userId: creatorId, placeId: { in: allPlaceIds } },
        select: { placeId: true },
      })
    : [];

  const userLikedPlaceIds = new Set(userLikes.map((like) => like.placeId));
  const placeIdToLikeCountMap = new Map(
    likeCounts.map((item) => [item.placeId, item._count.placeId]),
  );

  const routes = routesWithLikes.map(({ _count, likes, ...route }) => {
    const serializedRoute = serializeDatesInPlace(route);
    const serializedPlaces = route.places.map((rp) => ({
      ...rp,
      place: {
        ...serializeDatesInPlace(rp.place),
        likesCount: placeIdToLikeCountMap.get(rp.place.id) || 0,
        isLiked: userLikedPlaceIds.has(rp.place.id),
      },
    }));
    return {
      ...serializedRoute,
      likesCount: _count.likes,
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

export async function getPublicRoutesByDistrict(
  districtId: string,
  currentUserId?: string,
  page: number = 1,
  limit: number = 5,
) {
  const MAIN_ACCOUNT_ID = process.env.MAIN_ACCOUNT_ID;
  if (!MAIN_ACCOUNT_ID) {
    console.error('MAIN_ACCOUNT_ID is not defined in environment variables.');
    return { routes: [], totalCount: 0, totalPages: 0, currentPage: page };
  }

  const whereClause: Prisma.RouteWhereInput = {
    OR: [
      { creatorId: MAIN_ACCOUNT_ID },
      ...(currentUserId ? [{ creatorId: currentUserId }] : []),
    ],
  };

  if (districtId && districtId !== 'all') {
    whereClause.districtId = districtId;
  }

  const [routesWithLikes, totalCount] = await db.$transaction([
    db.route.findMany({
      where: whereClause,
      include: {
        ...routeInclude,
        _count: {
          select: { likes: true },
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
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.route.count({ where: whereClause }),
  ]);

  const allPlaceIds = routesWithLikes.flatMap((route) =>
    (route.places || []).map((rp) => rp.place.id),
  );

  const likeCounts = await db.like.groupBy({
    by: ['placeId'],
    where: { placeId: { in: allPlaceIds } },
    _count: { placeId: true },
  });

  const userLikes = currentUserId
    ? await db.like.findMany({
        where: { userId: currentUserId, placeId: { in: allPlaceIds } },
        select: { placeId: true },
      })
    : [];

  const userLikedPlaceIds = new Set(userLikes.map((like) => like.placeId));
  const placeIdToLikeCountMap = new Map(
    likeCounts.map((item) => [item.placeId, item._count.placeId]),
  );

  const routes = routesWithLikes.map(({ _count, likes, ...route }) => {
    const serializedRoute = serializeDatesInPlace(route);
    const serializedPlaces = route.places.map((rp) => ({
      ...rp,
      place: {
        ...serializeDatesInPlace(rp.place),
        likesCount: placeIdToLikeCountMap.get(rp.place.id) || 0,
        isLiked: userLikedPlaceIds.has(rp.place.id),
      },
    }));
    return {
      ...serializedRoute,
      likesCount: _count.likes,
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

export async function deleteRoute(routeId: string, userId: string) {
  const routeToDelete = await db.route.findUnique({
    where: { id: routeId },
    select: { id: true, creatorId: true },
  });

  if (!routeToDelete) {
    throw new Error('Route not found.');
  }

  if (routeToDelete.creatorId !== userId) {
    throw new Error('Unauthorized to delete this route.');
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
    throw new Error('Route not found.');
  }

  if (routeToUpdate.creatorId !== userId) {
    throw new Error('Unauthorized to update this route.');
  }

  return db.$transaction(async (prisma) => {
    const updatedRoute = await prisma.route.update({
      where: { id: routeId },
      data: {
        name: data.name,
        description: data.description,
        districtId: data.districtId,
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
