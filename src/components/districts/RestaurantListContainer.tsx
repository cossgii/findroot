import RestaurantCategorySection from '~/src/components/districts/restaurant-category-section';
import { CATEGORIES } from '~/src/utils/categories';

import { Restaurant } from '~/src/types/restaurant'; // Added this import

interface RestaurantListContainerProps {
  places: Restaurant[]; // Changed type from Place[] to Restaurant[]
}

export default function RestaurantListContainer({ places }: RestaurantListContainerProps) {
  const restaurantsToShow = places;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {CATEGORIES.map((category) => (
        <RestaurantCategorySection
          key={category.id}
          category={category}
          restaurants={restaurantsToShow.filter(
            (r) => r.category === category.id,
          )}
        />
      ))}
    </div>
  );
}
