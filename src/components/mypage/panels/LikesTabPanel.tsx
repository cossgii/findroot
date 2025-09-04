'use client';

import { useState, useEffect } from 'react';
import MyPageContentToolbar from '~/src/components/mypage/MyPageContentToolbar';
import LikedContentList from '~/src/components/mypage/content/LikedContentList';
import Pagination from '~/src/components/common/Pagination';
import { Restaurant, RouteWithLikeData } from '~/src/types/restaurant';
import { PaginatedResponse } from '~/src/hooks/mypage/useMyPageData';
import { PlaceCategory } from '@prisma/client';
import CategoryFilter from '~/src/components/mypage/CategoryFilter';

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
  selectedCategory: PlaceCategory | undefined;
  onCategoryChange: (category: PlaceCategory | undefined) => void;
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
  selectedCategory,
  onCategoryChange,
}: LikesTabPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'places' | 'routes'>('places');

  useEffect(() => {
    onPlacePageChange(1);
    onRoutePageChange(1);
  }, [activeSubTab, onPlacePageChange, onRoutePageChange]);

  const handleCategoryChange = (category: PlaceCategory | undefined) => {
    onPlacePageChange(1);
    onCategoryChange(category);
  };

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
      {activeSubTab === 'places' && (
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />
      )}
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

