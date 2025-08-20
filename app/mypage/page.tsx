'use client';

import { useState } from 'react';
import MainContainer from '~/src/components/layout/main-container';
import MyPageTabs, { type MyPageTab } from '~/src/components/mypage/MyPageTabs';

import { useMyPageData } from '~/src/hooks/mypage/useMyPageData';
import { useMyPageModals } from '~/src/hooks/mypage/useMyPageModals';
import { useMyPageActions } from '~/src/hooks/mypage/useMyPageActions';
import { useMyPageFilters } from '~/src/hooks/mypage/useMyPageFilters';

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
    setMyCreatedPlaces,
    myCreatedRoutes,
    setMyCreatedRoutes,
    likedPlaces,
    setLikedPlaces, // NEW
    likedRoutes,
    setLikedRoutes, // NEW
    isLoading,
    refreshContent,
  } = useMyPageData(activeTab);

  const {
    openAddPlaceModal,
    openAddRouteModal,
    openEditPlaceModal,
    openEditRouteModal,
  } = useMyPageModals(refreshContent);
  const { handleDeletePlace, handleDeleteRoute } = useMyPageActions({
    setMyCreatedPlaces,
    setMyCreatedRoutes,
  });

  const {
    selectedDistrict,
    setSelectedDistrict,
    filteredCreatedPlaces,
    filteredCreatedRoutes,
    filteredLikedPlaces,
    filteredLikedRoutes,
  } = useMyPageFilters({
    myCreatedPlaces,
    myCreatedRoutes,
    likedPlaces,
    likedRoutes,
  });

  const renderTabContent = () => {
    if (isLoading) {
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
            selectedDistrict={selectedDistrict}
            onDistrictChange={setSelectedDistrict}
            myCreatedPlaces={filteredCreatedPlaces}
            myCreatedRoutes={filteredCreatedRoutes}
            onAddPlace={openAddPlaceModal}
            onAddRoute={openAddRouteModal}
            onEditPlace={openEditPlaceModal}
            onEditRoute={openEditRouteModal}
            onDeletePlace={handleDeletePlace}
            onDeleteRoute={handleDeleteRoute}
          />
        );
      case 'likes':
        return (
          <LikesTabPanel
            selectedDistrict={selectedDistrict}
            onDistrictChange={setSelectedDistrict}
            likedPlaces={filteredLikedPlaces}
            setLikedPlaces={setLikedPlaces} // NEW
            likedRoutes={filteredLikedRoutes}
            setLikedRoutes={setLikedRoutes} // NEW
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
