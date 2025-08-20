'use client';

import { useState, useEffect } from 'react';
import { type MyPageSubTab } from '../MyPageTabs';
import { LikedPlace, MyLikedRoute } from '~/src/hooks/mypage/useMyPageData';
import { useSetAtom } from 'jotai';
import { modalAtom } from '~/src/stores/app-store'; // Keep for other modals if needed
import { addToastAtom, removeToastAtom } from '~/src/stores/toast-store'; // NEW IMPORT
import { Place, Route } from '@prisma/client';
import RestaurantCard from '~/src/components/districts/restaurant-card';
import LikeButton from '~/src/components/common/LikeButton';

// Define a type for Route with included Places (similar to DistrictClient)
interface RouteWithPlaces extends Route {
  places: { place: Place }[];
}

// NEW: Define LikedContentListProps with setters
interface LikedContentListProps {
  activeSubTab: MyPageSubTab;
  likedPlaces: LikedPlace[];
  likedRoutes: MyLikedRoute[];
  setLikedPlaces: React.Dispatch<React.SetStateAction<LikedPlace[]>>; // NEW
  setLikedRoutes: React.Dispatch<React.SetStateAction<MyLikedRoute[]>>; // NEW
}

export default function LikedContentList({
  activeSubTab,
  likedPlaces,
  likedRoutes,
  setLikedPlaces, // NEW
  setLikedRoutes, // NEW
}: LikedContentListProps) {
  const setModal = useSetAtom(modalAtom); // Keep if other modals are used
  const addToast = useSetAtom(addToastAtom); // NEW
  const removeToast = useSetAtom(removeToastAtom); // NEW

  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);
  const [routeDetails, setRouteDetails] = useState<RouteWithPlaces | null>(null);
  const [isLoadingRouteDetails, setIsLoadingRouteDetails] = useState(false);

  // Fetch route details when a route is expanded
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
      setRouteDetails(null); // Clear details when collapsed
    }
  }, [expandedRouteId]);

  // Modified: Function to handle like/unlike with undo toast
  const handleUnlikeWithUndo = (
    originalHandleLike: (forceLike?: boolean) => Promise<void>, // Modified signature
    item: LikedPlace | MyLikedRoute, // The item being unliked
    isPlace: boolean, // Flag to distinguish between place and route
  ) => {
    // Immediately remove from UI (optimistic update)
    if (isPlace) {
      setLikedPlaces((prev) => prev.filter((p) => p.id !== item.id));
    } else {
      setLikedRoutes((prev) => prev.filter((r) => r.id !== item.id));
    }

    // Call the original handleLike to perform the API call (which will unlike)
    originalHandleLike(false); // Explicitly force unlike

    // Show undo toast
    const toastId = Date.now().toString(); // Generate a unique ID for this toast
    addToast({
      message: '좋아요가 취소되었습니다.',
      actionLabel: '실행 취소',
      onAction: () => {
        // Revert UI (add back)
        if (isPlace) {
          setLikedPlaces((prev) => [...prev, item as LikedPlace]);
        } else {
          setLikedRoutes((prev) => [...prev, item as MyLikedRoute]);
        }
        // Call original handleLike again to re-like the item
        originalHandleLike(true); // Explicitly force like
        removeToast(toastId); // Remove toast after action
      },
      duration: 5000, // Toast disappears after 5 seconds if no action
    });
  };

  if (activeSubTab === 'places') {
    return likedPlaces.length > 0 ? (
      <ul className="space-y-3">
        {likedPlaces.map((like) => (
          <li
            key={like.id}
            className="bg-white rounded-lg shadow-md p-4 cursor-pointer transition-all hover:shadow-lg hover:bg-gray-50"
            onClick={() =>
              setModal({ type: 'RESTAURANT_DETAIL', props: { restaurantId: like.place?.id } })
            }
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{like.place?.name}</p>
                <p className="text-sm text-gray-500">{like.place?.address}</p>
              </div>
              <LikeButton
                placeId={like.place?.id}
                onLikeToggle={(originalHandleLike) =>
                  handleUnlikeWithUndo(originalHandleLike, like, true) // Pass item and isPlace flag
                }
              />
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-500 text-center py-10">
        좋아요를 누른 장소가 없습니다.
      </p>
    );
  }

  return likedRoutes.length > 0 ? (
    <ul className="space-y-3">
      {likedRoutes.map((like) => (
        <li
          key={like.id}
          className={`bg-white rounded-lg shadow-md p-4 cursor-pointer transition-all hover:shadow-lg ${
            expandedRouteId === like.route?.id
              ? 'bg-blue-100 ring-2 ring-blue-500'
              : 'hover:bg-gray-50'
          }`}
          onClick={() =>
            setExpandedRouteId((prev) =>
              prev === like.route?.id ? null : like.route?.id || null,
            )
          }
        >
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold">{like.route?.name}</h3>
            <LikeButton
              routeId={like.route?.id}
              onLikeToggle={(originalHandleLike) =>
                handleUnlikeWithUndo(originalHandleLike, like, false) // Pass item and isPlace flag
              }
            />
          </div>
          {expandedRouteId === like.route?.id && (
            <div className="mt-4 pt-4 border-t">
              {isLoadingRouteDetails ? (
                <p className="text-gray-500">루트 상세 정보 불러오는 중...</p>
              ) : routeDetails ? (
                <>
                  {routeDetails.description && (
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {routeDetails.description}
                    </p>
                  )}
                  <h4 className="text-lg font-semibold mt-2 mb-2">루트 상세 장소</h4>
                  <div className="flex flex-col space-y-4">
                    {routeDetails.places.map(({ place }) => (
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
                </>
              ) : (
                <p className="text-red-500">루트 정보를 불러오지 못했습니다.</p>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-gray-500 text-center py-10">
      좋아요를 누른 루트가 없습니다。
    </p>
  );
}