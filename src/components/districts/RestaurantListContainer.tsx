import RestaurantCategorySection from '~/src/components/districts/restaurant-category-section';
import { CATEGORIES, mockRestaurants } from '~/src/data/mock-data';

interface RestaurantListContainerProps {
  districtId: string;
}

export default function RestaurantListContainer({ districtId }: RestaurantListContainerProps) {
  const restaurantsToShow =
    districtId === 'all'
      ? mockRestaurants
      : mockRestaurants.filter((r) => r.district === districtId);

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