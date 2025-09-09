'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { Restaurant } from '~/src/types/restaurant';
import { PlaceCategory } from '~/src/types/shared';
import RestaurantListContainer from './RestaurantListContainer';
import Pagination from '../common/Pagination';

interface PaginatedPlaces {
  places: Restaurant[];
  totalPages: number;
  currentPage: number;
}

const fetchPlacesByDistrict = async (
  districtName: string,
  userId: string | undefined,
  page: number,
  sort: string,
  category: PlaceCategory | undefined,
): Promise<PaginatedPlaces> => {
  const params = new URLSearchParams({
    districtName,
    page: page.toString(),
    sort,
    limit: '12',
  });
  if (userId) params.append('userId', userId);
  if (category) params.append('category', category);

  const response = await fetch(`/api/districts/places?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch places');
  }
  return response.json();
};

interface PlaceListProps {
  districtName: string;
  categoryName: string;
  sort: 'recent' | 'likes';
  category?: PlaceCategory;
  onPageChange: (page: number) => void;
  page: number;
}

export default function PlaceList({
  districtName,
  categoryName,
  sort,
  category,
  page,
  onPageChange,
}: PlaceListProps) {
  const { data: session } = useSession();
  const { data } = useSuspenseQuery<PaginatedPlaces>({
    queryKey: ['places', districtName, sort, category, page],
    queryFn: () =>
      fetchPlacesByDistrict(districtName, session?.user?.id, page, sort, category),
  });

  return (
    <>
      <RestaurantListContainer
        places={data?.places ?? []}
        districtName={districtName}
        categoryName={categoryName}
      />
      <Pagination
        currentPage={data?.currentPage ?? 1}
        totalPages={data?.totalPages ?? 1}
        onPageChange={onPageChange}
      />
    </>
  );
}
