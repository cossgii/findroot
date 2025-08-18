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
  return (
    <div key={category.id}>
      <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
      <div className="flex flex-col space-y-4">
        {restaurants.length > 0 ? (
          restaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              id={restaurant.id}
              name={restaurant.name}
              address={restaurant.address} // address prop 다시 전달
              district={restaurant.district}
              description={restaurant.description}
            />
          ))
        ) : (
          <p className="text-gray-500">맛집 정보가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
