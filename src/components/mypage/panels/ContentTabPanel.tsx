'use client';

import { useState } from 'react';
import { Route } from '@prisma/client';
import MyPageContentToolbar from '~/src/components/mypage/MyPageContentToolbar';
import CreatedContentList from '~/src/components/mypage/content/CreatedContentList';
import Pagination from '~/src/components/common/Pagination';
import { Restaurant } from '~/src/types/restaurant';

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
  ...handlers
}: ContentTabPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'places' | 'routes'>('places');

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
