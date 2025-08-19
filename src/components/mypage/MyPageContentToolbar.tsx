'use client';

import React from 'react';
import { cn } from '~/src/utils/class-name';
import Button from '~/src/components/common/button';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';

import { type MyPageSubTab } from '~/src/components/mypage/MyPageTabs';

interface MyPageContentToolbarProps {
  activeTab: 'content' | 'likes';
  activeSubTab: MyPageSubTab;
  onSubTabClick: (subTab: MyPageSubTab) => void;
  selectedDistrict: string;
  onDistrictChange: (districtId: string) => void;
  onAddPlace: () => void;
  onAddRoute: () => void;
}

export default function MyPageContentToolbar({
  activeTab,
  activeSubTab,
  onSubTabClick,
  selectedDistrict,
  onDistrictChange,
  onAddPlace,
  onAddRoute,
}: MyPageContentToolbarProps) {
  const subTabLabels = {
    content: { places: '내가 등록한 장소', routes: '내가 등록한 루트' },
    likes: { places: '좋아요 누른 장소', routes: '좋아요 누른 루트' },
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 bg-white rounded-lg shadow-md mb-6">
      {/* Left Side: Sub-tabs */}
      <div className="flex space-x-4 border-b md:border-b-0 pb-2 md:pb-0">
        <button
          onClick={() => onSubTabClick('places')}
          className={cn(
            'whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium',
            activeSubTab === 'places'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700',
          )}
        >
          {subTabLabels[activeTab].places}
        </button>
        <button
          onClick={() => onSubTabClick('routes')}
          className={cn(
            'whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium',
            activeSubTab === 'routes'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700',
          )}
        >
          {subTabLabels[activeTab].routes}
        </button>
      </div>

      {/* Right Side: Controls */}
      <div className="flex items-center gap-2">
        {activeTab === 'content' && (
          <>
            <Button onClick={onAddPlace} size="small" className="w-auto px-3">
              장소 등록
            </Button>
            <Button onClick={onAddRoute} size="small" className="w-auto px-3">
              루트 등록
            </Button>
          </>
        )}
        <select
          value={selectedDistrict}
          onChange={(e) => onDistrictChange(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 text-sm py-2 px-3"
        >
          {SEOUL_DISTRICTS.map((district) => (
            <option key={district.id} value={district.id}>
              {district.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
