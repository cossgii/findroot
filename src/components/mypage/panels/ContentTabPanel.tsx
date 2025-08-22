'use client';

import { useState } from 'react';
import { Route } from '@prisma/client';
import MyPageContentToolbar from '~/src/components/mypage/MyPageContentToolbar';
import CreatedContentList from '~/src/components/mypage/content/CreatedContentList';
import Pagination from '~/src/components/common/Pagination'; // Import Pagination
import { Restaurant } from '~/src/types/restaurant';

interface ContentTabPanelProps {
  myCreatedPlaces: Restaurant[];
  myCreatedRoutes: (Route & { likesCount: number; isLiked: boolean; })[]; // Updated Route type
  onAddPlace: () => void;
  onAddRoute: () => void;
  onEditPlace: (id: string) => void;
  onDeletePlace: (id: string) => void;
  onEditRoute: (id: string) => void;
  onDeleteRoute: (id: string) => void;
  // Pagination props for places
  placesTotalPages: number;
  placesCurrentPage: number;
  onPlacePageChange: (page: number) => void;
  // Pagination props for routes
  routesTotalPages: number;
  routesCurrentPage: number;
  onRoutePageChange: (page: number) => void;
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
  ...handlers
}: ContentTabPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'places' | 'routes'>('places');

  return (
    <div>
      <MyPageContentToolbar
        activeTab="content"
        activeSubTab={activeSubTab}
        onSubTabClick={setActiveSubTab}
        selectedDistrict={'all'} // Filtering is disabled for now
        onDistrictChange={() => {}}
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
