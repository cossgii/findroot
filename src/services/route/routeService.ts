import { db } from '~/lib/db';

interface CreateRouteInput {
  name: string;
  description?: string;
  districtId: string;
}

export async function createRoute(data: CreateRouteInput, creatorId: string) {
  return db.route.create({
    data: {
      ...data,
      creatorId,
    },
  });
}

export async function addPlaceToRoute(routeId: string, placeId: string, order: number) {
  return db.routePlace.create({
    data: {
      routeId,
      placeId,
      order,
    },
  });
}
