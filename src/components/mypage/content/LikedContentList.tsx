'use client';

import { useState, useEffect } from 'react';
import { type MyPageSubTab } from '../MyPageTabs';
import RestaurantCard from '~/src/components/districts/restaurant-card';
import LikeButton from '~/src/components/common/LikeButton';
import { Restaurant, RouteWithLikeData } from '~/src/types/restaurant';
import { useSetAtom } from 'jotai';
import { addToastAtom, removeToastAtom } from '~/src/stores/toast-store';
import { RouteWithPlaces } from '~/src/components/districts/RestaurantRouteContainer';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';

interface LikedContentListProps {
  activeSubTab: MyPageSubTab;
  likedPlaces: Restaurant[];
  likedRoutes: RouteWithLikeData[];
  onContentUpdate: () => void; // Replaced setters with a single callback
}

export default function LikedContentList({
  activeSubTab,
  likedPlaces,
  likedRoutes,
  onContentUpdate,
}: LikedContentListProps) {
  const addToast = useSetAtom(addToastAtom);
  const removeToast = useSetAtom(removeToastAtom);

  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);
  const [routeDetails, setRouteDetails] = useState<RouteWithPlaces | null>(null);
  const [isLoadingRouteDetails, setIsLoadingRouteDetails] = useState(false);

  useEffect(() => {
    if (expandedRouteId) {
      const fetchRouteDetails = async () => {
        setIsLoadingRouteDetails(true);
        try {
          const response = await fetch(`/api/routes/${expandedRouteId}`);
          if (!response.ok) {
            console.error('Failed to fetch route details');
            setRouteDetails(null);
          }
          const data: RouteWithPlaces = await response.json();
          setRouteDetails(data);
        } catch (error) {
          console.error('Error fetching route details:', error);
          setRouteDetails(null);
        } finally {
          setIsLoadingRouteDetails(false);
        }
      };
      fetchRouteDetails();
    } else {
      setRouteDetails(null);
    }
  }, [expandedRouteId]);

  const handleUnlikeWithUndo = async (
    originalHandleLike: (forceLike?: boolean) => Promise<void>,
  ) => {
    // Optimistically remove the item by re-fetching the list
    await originalHandleLike(false);
    onContentUpdate(); // Instead of local state update, just refetch.

    const toastId = Date.now().toString();
    addToast({
      message: '좋아요가 취소되었습니다.',
      actionLabel: '실행 취소',
      onAction: async () => {
        await originalHandleLike(true); // Re-like the item
        onContentUpdate(); // Re-fetch the list again to show the restored item
        removeToast(toastId);
      },
      duration: 5000,
    });
  };

  if (activeSubTab === 'places') {
    return likedPlaces.length > 0 ? (
      <ul className="space-y-3">
        {likedPlaces.map((place) => (
          <RestaurantCard 
            key={place.id} 
            place={place} 
            onLikeToggle={(handleLike) => handleUnlikeWithUndo(handleLike)}
          />
        ))}
      </ul>
    ) : (
      <p className="text-gray-500 text-center py-10">
        좋아요를 누른 장소가 없습니다.
      </p>
    );
  }

  if (!likedRoutes) {
    return (
      <p className="text-gray-500 text-center py-10">
        루트 정보를 불러오는 중이거나, 좋아요를 누른 루트가 없습니다.
      </p>
    );
  }

  return likedRoutes.length > 0 ? (
    <ul className="space-y-3">
      {likedRoutes.map((route: RouteWithLikeData) => {
        const districtName = route.districtId
          ? SEOUL_DISTRICTS.find(d => d.id === route.districtId)?.name
          : null;

        return (
          <li
            key={route.id}
            className={`bg-white rounded-lg shadow-md p-4 cursor-pointer transition-all hover:shadow-lg ${
              expandedRouteId === route.id
                ? 'bg-blue-100 ring-2 ring-blue-500'
                : 'hover:bg-gray-50'
            }`}
            onClick={() =>
              setExpandedRouteId((prev) =>
                prev === route.id ? null : route.id || null,
              )
            }
          >
            <div className="flex justify-between items-start">
              <div className="flex-grow pr-2">
                <h3 className="text-lg font-bold">{route.name}</h3>
                {districtName && <p className="text-sm text-gray-500 mt-1">{districtName}</p>}
              </div>
              <LikeButton
                routeId={route.id}
                initialIsLiked={route.isLiked || false}
                initialLikesCount={route.likesCount || 0}
                onLikeToggle={(handleLike) => handleUnlikeWithUndo(handleLike)}
              />
            </div>
            {expandedRouteId === route.id && (
              <div className="mt-4 pt-4 border-t">
                {isLoadingRouteDetails ? (
                  <p className="text-gray-500">루트 상세 정보 불러오는 중...</p>
                ) : routeDetails ? (
                  <div className="flex flex-col space-y-4">
                    {routeDetails.places.map(({ place, label }) => (
                      <RestaurantCard key={place.id} place={place as Restaurant} label={label} />
                    ))}
                  </div>
                ) : (
                  <p className="text-red-500">루트 정보를 불러오지 못했습니다.</p>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  ) : (
    <p className="text-gray-500 text-center py-10">
      좋아요를 누른 루트가 없습니다。
    </p>
  );
}
