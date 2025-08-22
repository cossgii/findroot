'use client';

import { useState, useCallback } from 'react';
import MainContainer from '~/src/components/layout/main-container';
import MyPageTabs, { type MyPageTab } from '~/src/components/mypage/MyPageTabs';

import { useMyPageData } from '~/src/hooks/mypage/useMyPageData';
import { useMyPageModals } from '~/src/hooks/mypage/useMyPageModals';

import ProfileTabPanel from '~/src/components/mypage/panels/ProfileTabPanel';
import ContentTabPanel from '~/src/components/mypage/panels/ContentTabPanel';
import LikesTabPanel from '~/src/components/mypage/panels/LikesTabPanel';
import MessagesTabPanel from '~/src/components/mypage/panels/MessagesTabPanel';

const MyPage = () => {
  const [activeTab, setActiveTab] = useState<MyPageTab>('profile');

  const {
    session,
    status,
    user,
    setUser,
    myCreatedPlaces,
    myCreatedRoutes,
    likedPlaces,
    likedRoutes,
    isLoading,
    refreshContent,
    fetchMyCreatedPlaces,
    fetchLikedPlaces,
    fetchMyCreatedRoutes,
    fetchLikedRoutes,
  } = useMyPageData(activeTab);

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
        // Refetch the current page of places after deletion
        fetchMyCreatedPlaces(myCreatedPlaces.currentPage);
      } catch (e) {
        alert(
          `장소 삭제 실패: ${e instanceof Error ? e.message : '알 수 없는 오류'}`,
        );
      }
    },
    [fetchMyCreatedPlaces, myCreatedPlaces.currentPage],
  );

  const handleDeleteRoute = useCallback(
    async (routeId: string) => {
      // This would also need to be updated if/when routes are paginated
      if (!confirm('정말로 이 루트를 삭제하시겠습니까?')) return;
      try {
        const res = await fetch(`/api/routes/${routeId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(await res.text());
        alert('루트가 삭제되었습니다.');
        refreshContent(); // General refresh for now
      } catch (e) {
        alert(
          `루트 삭제 실패: ${e instanceof Error ? e.message : '알 수 없는 오류'}`,
        );
      }
    },
    [refreshContent],
  );

  const renderTabContent = () => {
    if (isLoading && activeTab !== 'profile') {
      // Profile has its own loading state sometimes
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
            myCreatedPlaces={myCreatedPlaces.data}
            myCreatedRoutes={myCreatedRoutes.data}
            onAddPlace={openAddPlaceModal}
            onAddRoute={openAddRouteModal}
            onEditPlace={openEditPlaceModal}
            onEditRoute={openEditRouteModal}
            onDeletePlace={handleDeletePlace}
            onDeleteRoute={handleDeleteRoute}
            placesTotalPages={myCreatedPlaces.totalPages}
            placesCurrentPage={myCreatedPlaces.currentPage}
            onPlacePageChange={fetchMyCreatedPlaces}
            routesTotalPages={myCreatedRoutes.totalPages}
            routesCurrentPage={myCreatedRoutes.currentPage}
            onRoutePageChange={fetchMyCreatedRoutes}
          />
        );
      case 'likes':
        console.log(
          'mypage/page.tsx: Passing likedRoutes to LikesTabPanel:',
          likedRoutes,
        );
        return (
          <LikesTabPanel
            likedPlaces={likedPlaces.data}
            likedRoutes={likedRoutes}
            placesTotalPages={likedPlaces.totalPages}
            placesCurrentPage={likedPlaces.currentPage}
            onPlacePageChange={fetchLikedPlaces}
            routesTotalPages={likedRoutes.totalPages}
            routesCurrentPage={likedRoutes.currentPage}
            onRoutePageChange={fetchLikedRoutes}
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
