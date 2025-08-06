import RestaurantCard from '~/src/components/districts/restaurant-card';
import { CATEGORIES } from '~/src/utils/categories';
import { Place } from '@prisma/client';

interface RestaurantRouteContainerProps {
  districtId: string;
  places: Place[];
}

export default function RestaurantRouteContainer({ districtId, places }: RestaurantRouteContainerProps) {
  const restaurantsInDistrict = places;

  const routeRestaurants: Place[] = [];

  // 각 카테고리별로 첫 번째 맛집을 찾아서 루트에 추가
  CATEGORIES.forEach((category) => {
    const foundRestaurant = restaurantsInDistrict.find(
      (restaurant) => restaurant.category === category.id,
    );
    if (foundRestaurant) {
      routeRestaurants.push(foundRestaurant);
    }
  });

  // 맛집이 2개 미만이면 루트를 구성할 수 없음
  if (routeRestaurants.length < 2) {
    return (
      <p className="text-gray-500">
        이 지역에는 2개 이상의 카테고리 맛집이 있어야 루트 추천이 가능합니다.
      </p>
    );
  }

  const routeName = routeRestaurants.map((r) => r.name).join(' - ');
  const routeReview = `${districtId}에서 즐길 수 있는 추천 코스! ${routeName} 루트를 통해 즐거운 시간을 보내세요.`;

  return (
    <div className="flex flex-col space-y-6">
      <div className="p-4 bg-blue-50 rounded-lg shadow-sm">
        <h3 className="text-xl font-bold mb-2">추천 루트: {routeName}</h3>
        <p className="text-gray-700">리뷰: {routeReview}</p>
      </div>

      <h4 className="text-lg font-semibold">루트 상세</h4>
      <div className="flex flex-col space-y-4">
        {routeRestaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            id={restaurant.id}
            name={restaurant.name}
            description={restaurant.description || ''}
            address={restaurant.address || ''}
            district={districtId} // district is not a part of Place model, so we use the prop
          />
        ))}
      </div>
    </div>
  );
}