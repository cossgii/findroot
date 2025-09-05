'use client';

import { useState, useEffect } from 'react';
import { PlaceCategory, ClientRoute as Route } from '~/src/types/shared';
import MyPageContentToolbar from '~/src/components/mypage/MyPageContentToolbar';
import CreatedContentList from '~/src/components/mypage/content/CreatedContentList';
import Pagination from '~/src/components/common/Pagination';
import { Restaurant } from '~/src/types/restaurant';
import CategoryFilter from '~/src/components/mypage/CategoryFilter';

interface ContentTabPanelProps {
  myCreatedPlaces: Restaurant[];
  myCreatedRoutes: (Route & { likesCount: number; isLiked: boolean; })[];
  onAddPlace: () => void;
  onAddRoute: () => void;
  onEditPlace: (id: string) => void;
  onDeletePlace: (id: string) => void;
  onEditRoute: (id: string) => void;
  onDeleteRoute: (id: string) => void;
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

export default function ContentTabPanel({
  myCreatedPlaces,
  myCreatedRoutes,
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
  ...handlers
}: ContentTabPanelProps) {
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
        activeTab="content"
        activeSubTab={activeSubTab}
        onSubTabClick={setActiveSubTab}
        selectedDistrict={selectedDistrict}
        onDistrictChange={onDistrictChange}
        onAddPlace={handlers.onAddPlace}
        onAddRoute={handlers.onAddRoute}
      />
      {activeSubTab === 'places' && (
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />
      )}
      <CreatedContentList
        activeSubTab={activeSubTab}
        places={myCreatedPlaces}
        routes={myCreatedRoutes}
        onEditPlace={handlers.onEditPlace}
        onDeletePlace={handlers.onDeletePlace}
        onEditRoute={handlers.onEditRoute}
        onDeleteRoute={handlers.onDeleteRoute}
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
