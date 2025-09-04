'use client';

import { useState, useCallback, useEffect } from 'react';
import MainContainer from '~/src/components/layout/main-container';
import MyPageTabs, { type MyPageTab } from '~/src/components/mypage/MyPageTabs';
import { PlaceCategory } from '@prisma/client';

import { useMyPageData } from '~/src/hooks/mypage/useMyPageData';
import { useMyPageModals } from '~/src/hooks/mypage/useMyPageModals';

import ProfileTabPanel from '~/src/components/mypage/panels/ProfileTabPanel';
import ContentTabPanel from '~/src/components/mypage/panels/ContentTabPanel';
import LikesTabPanel from '~/src/components/mypage/panels/LikesTabPanel';
import MessagesTabPanel from '~/src/components/mypage/panels/MessagesTabPanel';

const MyPage = () => {
  const [activeTab, setActiveTab] = useState<MyPageTab>('profile');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | undefined>();

  const {
    session,
    status,
    user,
    setUser,
    myCreatedPlaces,
    setMyCreatedPlaces,
    myCreatedRoutes,
    setMyCreatedRoutes,
    likedPlaces,
    setLikedPlaces,
    likedRoutes,
    setLikedRoutes,
    isLoading,
    refreshContent,
  } = useMyPageData(activeTab, selectedDistrict, selectedCategory);

  useEffect(() => {
    setSelectedCategory(undefined);
    setSelectedDistrict('all');
  }, [activeTab]);

  const {
    openAddPlaceModal,
    openAddRouteModal,
    openEditPlaceModal,
    openEditRouteModal,
  } = useMyPageModals(refreshContent);

  const handleDeletePlace = useCallback(
    async (placeId: string) => {
      if (!confirm('정말로 이 장소를 삭제하시겠습니까?')) return;
      try {
        const res = await fetch(`/api/places/${placeId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(await res.text());
        alert('장소가 삭제되었습니다.');
        refreshContent();
      } catch (e) {
        alert(
          `장소 삭제 실패: ${e instanceof Error ? e.message : '알 수 없는 오류'}`
        );
      }
    },
    [refreshContent],
  );

  const handleDeleteRoute = useCallback(
    async (routeId: string) => {
      if (!confirm('정말로 이 루트를 삭제하시겠습니까?')) return;
      try {
        const res = await fetch(`/api/routes/${routeId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(await res.text());
        alert('루트가 삭제되었습니다.');
        refreshContent();
      } catch (e) {
        alert(
          `루트 삭제 실패: ${e instanceof Error ? e.message : '알 수 없는 오류'}`
        );
      }
    },
    [refreshContent],
  );

  const renderTabContent = () => {
    if (isLoading && activeTab !== 'profile') {
      return <div className="text-center py-8">콘텐츠 로딩 중...</div>;
    }

    switch (activeTab) {
      case 'profile':
        return user ? (
          <ProfileTabPanel user={user} onProfileUpdated={setUser} />
        ) : null;
      case 'content':
        return (
          <ContentTabPanel
            myCreatedPlaces={myCreatedPlaces.data || []}
            myCreatedRoutes={myCreatedRoutes.data || []}
            onAddPlace={openAddPlaceModal}
            onAddRoute={openAddRouteModal}
            onEditPlace={openEditPlaceModal}
            onEditRoute={openEditRouteModal}
            onDeletePlace={handleDeletePlace}
            onDeleteRoute={handleDeleteRoute}
            placesTotalPages={myCreatedPlaces.totalPages || 1}
            placesCurrentPage={myCreatedPlaces.currentPage || 1}
            onPlacePageChange={(page) => setMyCreatedPlaces(prev => ({ ...prev, currentPage: page }))}
            routesTotalPages={myCreatedRoutes.totalPages || 1}
            routesCurrentPage={myCreatedRoutes.currentPage || 1}
            onRoutePageChange={(page) => setMyCreatedRoutes(prev => ({ ...prev, currentPage: page }))}
            selectedDistrict={selectedDistrict}
            onDistrictChange={setSelectedDistrict}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        );
      case 'likes':
        return (
          <LikesTabPanel
            likedPlaces={likedPlaces.data || []}
            setLikedPlaces={setLikedPlaces}
            likedRoutes={likedRoutes || { data: [], totalPages: 1, currentPage: 1 }}
            setLikedRoutes={setLikedRoutes}
            placesTotalPages={likedPlaces.totalPages || 1}
            placesCurrentPage={likedPlaces.currentPage || 1}
            onPlacePageChange={(page) => setLikedPlaces(prev => ({ ...prev, currentPage: page }))}
            routesTotalPages={likedRoutes.totalPages || 1}
            routesCurrentPage={likedRoutes.currentPage || 1}
            onRoutePageChange={(page) => setLikedRoutes(prev => ({ ...prev, currentPage: page }))}
            selectedDistrict={selectedDistrict}
            onDistrictChange={setSelectedDistrict}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        );
      case 'messages':
        return <MessagesTabPanel />;
      default:
        return null;
    }
  };

  if (status === 'loading') return <MainContainer>로딩 중...</MainContainer>;
  if (!session) return <MainContainer>로그인 후 이용해주세요.</MainContainer>;

  return (
    <MainContainer className="flex flex-col items-center py-8">
      <h1 className="text-3xl font-bold mb-8">마이페이지</h1>
      <MyPageTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="w-full max-w-4xl space-y-8">{renderTabContent()}</div>
    </MainContainer>
  );
};

export default MyPage;
