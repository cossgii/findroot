'use client';

import { useState, useEffect } from 'react';
import { type MyPageSubTab } from '../MyPageTabs';

import { Place, Route } from '@prisma/client';
import RestaurantCard from '~/src/components/districts/restaurant-card';
import LikeButton from '~/src/components/common/LikeButton';
import { Restaurant, RouteWithLikeData } from '~/src/types/restaurant'; // Import RouteWithLikeData
import { PaginatedResponse } from '~/src/hooks/mypage/useMyPageData';

// Define a type for Route with included Places (similar to DistrictClient)
interface RouteWithPlaces extends Route {
  places: { place: Place }[];
}

interface LikedContentListProps {
  activeSubTab: MyPageSubTab;
  likedPlaces: Restaurant[];
  likedRoutes: PaginatedResponse<RouteWithLikeData>; // Updated prop type
}

export default function LikedContentList({
  activeSubTab,
  likedPlaces,
  likedRoutes,
}: LikedContentListProps) {

  
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

  if (activeSubTab === 'places') {
    return likedPlaces.length > 0 ? (
      <ul className="space-y-3">
        {likedPlaces.map((place) => (
          <RestaurantCard key={place.id} place={place} />
        ))}
      </ul>
    ) : (
      <p className="text-gray-500 text-center py-10">
        좋아요를 누른 장소가 없습니다.
      </p>
    );
  }

  if (!likedRoutes || !likedRoutes.data) {
    return (
      <p className="text-gray-500 text-center py-10">
        루트 정보를 불러오는 중이거나, 좋아요를 누른 루트가 없습니다.
      </p>
    );
  }

  return likedRoutes.data.length > 0 ? (
    <ul className="space-y-3">
      {likedRoutes.data.map((route: RouteWithLikeData) => (
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
            <h3 className="text-lg font-bold">{route.name}</h3>
            <LikeButton
              routeId={route.id}
              initialIsLiked={route.isLiked || false}
              initialLikesCount={route.likesCount || 0}
            />
          </div>
          {expandedRouteId === route.id && (
            <div className="mt-4 pt-4 border-t">
              {isLoadingRouteDetails ? (
                <p className="text-gray-500">루트 상세 정보 불러오는 중...</p>
              ) : routeDetails ? (
                <div className="flex flex-col space-y-4">
                  {routeDetails.places.map(({ place }) => (
                    <RestaurantCard key={place.id} place={place as Restaurant} />
                  ))}
                </div>
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