'use client';

import { useState } from 'react';
import { Place, Route } from '@prisma/client';
import MyPageContentToolbar from '~/src/components/mypage/MyPageContentToolbar';
import CreatedContentList from '~/src/components/mypage/content/CreatedContentList';

interface ContentTabPanelProps {
  myCreatedPlaces: Place[];
  myCreatedRoutes: Route[];
  selectedDistrict: string;
  onDistrictChange: (districtId: string) => void;
  onAddPlace: () => void;
  onAddRoute: () => void;
  onEditPlace: (id: string) => void;
  onDeletePlace: (id: string) => void;
  onEditRoute: (id: string) => void;
  onDeleteRoute: (id: string) => void;
}

export default function ContentTabPanel({
  myCreatedPlaces,
  myCreatedRoutes,
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
    </div>
  );
}
