import { db } from '~/lib/db';
import { NotFoundError, ForbiddenError, BadRequestError } from '~/src/utils/api-errors';

async function verifyRouteOwnership(routePlaceId: string, userId: string) {
  const routePlace = await db.routePlace.findUnique({
    where: { id: routePlaceId },
    select: { route: { select: { creatorId: true } } },
  });

  if (!routePlace) {
    throw new NotFoundError('경유지를 찾을 수 없습니다.');
  }

  if (routePlace.route.creatorId !== userId) {
    throw new ForbiddenError('이 루트를 수정할 권한이 없습니다.');
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
    throw new BadRequestError('경유지당 대안 장소는 최대 3개까지 등록할 수 있습니다.');
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
    throw new NotFoundError('대안 장소를 찾을 수 없습니다.');
  }

  if (alternative.routePlace.route.creatorId !== userId) {
    throw new ForbiddenError('이 루트를 수정할 권한이 없습니다.');
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
    throw new NotFoundError('대안 장소를 찾을 수 없습니다.');
  }

  if (alternative.routePlace.route.creatorId !== userId) {
    throw new ForbiddenError('이 루트를 수정할 권한이 없습니다.');
  }

  return db.alternative.delete({
    where: { id: alternativeId },
  });
}
