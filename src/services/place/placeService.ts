import { db } from '~/lib/db';
import { CreatePlaceInput } from './place-schema';
import { Place, PlaceCategory } from '@prisma/client';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';

// Helper function to convert Date objects to ISO strings
function serializeDatesInPlace<T extends { createdAt: Date; updatedAt: Date }>(place: T): Omit<T, 'createdAt' | 'updatedAt'> & { createdAt: string; updatedAt: string } {
  return {
    ...place,
    createdAt: place.createdAt.toISOString(),
    updatedAt: place.updatedAt.toISOString(),
  };
}

/**
 * Creates a new place in the database.
 * @param data - The data for the new place, conforming to the CreatePlaceInput schema.
 * @param creatorId - The ID of the user creating the place.
 * @returns The newly created place.
 */
export async function createPlace(data: CreatePlaceInput, creatorId: string) {
  const place = await db.place.create({
    data: {
      ...data,
      creatorId,
    },
  });
  return serializeDatesInPlace(place);
}

/**
 * Fetches places for a user's feed.
 * This includes places created by the users that the current user follows.
 * @param userId - The ID of the current user.
 * @returns A list of places for the user's feed.
 */
export async function getPlacesForFeed(userId: string) {
  // 1. Find all users that the current user follows.
  const followedUsers = await db.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });

  const followedUserIds = followedUsers.map((follow) => follow.followingId);

  // 2. Fetch all places created by those followed users.
  const places = await db.place.findMany({
    where: {
      creatorId: {
        in: followedUserIds,
      },
    },
    // Optional: Include creator info in the result
    include: {
      creator: {
        select: { id: true, name: true, image: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return places.map(serializeDatesInPlace);
}

/**
 * Fetches places for a given district.
 * @param districtName - The name of the district.
 * @returns A list of places in the specified district.
 */
export async function getPlacesByDistrict(
  districtName: string,
  userId: string | undefined,
  page: number = 1,
  limit: number = 12,
  sort: 'recent' | 'likes' = 'recent',
) {
  const whereClause =
    districtName === '전체'
      ? {} // Return all places if districtName is '전체'
      : {
          address: {
            contains: districtName,
          },
        };

  const orderByClause =
    sort === 'likes'
      ? { likes: { _count: 'desc' as const } }
      : { createdAt: 'desc' as const };

  const [placesWithLikes, totalCount] = await db.$transaction([
    db.place.findMany({
      where: whereClause,
      include: {
        creator: {
          select: { id: true, name: true, image: true },
        },
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
          : false,
      },
      orderBy: orderByClause,
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.place.count({ where: whereClause }),
  ]);

  const places = placesWithLikes.map(({ _count, likes, ...place }) => ({
    ...serializeDatesInPlace(place),
    likesCount: _count.likes,
    isLiked: !!(likes && likes.length > 0),
  }));

  return {
    places,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}

/**
 * Fetches a place by its ID.
 * @param id - The ID of the place.
 * @returns The place with the specified ID.
 */
export async function getPlaceById(id: string, userId?: string) {
  const placeWithLikes = await db.place.findUnique({
    where: { id },
    include: {
      creator: {
        select: { id: true, name: true, image: true },
      },
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

  if (!placeWithLikes) {
    return null;
  }

  const isLiked = userId && placeWithLikes.likes && placeWithLikes.likes.length > 0;

  const { _count, likes, ...place } = placeWithLikes;

  return {
    ...serializeDatesInPlace(place),
    likesCount: _count.likes,
    isLiked: !!isLiked,
  };
}

/**
 * Fetches places created by a specific user.
 * @param creatorId - The ID of the user who created the places.
 * @returns A list of places created by the specified user.
 */
export async function getPlacesByCreatorId(
  creatorId: string,
  page: number = 1,
  limit: number = 5,
  district?: string | null,
  currentUserId?: string,
) {
  const whereClause: any = { creatorId };

  if (district && district !== 'all') {
    const districtName = SEOUL_DISTRICTS.find((d) => d.id === district)?.name;
    if (districtName) {
      whereClause.district = districtName;
    }
  }

  const [placesWithLikes, totalCount] = await db.$transaction([
    db.place.findMany({
      where: whereClause,
      include: {
        creator: {
          select: { id: true, name: true, image: true },
        },
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
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.place.count({ where: whereClause }),
  ]);

  const places = placesWithLikes.map(({ _count, likes, ...place }) => ({
    ...serializeDatesInPlace(place),
    likesCount: _count.likes,
    isLiked: !!(likes && likes.length > 0),
  }));

  return {
    places,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}

/**
 * Deletes a place from the database.
 * @param placeId - The ID of the place to delete.
 * @param userId - The ID of the user attempting to delete the place (for authorization).
 * @returns The deleted place.
 * @throws Error if the place is not found or the user is not authorized.
 */
export async function deletePlace(placeId: string, userId: string) {
  const placeToDelete = await db.place.findUnique({
    where: { id: placeId },
  });

  if (!placeToDelete) {
    throw new Error('Place not found.');
  }

  if (placeToDelete.creatorId !== userId) {
    throw new Error('Unauthorized to delete this place.');
  }

  return db.place.delete({
    where: { id: placeId },
  });
}

/**
 * Updates an existing place in the database.
 * @param placeId - The ID of the place to update.
 * @param userId - The ID of the user attempting to update the place (for authorization).
 * @param data - The partial data to update the place with.
 * @returns The updated place.
 * @throws Error if the place is not found or the user is not authorized.
 */
export async function updatePlace(
  placeId: string,
  userId: string,
  data: Partial<Place>,
) {
  const placeToUpdate = await db.place.findUnique({
    where: { id: placeId },
  });

  if (!placeToUpdate) {
    throw new Error('Place not found.');
  }

  if (placeToUpdate.creatorId !== userId) {
    throw new Error('Unauthorized to update this place.');
  }

  return db.place.update({
    where: { id: placeId },
    data: data,
  });
}

export async function getPlaceLocationsByDistrict(districtName: string) {
  const whereClause =
    districtName && districtName !== '전체'
      ? {
          address: {
            contains: districtName,
          },
        }
      : {};

  return db.place.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      latitude: true,
      longitude: true,
    },
  });
}

export async function getAllPlacesByCreatorId(creatorId: string) {
  return db.place.findMany({
    where: { creatorId },
    orderBy: {
      createdAt: 'desc',
    },
  }).then(places => places.map(serializeDatesInPlace));
}
