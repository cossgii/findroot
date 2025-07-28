import RestaurantCard from '~/src/components/districts/restaurant-card';
import { Category, Restaurant } from '~/src/types/restaurant';

interface RestaurantCategorySectionProps {
  category: Category;
  restaurants: Restaurant[];
}

export default function RestaurantCategorySection({
  category,
  restaurants,
}: RestaurantCategorySectionProps) {
  // 해당 카테고리에 맛집이 없으면 섹션 자체를 렌더링하지 않음
  if (restaurants.length === 0) {
    return null;
  }

  return (
    <div key={category.id}>
      <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {restaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            id={restaurant.id} // <-- 이 부분 추가
            name={restaurant.name}
            address={restaurant.address}
            imageUrl={restaurant.imageUrl}
            district={restaurant.district}
          />
        ))}
      </div>
    </div>
  );
}
