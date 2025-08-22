'use client';

import { useState } from 'react';
import MyPageContentToolbar from '~/src/components/mypage/MyPageContentToolbar';
import LikedContentList from '~/src/components/mypage/content/LikedContentList';
import Pagination from '~/src/components/common/Pagination';
import { Restaurant, RouteWithLikeData } from '~/src/types/restaurant';
import { PaginatedResponse } from '~/src/hooks/mypage/useMyPageData';

interface LikesTabPanelProps {
  likedPlaces: Restaurant[];
  likedRoutes: PaginatedResponse<RouteWithLikeData>; // Corrected type
  // Pagination props for liked places
  placesTotalPages: number;
  placesCurrentPage: number;
  onPlacePageChange: (page: number) => void;
  // Pagination props for liked routes
  routesTotalPages: number;
  routesCurrentPage: number;
  onRoutePageChange: (page: number) => void;
}

export default function LikesTabPanel({
  likedPlaces,
  likedRoutes,
  placesTotalPages,
  placesCurrentPage,
  onPlacePageChange,
  routesTotalPages,
  routesCurrentPage,
  onRoutePageChange,
}: LikesTabPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'places' | 'routes'>('places');

  return (
    <div>
      <MyPageContentToolbar
        activeTab="likes"
        activeSubTab={activeSubTab}
        onSubTabClick={setActiveSubTab}
        // Filtering is not yet implemented for likes, so pass dummy props
        selectedDistrict={'all'}
        onDistrictChange={() => {}}
        onAddPlace={() => {}}
        onAddRoute={() => {}}
      />
      <LikedContentList
        activeSubTab={activeSubTab}
        likedPlaces={likedPlaces}
        likedRoutes={likedRoutes} // Pass the whole object
      />
      {activeSubTab === 'places' && (
        <Pagination
          currentPage={placesCurrentPage}
          totalPages={placesTotalPages}
          onPageChange={onPlacePageChange}
        />
      )}
      {activeSubTab === 'routes' && (
        <Pagination
          currentPage={routesCurrentPage}
          totalPages={routesTotalPages}
          onPageChange={onRoutePageChange}
        />
      )}
    </div>
  );
}

