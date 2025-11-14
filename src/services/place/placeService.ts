import { db } from '~/lib/db';
import { CreatePlaceInput } from '~/src/schemas/place-schema';
import { Place, Prisma } from '@prisma/client';
import { PlaceCategory } from '~/src/types/shared';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';



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

export async function createPlace(data: CreatePlaceInput, creatorId: string) {
  const place = await db.place.create({
    data: {
      ...data,
      category: data.category as PlaceCategory,
      creatorId,
    },
  });
  return serializeDatesInPlace(place);
}

export async function checkPlaceExists(address: string, creatorId: string) {
  const existingPlace = await db.place.findFirst({
    where: {
      creatorId: creatorId,
      address: address,
    },
  });

  return !!existingPlace;
}

export async function getPlacesForFeed(userId: string) {
  const followedUsers = await db.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });
  const followedUserIds = followedUsers.map((follow) => follow.followingId);
  const places = await db.place.findMany({
    where: {
      creatorId: {
        in: followedUserIds,
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

  return places.map(serializeDatesInPlace);
}

export async function getPlacesByDistrict(
  districtName: string,
  userId: string | undefined,
  page: number = 1,
  limit: number = 12,
  sort: 'recent' | 'likes' = 'recent',
  category?: PlaceCategory,
) {
  const MAIN_ACCOUNT_ID = process.env.MAIN_ACCOUNT_ID;
  if (!MAIN_ACCOUNT_ID) {
    console.error('MAIN_ACCOUNT_ID is not defined in environment variables.');
    return { places: [], totalCount: 0, totalPages: 0, currentPage: page };
  }

  const whereClause: Prisma.PlaceWhereInput = {
    OR: [
      { creatorId: MAIN_ACCOUNT_ID },
      ...(userId ? [{ creatorId: userId }] : []),
    ],
  };

  if (districtName !== '전체') {
    whereClause.district = districtName;
  }

  if (category) {
    whereClause.category = category;
  }

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
    category: place.category as PlaceCategory,
  }));

  return {
    places,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}

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
        : false,
    },
  });

  if (!placeWithLikes) {
    return null;
  }

  const isLiked =
    userId && placeWithLikes.likes && placeWithLikes.likes.length > 0;

  const { _count, likes, ...place } = placeWithLikes;

  return {
    ...serializeDatesInPlace(place),
    likesCount: _count.likes,
    isLiked: !!isLiked,
    category: place.category as PlaceCategory,
  };
}

export async function getPlacesByCreatorId(
  creatorId: string,
  page: number = 1,
  limit: number = 5,
  district?: string | null,
  currentUserId?: string,
  category?: PlaceCategory | null,
) {
  const whereClause: Prisma.PlaceWhereInput = { creatorId };

  if (district && district !== 'all') {
    const districtName = SEOUL_DISTRICTS.find((d) => d.id === district)?.name;
    if (districtName) {
      whereClause.district = districtName;
    }
  }

  if (category) {
    whereClause.category = category;
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
    category: place.category as PlaceCategory,
  }));

  return {
    places,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}

export async function deletePlace(placeId: string, userId: string) {
  const placeToDelete = await db.place.findUnique({
    where: { id: placeId },
    select: { id: true, creatorId: true },
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

export async function updatePlace(
  placeId: string,
  userId: string,
  data: Partial<Place>,
) {
  const placeToUpdate = await db.place.findUnique({
    where: { id: placeId },
    select: { id: true, creatorId: true },
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

export async function getPlaceLocationsByDistrict(
  districtName: string,
  currentUserId?: string,
) {
  const MAIN_ACCOUNT_ID = process.env.MAIN_ACCOUNT_ID;
  if (!MAIN_ACCOUNT_ID) {
    console.error('MAIN_ACCOUNT_ID is not defined in environment variables.');
    return [];
  }

  const whereClause: Prisma.PlaceWhereInput = {
    OR: [
      { creatorId: MAIN_ACCOUNT_ID },
      ...(currentUserId ? [{ creatorId: currentUserId }] : []),
    ],
  };

  if (districtName && districtName !== '전체') {
    whereClause.district = districtName;
  }

  return db.place.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      latitude: true,
      longitude: true,
      category: true,
    },
  });
}

export async function getAllPlacesByCreatorId(creatorId: string) {
  return db.place
    .findMany({
      where: { creatorId },
      orderBy: {
        createdAt: 'desc',
      },
    })
    .then((places) => places.map(serializeDatesInPlace));
}
