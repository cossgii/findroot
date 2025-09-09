'use client';

import { Suspense, useState } from 'react';
import MyPageContentToolbar from '~/src/components/mypage/MyPageContentToolbar';
import LikedContentList from '~/src/components/mypage/content/LikedContentList';
import Pagination from '~/src/components/common/Pagination';
import { Restaurant, RouteWithLikeData } from '~/src/types/restaurant';
import { PlaceCategory } from '~/src/types/shared';
import CategoryFilter from '~/src/components/mypage/CategoryFilter';
import { usePaginatedQuery } from '~/src/hooks/usePaginatedQuery';
import ListItemSkeleton from '../content/ListItemSkeleton';

const ListSkeleton = () => (
  <div className="space-y-3">
    <ListItemSkeleton />
    <ListItemSkeleton />
    <ListItemSkeleton />
  </div>
);

const LikedPlaces = ({
  districtId,
  category,
  onContentUpdate,
}: {
  districtId: string;
  category?: PlaceCategory;
  onContentUpdate: () => void;
}) => {
  const { data, page, setPage } = usePaginatedQuery<Restaurant>({
    queryKey: ['user', 'me', 'places', 'liked', districtId, category || 'all'],
    apiEndpoint: '/api/users/me/liked-places',
    queryParams: { districtId, category },
    suspense: true,
  });

  return (
    <>
      <LikedContentList
        activeSubTab="places"
        likedPlaces={data?.data || []}
        likedRoutes={[]}
        onContentUpdate={onContentUpdate}
      />
      <Pagination
        currentPage={page}
        totalPages={data?.totalPages || 1}
        onPageChange={setPage}
      />
    </>
  );
};

const LikedRoutes = ({
  districtId,
  onContentUpdate,
}: {
  districtId: string;
  onContentUpdate: () => void;
}) => {
  const { data, page, setPage } = usePaginatedQuery<RouteWithLikeData>({
    queryKey: ['user', 'me', 'routes', 'liked', districtId],
    apiEndpoint: '/api/users/me/liked-routes',
    queryParams: { districtId },
    suspense: true,
  });

  return (
    <>
      <LikedContentList
        activeSubTab="routes"
        likedPlaces={[]}
        likedRoutes={data?.data || []}
        onContentUpdate={onContentUpdate}
      />
      <Pagination
        currentPage={page}
        totalPages={data?.totalPages || 1}
        onPageChange={setPage}
      />
    </>
  );
};

interface LikesTabPanelProps {
  onContentUpdate: () => void;
  selectedDistrict: string;
  onDistrictChange: (districtId: string) => void;
  selectedCategory: PlaceCategory | undefined;
  onCategoryChange: (category: PlaceCategory | undefined) => void;
}

export default function LikesTabPanel({
  onContentUpdate,
  selectedDistrict,
  onDistrictChange,
  selectedCategory,
  onCategoryChange,
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
      {activeSubTab === 'places' && (
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
        />
      )}
      <Suspense fallback={<ListSkeleton />}>
        {activeSubTab === 'places' ? (
          <LikedPlaces
            districtId={selectedDistrict}
            category={selectedCategory}
            onContentUpdate={onContentUpdate}
          />
        ) : (
          <LikedRoutes
            districtId={selectedDistrict}
            onContentUpdate={onContentUpdate}
          />
        )}
      </Suspense>
    </div>
  );
}

