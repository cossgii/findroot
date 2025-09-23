'use client';

import { Restaurant } from '~/src/types/restaurant';
import RestaurantListContainer from './RestaurantListContainer';
import Pagination from '../common/Pagination';

interface PlaceListProps {
  places: Restaurant[];
  districtName: string;
  categoryName: string;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export default function PlaceList({
  places,
  districtName,
  categoryName,
  totalPages,
  currentPage,
  onPageChange,
}: PlaceListProps) {
  return (
    <>
      <RestaurantListContainer
        places={places}
        districtName={districtName}
        categoryName={categoryName}
      />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </>
  );
}
