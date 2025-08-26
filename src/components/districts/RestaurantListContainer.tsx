import RestaurantCard from '~/src/components/districts/restaurant-card';
import { Restaurant } from '~/src/types/restaurant';

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
      <div className="flex justify-center items-center h-40 rounded-lg bg-gray-50">
        <p className="text-gray-500">
          {`${districtName}에 등록된 ${categoryName} 장소가 없습니다.`}
        </p>
      </div>
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
