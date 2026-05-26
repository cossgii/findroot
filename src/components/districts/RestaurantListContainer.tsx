import RestaurantCard from '~/src/components/districts/RestaurantCard';
import { Restaurant } from '~/src/types/restaurant';
import EmptyState from '~/src/components/common/EmptyState';

interface RestaurantListContainerProps {
  places: Restaurant[];
  districtName: string;
  categoryName: string;
}

export default function RestaurantListContainer({ 
  places,
  districtName,
  categoryName,
}: RestaurantListContainerProps) {
  if (places.length === 0) {
    return (
      <EmptyState message={`${districtName}에 등록된 장소(${categoryName})가 없습니다.`} />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {places.map((place) => (
        <RestaurantCard key={place.id} place={place} />
      ))}
    </div>
  );
}
