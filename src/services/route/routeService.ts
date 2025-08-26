import { db } from '~/lib/db';
import { z } from 'zod';
import { RouteStopLabel, Prisma } from '@prisma/client';

// Helper function to convert Date objects to ISO strings
function serializeDatesInPlace<T extends { createdAt: Date; updatedAt: Date }>(place: T): Omit<T, 'createdAt' | 'updatedAt'> & { createdAt: string; updatedAt: string } {
  return {
    ...place,
    createdAt: place.createdAt.toISOString(),
    updatedAt: place.updatedAt.toISOString(),
  };
}

// Schema for creating a new route, used for validating client data
export const NewRouteApiSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  districtId: z.string().optional(), // districtId is now optional on the route itself
  places: z.array(
    z.object({
      placeId: z.string(),
      order: z.number().int(),
      label: z.enum(['MEAL', 'CAFE', 'BAR']),
    }),
  ),
});

type NewRouteInput = z.infer<typeof NewRouteApiSchema>;

// Schema for updating an existing route
export const UpdateRouteApiSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  districtId: z.string().optional(),
  // For updating places, we'll expect a full new list of stops
  // The client will send the complete desired state of places for the route
  places: z.array(
    z.object({
      placeId: z.string(),
      order: z.number().int(),
      label: z.enum(['MEAL', 'CAFE', 'BAR']),
    }),
  ).optional(), // Places array itself is optional for update
});

type UpdateRouteInput = z.infer<typeof UpdateRouteApiSchema>;

/**
 * Creates a new route with a flexible number of stops.
 * @param data - The data for the new route, conforming to NewRouteInput.
 * @param creatorId - The ID of the user creating the route.
 * @returns The newly created route with its places.
 */
export async function createRoute(data: NewRouteInput, creatorId: string) {
  const { name, description, districtId, places } = data;

  // Use a transaction to ensure the route and its places are created atomically
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
      place: true, // Include the full Place object for each stop
    },
  },
};

/**
 * Fetches a single route by its ID, including its places.
 * @param id - The ID of the route.
 * @returns The route with its places, or null if not found.
 */
export async function getRouteById(id: string, userId?: string) {
  // 1. Fetch the route with its places
  const routeWithLikes = await db.route.findUnique({
    where: { id },
    include: {
      ...routeInclude, // Includes places
      _count: { select: { likes: true } },
      likes: userId ? { where: { userId }, select: { userId: true } } : false,
    },
  });

  if (!routeWithLikes) {
    return null;
  }

  const placeIds = routeWithLikes.places.map(p => p.place.id);

  // 2. Get like counts for all places in one query
  const likeCounts = await db.like.groupBy({
    by: ['placeId'],
    where: { placeId: { in: placeIds } },
    _count: { placeId: true },
  });

  // 3. Get liked status for all places for the current user in one query
  const userLikes = userId ? await db.like.findMany({
    where: { userId, placeId: { in: placeIds } },
    select: { placeId: true },
  }) : [];
  
  const userLikedPlaceIds = new Set(userLikes.map(like => like.placeId));
  const placeIdToLikeCountMap = new Map(likeCounts.map(item => [item.placeId, item._count.placeId]));

  // 4. Enrich the places data
  const enrichedPlaces = routeWithLikes.places.map(routePlace => {
    const place = routePlace.place;
    return {
      ...routePlace,
      place: {
        ...serializeDatesInPlace(place),
        likesCount: placeIdToLikeCountMap.get(place.id) || 0,
        isLiked: userLikedPlaceIds.has(place.id),
      },
    };
  });

  // 5. Construct final object
  const isRouteLiked = !!(routeWithLikes.likes && routeWithLikes.likes.length > 0);
  const { _count, likes, ...routeData } = routeWithLikes;

  return {
    ...serializeDatesInPlace(routeData),
    places: enrichedPlaces,
    likesCount: _count.likes,
    isLiked: isRouteLiked,
  };
}

/**
 * Fetches all routes created by a specific user.
 * @param creatorId - The ID of the user.
 * @returns A list of routes created by the user.
 */
export async function getRoutesByCreatorId(
  creatorId: string,
  page: number = 1,
  limit: number = 5,
  districtId?: string | null,
) {
  const whereClause: any = { creatorId };

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

  const allPlaceIds = routesWithLikes.flatMap(route => route.places.map(rp => rp.place.id));

  const likeCounts = await db.like.groupBy({
    by: ['placeId'],
    where: { placeId: { in: allPlaceIds } },
    _count: { placeId: true },
  });

  const userLikes = creatorId ? await db.like.findMany({
    where: { userId: creatorId, placeId: { in: allPlaceIds } },
    select: { placeId: true },
  }) : [];

  const userLikedPlaceIds = new Set(userLikes.map(like => like.placeId));
  const placeIdToLikeCountMap = new Map(likeCounts.map(item => [item.placeId, item._count.placeId]));

  const routes = routesWithLikes.map(({ _count, likes, ...route }) => {
    const serializedRoute = serializeDatesInPlace(route);
    const serializedPlaces = route.places.map(rp => ({
      ...rp,
      place: {
        ...serializeDatesInPlace(rp.place),
        likesCount: placeIdToLikeCountMap.get(rp.place.id) || 0,
        isLiked: userLikedPlaceIds.has(rp.place.id),
      }
    }));
    return {
      ...serializedRoute,
      likesCount: _count.likes,
      isLiked: likes.length > 0,
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

/**
 * Fetches all public routes for a given district.
 * @param districtId - The ID of the district.
 * @param currentUserId - The ID of the current user (optional, for checking likes).
 * @returns A list of routes in the district.
 */
export async function getPublicRoutesByDistrict(
  districtId: string,
  currentUserId?: string,
) {
  const MAIN_ACCOUNT_ID = process.env.MAIN_ACCOUNT_ID;
  if (!MAIN_ACCOUNT_ID) {
    console.error('MAIN_ACCOUNT_ID is not defined in environment variables.');
    return []; // Return empty array if not defined
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

  const routesWithLikes = await db.route.findMany({
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
        : false,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const allPlaceIds = routesWithLikes.flatMap(route => route.places.map(rp => rp.place.id));

  const likeCounts = await db.like.groupBy({
    by: ['placeId'],
    where: { placeId: { in: allPlaceIds } },
    _count: { placeId: true },
  });

  const userLikes = currentUserId ? await db.like.findMany({
    where: { userId: currentUserId, placeId: { in: allPlaceIds } },
    select: { placeId: true },
  }) : [];

  const userLikedPlaceIds = new Set(userLikes.map(like => like.placeId));
  const placeIdToLikeCountMap = new Map(likeCounts.map(item => [item.placeId, item._count.placeId]));

  const routes = routesWithLikes.map(({ _count, likes, ...route }) => {
    const serializedRoute = serializeDatesInPlace(route);
    const serializedPlaces = route.places.map(rp => ({
      ...rp,
      place: {
        ...serializeDatesInPlace(rp.place),
        likesCount: placeIdToLikeCountMap.get(rp.place.id) || 0,
        isLiked: userLikedPlaceIds.has(rp.place.id),
      }
    }));
    return {
      ...serializedRoute,
      likesCount: _count.likes,
      isLiked: likes.length > 0,
      places: serializedPlaces,
    };
  });

  return routes;
}

/**
 * Deletes a route from the database.
 * @param routeId - The ID of the route to delete.
 * @param userId - The ID of the user attempting to delete the route (for authorization).
 * @returns The deleted route.
 * @throws Error if the route is not found or the user is not authorized.
 */
export async function deleteRoute(
  routeId: string,
  userId: string,
) {
  const routeToDelete = await db.route.findUnique({
    where: { id: routeId },
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

/**
 * Updates an existing route in the database.
 * @param routeId - The ID of the route to update.
 * @param userId - The ID of the user attempting to update the route (for authorization).
 * @param data - The partial data to update the route with, including an optional new list of places.
 * @returns The updated route.
 * @throws Error if the route is not found or the user is not authorized.
 */
export async function updateRoute(
  routeId: string,
  userId: string,
  data: UpdateRouteInput,
) {
  const routeToUpdate = await db.route.findUnique({
    where: { id: routeId },
  });

  if (!routeToUpdate) {
    throw new Error('Route not found.');
  }

  if (routeToUpdate.creatorId !== userId) {
    throw new Error('Unauthorized to update this route.');
  }

  return db.$transaction(async (prisma) => {
    // 1. Update main route details
    const updatedRoute = await prisma.route.update({
      where: { id: routeId },
      data: {
        name: data.name,
        description: data.description,
        districtId: data.districtId,
      },
    });

    // 2. If places are provided, delete existing RoutePlace records and create new ones
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