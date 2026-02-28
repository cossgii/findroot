'use client';

import { useState } from 'react';
import { ClientUser as User } from '~/src/types/shared';
import { Restaurant, RouteWithLikeData } from '~/src/types/restaurant';
import MainContainer from '~/src/components/layout/MainContainer';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '~/src/components/common/Avatar';
import FollowButton from '~/src/components/user/FollowButton';
import { usePaginatedQuery } from '~/src/hooks/usePaginatedQuery';
import ListItemSkeleton from '~/src/components/mypage/content/ListItemSkeleton';
import CreatedContentList from '~/src/components/mypage/content/CreatedContentList';
import Pagination from '~/src/components/common/Pagination';
import { type MyPageSubTab } from '~/src/components/mypage/MyPageTabs';
import { cn } from '~/src/utils/class-name';
import { useAtomValue } from 'jotai';
import { selectedDistrictFilterAtom } from '~/src/stores/app-store';

interface UserProfileClientProps {
  profileUser: User;
  currentUserId?: string;
  initialPlaces: Restaurant[];
  initialRoutes: RouteWithLikeData[];
  initialIsFollowing: boolean;
}

const ListSkeleton = () => (
  <div className="space-y-3">
    <ListItemSkeleton />
    <ListItemSkeleton />
    <ListItemSkeleton />
  </div>
);

export default function UserProfileClient({
  profileUser,
  currentUserId,
  initialPlaces,
  initialRoutes,
  initialIsFollowing,
}: UserProfileClientProps) {
  const [activeTab, setActiveTab] = useState<MyPageSubTab>('places');
  const selectedDistrictFilter = useAtomValue(selectedDistrictFilterAtom);

  const {
    data: placesData,
    page: placesPage,
    setPage: setPlacesPage,
    isLoading: isLoadingPlaces,
  } = usePaginatedQuery<Restaurant>({
    queryKey: ['user', profileUser.id, 'places', selectedDistrictFilter],
    apiEndpoint: `/api/users/${profileUser.id}/places`,
    queryParams: { districtId: selectedDistrictFilter },
    initialData: {
      data: initialPlaces,
      totalPages: 1, // Placeholder
      currentPage: 1,
    },
  });

  const {
    data: routesData,
    page: routesPage,
    setPage: setRoutesPage,
    isLoading: isLoadingRoutes,
  } = usePaginatedQuery<RouteWithLikeData>({
    queryKey: ['user', profileUser.id, 'routes', selectedDistrictFilter],
    apiEndpoint: `/api/users/${profileUser.id}/routes`,
    queryParams: { districtId: selectedDistrictFilter },
    initialData: {
      data: initialRoutes,
      totalPages: 1, // Placeholder
      currentPage: 1,
    },
  });

  const isMyProfile = currentUserId === profileUser.id;

  return (
    <MainContainer className="py-8">
      <div className="flex flex-col items-center space-y-4 mb-8">
        <Avatar size="large">
          <AvatarImage
            src={profileUser.image || ''}
            alt={profileUser.name || 'User Avatar'}
          />
          <AvatarFallback>{profileUser.name?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
        <h1 className="text-3xl font-bold">
          {profileUser.name || '이름 없음'}
        </h1>
        <p className="text-gray-600">{profileUser.loginId}</p>
        {!isMyProfile && currentUserId && (
          <FollowButton
            targetUserId={profileUser.id}
            initialIsFollowing={initialIsFollowing}
          />
        )}
      </div>

      <div className="w-full border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('places')}
            className={cn(
              'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium',
              activeTab === 'places'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
            )}
          >
            장소
          </button>
          <button
            onClick={() => setActiveTab('routes')}
            className={cn(
              'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium',
              activeTab === 'routes'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
            )}
          >
            루트
          </button>
        </nav>
      </div>

      <div>
        {activeTab === 'places' ? (
          isLoadingPlaces ? (
            <ListSkeleton />
          ) : (
            <>
              <CreatedContentList
                activeSubTab="places"
                places={placesData?.data || []}
                routes={[]}
                onEditPlace={() => {}}
                onDeletePlace={() => {}}
                onEditRoute={() => {}}
                onDeleteRoute={() => {}}
                onContentUpdate={() => {}}
                isMyProfile={isMyProfile}
              />
              <Pagination
                currentPage={placesPage}
                totalPages={placesData?.totalPages || 1}
                onPageChange={setPlacesPage}
              />
            </>
          )
        ) : isLoadingRoutes ? (
          <ListSkeleton />
        ) : (
          <>
            <CreatedContentList
              activeSubTab="routes"
              places={[]}
              routes={routesData?.data || []}
              onEditPlace={() => {}}
              onDeletePlace={() => {}}
              onEditRoute={() => {}}
              onDeleteRoute={() => {}}
              onContentUpdate={() => {}}
              isMyProfile={isMyProfile}
            />
            <Pagination
              currentPage={routesPage}
              totalPages={routesData?.totalPages || 1}
              onPageChange={setRoutesPage}
            />
          </>
        )}
      </div>
    </MainContainer>
  );
}
