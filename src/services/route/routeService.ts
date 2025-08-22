import { db } from '~/lib/db';
import { z } from 'zod';
import { RouteStopLabel } from '@prisma/client';

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
  const routeWithLikes = await db.route.findUnique({
    where: { id },
    include: {
      ...routeInclude, // Include creator and places
      _count: {
        select: { likes: true },
      },
      likes: userId
        ? {
            where: {
              userId: userId,
            },
            select: {
              userId: true,
            },
          }
        : false, // Don't include likes if no userId
    },
  });

  if (!routeWithLikes) {
    return null;
  }

  const isLiked = userId && routeWithLikes.likes && routeWithLikes.likes.length > 0;

  const { _count, likes, ...route } = routeWithLikes;

  return {
    ...route,
    likesCount: _count.likes,
    isLiked: !!isLiked,
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
) {
  const whereClause = { creatorId };

  const [routesWithLikes, totalCount] = await db.$transaction([
    db.route.findMany({
      where: whereClause,
      include: {
        creator: {
          select: { id: true, name: true, image: true },
        },
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
        places: { // <<< ADDED THIS INCLUDE
          orderBy: {
            order: 'asc',
          },
          include: {
            place: true,
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

  const routes = routesWithLikes.map(({ _count, likes, ...route }) => ({
    ...route,
    likesCount: _count.likes,
    isLiked: likes.length > 0,
  }));

  return {
    routes,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}

/**
 * Fetches all routes created by a specific user within a given district.
 * @param creatorId - The ID of the user.
 * @param districtId - The ID of the district.
 * @returns A list of routes created by the user in the specified district.
 */
export async function getRoutesByCreatorIdAndDistrictId(
  creatorId: string,
  districtId: string,
) {
  const routesWithLikes = await db.route.findMany({
    where: {
      creatorId,
      districtId,
    },
    include: {
      creator: {
        select: { id: true, name: true, image: true },
      },
      _count: {
        select: { likes: true },
      },
      likes: {
        where: {
          userId: creatorId, // Assuming creator is the user whose likes we care about
        },
        select: {
          userId: true,
        },
      },
      places: { // <<< ADDED THIS INCLUDE
        orderBy: {
          order: 'asc',
        },
        include: {
          place: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const routes = routesWithLikes.map(({ _count, likes, ...route }) => ({
    ...route,
    likesCount: _count.likes,
    isLiked: likes.length > 0,
  }));

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