'use client';
import RestaurantCard from '~/src/components/districts/restaurant-card';
import { Place, Route } from '@prisma/client';
import LikeButton from '~/src/components/common/LikeButton';

interface RouteWithPlaces extends Route {
  places: { place: Place }[];
}

interface RestaurantRouteContainerProps {
  routes: RouteWithPlaces[];
  isLoading: boolean;
  selectedRouteId: string | null;
  onSelectRoute: (routeId: string) => void;
}

export default function RestaurantRouteContainer({
  routes,
  isLoading,
  selectedRouteId,
  onSelectRoute,
}: RestaurantRouteContainerProps) {
  if (isLoading) {
    return <p className="text-gray-500">사용자 루트를 불러오는 중...</p>;
  }

  if (routes.length === 0) {
    return (
      <p className="text-gray-500">이 지역에 생성된 사용자 루트가 없습니다.</p>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      {routes.map((route) => (
        <div
          key={route.id}
          className={`p-4 rounded-lg shadow-sm transition-all cursor-pointer ${
            selectedRouteId === route.id
              ? 'bg-blue-100 ring-2 ring-blue-500'
              : 'bg-gray-50 hover:bg-gray-100'
          }`}
          onClick={() => onSelectRoute(route.id)}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex-grow pr-4">
              <h3 className="text-xl font-bold">{route.name}</h3>
            </div>
            <LikeButton routeId={route.id} />
          </div>

          {/* Accordion Content: Show only if selected */}
          {selectedRouteId === route.id && (
            <div className="mt-4 pt-4 border-t">
              {route.description && (
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {route.description}
                </p>
              )}
              <h4 className="text-lg font-semibold mt-2 mb-2">루트 상세 장소</h4>
              <div className="flex flex-col space-y-4">
                {route.places.map(({ place }) => (
                  <RestaurantCard
                    key={place.id}
                    id={place.id}
                    name={place.name}
                    description={place.description || ''}
                    address={place.address || ''}
                    district={place.district || ''}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
