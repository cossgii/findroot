'use client';
import RestaurantCard from '~/src/components/districts/RestaurantCard';
import LikeButton from '~/src/components/common/LikeButton';
import { Restaurant, RouteWithLikeData } from '~/src/types/restaurant';
import { RouteStopLabel } from '@prisma/client';
import Link from 'next/link';

export interface RouteWithPlaces extends RouteWithLikeData {
  places: { place: Restaurant; label: RouteStopLabel }[];
  commentsCount: number;
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
      <div className="flex items-center justify-center h-40 rounded-lg bg-gray-50">
        <p className="text-gray-500">
          이 지역에 생성된 사용자 루트가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      {routes.map((route) => (
        <div
          key={route.id}
          className={`p-4 rounded-lg shadow-sm transition-all ${
            selectedRouteId === route.id
              ? 'bg-blue-100 ring-2 ring-blue-500'
              : 'bg-gray-50'
          }`}
        >
          <div
            className="cursor-pointer"
            onClick={() => onSelectRoute(route.id)}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-grow pr-4">
                <h3 className="text-xl font-bold">{route.name}</h3>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex flex-col items-center justify-center text-center w-12 h-12">
                  <span className="text-xl">💬</span>
                  <span className="text-xs font-medium text-gray-600">
                    {route.commentsCount}
                  </span>
                </div>
                <LikeButton
                  routeId={route.id}
                  initialIsLiked={route.isLiked}
                  initialLikesCount={route.likesCount}
                />
              </div>
            </div>
          </div>

          {selectedRouteId === route.id && (
            <div className="mt-4 pt-4 border-t">
              {route.description && (
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {route.description}
                </p>
              )}
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-semibold">루트 상세 장소</h4>
                <Link
                  href={`/routes/${route.id}`}
                  className="text-sm text-blue-600 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  상세보기
                </Link>
              </div>
              <div className="flex flex-col space-y-4">
                {route.places.map(({ place, label }) => (
                  <RestaurantCard
                    key={place.id}
                    place={place as Restaurant}
                    label={label}
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
