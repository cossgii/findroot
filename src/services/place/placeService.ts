import { db } from '~/lib/db';
import { CreatePlaceInput } from './place-schema';

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
  return place;
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

  return places;
}

/**
 * Fetches places for a given district.
 * @param districtName - The name of the district.
 * @returns A list of places in the specified district.
 */
export async function getPlacesByDistrict(districtName: string) {
  const places = await db.place.findMany({
    where: {
      address: {
        contains: districtName,
      },
    },
    include: {
      creator: {
        select: { id: true, name: true, image: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return places;
}

/**
 * Fetches a place by its ID.
 * @param id - The ID of the place.
 * @returns The place with the specified ID.
 */
export async function getPlaceById(id: string) {
  const place = await db.place.findUnique({
    where: { id },
    include: {
      creator: {
        select: { id: true, name: true, image: true },
      },
    },
  });

  return place;
}