import { db } from '~/lib/db';

async function verifyRouteOwnership(routePlaceId: string, userId: string) {
  const routePlace = await db.routePlace.findUnique({
    where: { id: routePlaceId },
    select: { route: { select: { creatorId: true } } },
  });

  if (!routePlace) {
    throw new Error('RoutePlace not found');
  }

  if (routePlace.route.creatorId !== userId) {
    throw new Error('Unauthorized');
  }
  return true;
}

export async function getAlternativesByRoutePlaceId({
  routePlaceId,
}: {
  routePlaceId: string;
}) {
  return db.alternative.findMany({
    where: { routePlaceId },
    include: {
      place: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
}

interface CreateAlternativeProps {
  routePlaceId: string;
  placeId: string;
  explanation: string;
  userId: string;
}

export async function createAlternative({
  routePlaceId,
  placeId,
  explanation,
  userId,
}: CreateAlternativeProps) {
  await verifyRouteOwnership(routePlaceId, userId);

  const existingAlternativesCount = await db.alternative.count({
    where: { routePlaceId },
  });

  if (existingAlternativesCount >= 3) {
    throw new Error('Maximum of 3 alternatives per route stop is allowed.');
  }

  return db.alternative.create({
    data: {
      routePlaceId,
      placeId,
      explanation,
    },
  });
}

interface UpdateAlternativeProps {
  alternativeId: string;
  explanation: string;
  userId: string;
}

export async function updateAlternative({
  alternativeId,
  explanation,
  userId,
}: UpdateAlternativeProps) {
  const alternative = await db.alternative.findUnique({
    where: { id: alternativeId },
    select: {
      routePlace: { select: { route: { select: { creatorId: true } } } },
    },
  });

  if (!alternative) {
    throw new Error('Alternative not found');
  }

  if (alternative.routePlace.route.creatorId !== userId) {
    throw new Error('Unauthorized');
  }

  return db.alternative.update({
    where: { id: alternativeId },
    data: { explanation },
  });
}

interface DeleteAlternativeProps {
  alternativeId: string;
  userId: string;
}

export async function deleteAlternative({
  alternativeId,
  userId,
}: DeleteAlternativeProps) {
  const alternative = await db.alternative.findUnique({
    where: { id: alternativeId },
    select: {
      routePlace: { select: { route: { select: { creatorId: true } } } },
    },
  });

  if (!alternative) {
    throw new Error('Alternative not found');
  }

  if (alternative.routePlace.route.creatorId !== userId) {
    throw new Error('Unauthorized');
  }

  return db.alternative.delete({
    where: { id: alternativeId },
  });
}
