'use client';

import { useState } from 'react';
import MyPageContentToolbar from '~/src/components/mypage/MyPageContentToolbar';
import LikedContentList from '~/src/components/mypage/content/LikedContentList';
import Pagination from '~/src/components/common/Pagination';
import { Restaurant, RouteWithLikeData } from '~/src/types/restaurant';
import { PaginatedResponse } from '~/src/hooks/mypage/useMyPageData';

interface LikesTabPanelProps {
  likedPlaces: Restaurant[];
  setLikedPlaces: React.Dispatch<React.SetStateAction<PaginatedResponse<Restaurant>>>;
  likedRoutes: PaginatedResponse<RouteWithLikeData>;
  setLikedRoutes: React.Dispatch<React.SetStateAction<PaginatedResponse<RouteWithLikeData>>>;
  placesTotalPages: number;
  placesCurrentPage: number;
  onPlacePageChange: (page: number) => void;
  routesTotalPages: number;
  routesCurrentPage: number;
  onRoutePageChange: (page: number) => void;
  selectedDistrict: string;
  onDistrictChange: (districtId: string) => void;
}

export default function LikesTabPanel({
  likedPlaces,
  setLikedPlaces,
  likedRoutes,
  setLikedRoutes,
  placesTotalPages,
  placesCurrentPage,
  onPlacePageChange,
  routesTotalPages,
  routesCurrentPage,
  onRoutePageChange,
  selectedDistrict,
  onDistrictChange,
}: LikesTabPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'places' | 'routes'>('places');

  return (
    <div>
      <MyPageContentToolbar
        activeTab="likes"
        activeSubTab={activeSubTab}
        onSubTabClick={setActiveSubTab}
        selectedDistrict={selectedDistrict}
        onDistrictChange={onDistrictChange}
        onAddPlace={() => {}}
        onAddRoute={() => {}}
      />
      <LikedContentList
        activeSubTab={activeSubTab}
        likedPlaces={likedPlaces}
        setLikedPlaces={setLikedPlaces}
        likedRoutes={likedRoutes}
        setLikedRoutes={setLikedRoutes}
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

