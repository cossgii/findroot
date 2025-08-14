import { db } from '~/lib/db';
import { CreateRouteInput } from './route-schema';

/**
 * Creates a new route with its three place slots.
 * @param data - The data for the new route, conforming to CreateRouteInput.
 * @param creatorId - The ID of the user creating the route.
 * @returns The newly created route.
 */
export async function createRoute(data: CreateRouteInput, creatorId: string) {
  return db.route.create({
    data: {
      name: data.name,
      description: data.description,
      districtId: data.districtId,
      creatorId,
      placeForRound1Id: data.placeForRound1Id,
      placeForRound2Id: data.placeForRound2Id,
      placeForCafeId: data.placeForCafeId,
    },
  });
}

/**
 * Fetches a single route by its ID, including the places in its slots.
 * @param id - The ID of the route.
 * @returns The route with its places, or null if not found.
 */
export async function getRouteById(id: string) {
  return db.route.findUnique({
    where: { id },
    include: {
      creator: {
        select: { id: true, name: true, image: true },
      },
      placeForRound1: true,
      placeForRound2: true,
      placeForCafe: true,
    },
  });
}

/**
 * Fetches all routes created by a specific user.
 * @param creatorId - The ID of the user.
 * @returns A list of routes created by the user.
 */
export async function getRoutesByCreatorId(creatorId: string) {
  return db.route.findMany({
    where: { creatorId },
    orderBy: { createdAt: 'desc' },
    include: {
      placeForRound1: { select: { name: true } },
      placeForRound2: { select: { name: true } },
      placeForCafe: { select: { name: true } },
    },
  });
}
