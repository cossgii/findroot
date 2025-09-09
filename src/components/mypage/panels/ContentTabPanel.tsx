'use client';

import { Suspense, useState } from 'react';
import { useSession } from 'next-auth/react';
import { PlaceCategory } from '~/src/types/shared';
import MyPageContentToolbar from '~/src/components/mypage/MyPageContentToolbar';
import CreatedContentList from '~/src/components/mypage/content/CreatedContentList';
import Pagination from '~/src/components/common/Pagination';
import CategoryFilter from '~/src/components/mypage/CategoryFilter';
import { usePaginatedQuery } from '~/src/hooks/usePaginatedQuery';
import { Restaurant, RouteWithLikeData } from '~/src/types/restaurant';
import ListItemSkeleton from '../content/ListItemSkeleton';

const ListSkeleton = () => (
  <div className="space-y-3">
    <ListItemSkeleton />
    <ListItemSkeleton />
    <ListItemSkeleton />
  </div>
);

const CreatedPlaces = ({
  districtId,
  category,
  onEditPlace,
  onDeletePlace,
}: {
  districtId: string;
  category?: PlaceCategory;
  onEditPlace: (id: string) => void;
  onDeletePlace: (id: string) => void;
}) => {
  const { data: session } = useSession();
  const userId = session?.user?.id || '';
  const { data, page, setPage } = usePaginatedQuery<Restaurant>({
    queryKey: ['user', userId, 'places', 'created', districtId, category || 'all'],
    apiEndpoint: `/api/users/${userId}/places`,
    queryParams: { districtId, category },
    suspense: true,
    enabled: !!userId,
  });

  return (
    <>
      <CreatedContentList
        activeSubTab="places"
        places={data?.data || []}
        routes={[]}
        onEditPlace={onEditPlace}
        onDeletePlace={onDeletePlace}
        onEditRoute={() => {}}
        onDeleteRoute={() => {}}
      />
      <Pagination
        currentPage={page}
        totalPages={data?.totalPages || 1}
        onPageChange={setPage}
      />
    </>
  );
};

const CreatedRoutes = ({
  districtId,
  onEditRoute,
  onDeleteRoute,
}: {
  districtId: string;
  onEditRoute: (id: string) => void;
  onDeleteRoute: (id: string) => void;
}) => {
  const { data: session } = useSession();
  const userId = session?.user?.id || '';
  const { data, page, setPage } = usePaginatedQuery<RouteWithLikeData>({
    queryKey: ['user', userId, 'routes', 'created', districtId],
    apiEndpoint: `/api/users/${userId}/routes`,
    queryParams: { districtId },
    suspense: true,
    enabled: !!userId,
  });

  return (
    <>
      <CreatedContentList
        activeSubTab="routes"
        places={[]}
        routes={data?.data || []}
        onEditPlace={() => {}}
        onDeletePlace={() => {}}
        onEditRoute={onEditRoute}
        onDeleteRoute={onDeleteRoute}
      />
      <Pagination
        currentPage={page}
        totalPages={data?.totalPages || 1}
        onPageChange={setPage}
      />
    </>
  );
};

interface ContentTabPanelProps {
  onAddPlace: () => void;
  onAddRoute: () => void;
  onEditPlace: (id: string) => void;
  onDeletePlace: (id: string) => void;
  onEditRoute: (id: string) => void;
  onDeleteRoute: (id: string) => void;
  selectedDistrict: string;
  onDistrictChange: (districtId: string) => void;
  selectedCategory: PlaceCategory | undefined;
  onCategoryChange: (category: PlaceCategory | undefined) => void;
}

export default function ContentTabPanel({
  selectedDistrict,
  onDistrictChange,
  selectedCategory,
  onCategoryChange,
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
      {activeSubTab === 'places' && (
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
        />
      )}
      <Suspense fallback={<ListSkeleton />}>
        {activeSubTab === 'places' ? (
          <CreatedPlaces
            districtId={selectedDistrict}
            category={selectedCategory}
            onEditPlace={handlers.onEditPlace}
            onDeletePlace={handlers.onDeletePlace}
          />
        ) : (
          <CreatedRoutes
            districtId={selectedDistrict}
            onEditRoute={handlers.onEditRoute}
            onDeleteRoute={handlers.onDeleteRoute}
          />
        )}
      </Suspense>
    </div>
  );
}
