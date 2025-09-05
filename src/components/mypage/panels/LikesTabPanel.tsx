'use client';

import { useState, useEffect } from 'react';
import MyPageContentToolbar from '~/src/components/mypage/MyPageContentToolbar';
import LikedContentList from '~/src/components/mypage/content/LikedContentList';
import Pagination from '~/src/components/common/Pagination';
import { Restaurant, RouteWithLikeData } from '~/src/types/restaurant';
import { PlaceCategory } from '~/src/types/shared';
import CategoryFilter from '~/src/components/mypage/CategoryFilter';

interface LikesTabPanelProps {
  likedPlaces: Restaurant[];
  likedRoutes: RouteWithLikeData[];
  onContentUpdate: () => void;
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
  likedRoutes,
  onContentUpdate,
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
        likedRoutes={likedRoutes}
        onContentUpdate={onContentUpdate}
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

