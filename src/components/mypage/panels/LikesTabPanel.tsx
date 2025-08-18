'use client';

import { useState } from 'react';
import { LikedPlace, MyLikedRoute } from '~/src/hooks/mypage/useMyPageData';
import MyPageContentToolbar from '~/src/components/mypage/MyPageContentToolbar';
import LikedContentList from '~/src/components/mypage/content/LikedContentList';

interface LikesTabPanelProps {
  likedPlaces: LikedPlace[];
  likedRoutes: MyLikedRoute[];
  selectedDistrict: string;
  onDistrictChange: (districtId: string) => void;
}

export default function LikesTabPanel({
  likedPlaces,
  likedRoutes,
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
        likedRoutes={likedRoutes}
      />
    </div>
  );
}
