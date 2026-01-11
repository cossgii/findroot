'use client';
import { useSetAtom } from 'jotai';
import { modalAtom } from '~/src/stores/app-store';
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
}

export default function RestaurantRouteContainer({
  routes,
  isLoading,
}: RestaurantRouteContainerProps) {
  const setModal = useSetAtom(modalAtom);

  const handleRouteClick = (routeId: string) => {
    setModal({ type: 'ROUTE_PREVIEW', props: { routeId } });
  };

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
          className="p-4 rounded-lg shadow-sm transition-all bg-gray-50 hover:bg-blue-50 hover:shadow-md cursor-pointer"
          onClick={() => handleRouteClick(route.id)}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex-grow pr-4">
              <h3 className="text-xl font-bold">{route.name}</h3>
              {route.creator && (
                <Link
                  href={`/users/${route.creator.id}`}
                  className="text-sm text-gray-500 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {route.creator.name || 'Unknown User'}
                </Link>
              )}
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
          <p className="text-sm text-gray-600 mt-1 truncate">
            {route.description}
          </p>
        </div>
      ))}
    </div>
  );
}

