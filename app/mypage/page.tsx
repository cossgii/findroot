'use client';

import { Suspense, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import MainContainer from '~/src/components/layout/MainContainer';
import MyPageTabs, { type MyPageTab } from '~/src/components/mypage/MyPageTabs';
import { PlaceCategory } from '~/src/types/shared';
import { useMyPageModals } from '~/src/hooks/mypage/useMyPageModals';
import ProfileTabPanel from '~/src/components/mypage/panels/ProfileTabPanel';
import ContentTabPanel from '~/src/components/mypage/panels/ContentTabPanel';
import LikesTabPanel from '~/src/components/mypage/panels/LikesTabPanel';
import MessagesTabPanel from '~/src/components/mypage/panels/MessagesTabPanel';
import MyPageSkeleton from '~/src/components/mypage/MyPageSkeleton';
import { useSession } from 'next-auth/react';

const MyPageContent = () => {
  const [activeTab, setActiveTab] = useState<MyPageTab>('profile');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | undefined>();
  const queryClient = useQueryClient();

  const refreshContent = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
  }, [queryClient]);

  const { openAddPlaceModal, openAddRouteModal, openEditPlaceModal, openEditRouteModal } =
    useMyPageModals(refreshContent);

  const handleDeletePlace = useCallback(
    async (placeId: string) => {
      if (!confirm('정말로 이 장소를 삭제하시겠습니까?')) return;
      try {
        const res = await fetch(`/api/places/${placeId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(await res.text());
        alert('장소가 삭제되었습니다.');
        queryClient.invalidateQueries({ queryKey: ['user', 'me', 'places', 'created'] });
      } catch (e) {
        alert(`장소 삭제 실패: ${e instanceof Error ? e.message : '알 수 없는 오류'}`);
      }
    },
    [queryClient],
  );

  const handleDeleteRoute = useCallback(
    async (routeId: string) => {
      if (!confirm('정말로 이 루트를 삭제하시겠습니까?')) return;
      try {
        const res = await fetch(`/api/routes/${routeId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(await res.text());
        alert('루트가 삭제되었습니다.');
        queryClient.invalidateQueries({ queryKey: ['user', 'me', 'routes', 'created'] });
      } catch (e) {
        alert(`루트 삭제 실패: ${e instanceof Error ? e.message : '알 수 없는 오류'}`);
      }
    },
    [queryClient],
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTabPanel />;
      case 'content':
        return (
          <ContentTabPanel
            onAddPlace={openAddPlaceModal}
            onAddRoute={openAddRouteModal}
            onEditPlace={openEditPlaceModal}
            onEditRoute={openEditRouteModal}
            onDeletePlace={handleDeletePlace}
            onDeleteRoute={handleDeleteRoute}
            selectedDistrict={selectedDistrict}
            onDistrictChange={setSelectedDistrict}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        );
      case 'likes':
        return (
          <LikesTabPanel
            onContentUpdate={refreshContent}
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

  return (
    <>
      <MyPageTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="w-full max-w-4xl space-y-8">
        <Suspense fallback={<MyPageSkeleton showTabs={false} />}>
          {renderTabContent()}
        </Suspense>
      </div>
    </>
  );
};

const MyPage = () => {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <MainContainer className="flex flex-col items-center py-8">
        <h1 className="text-3xl font-bold mb-8">마이페이지</h1>
        <MyPageSkeleton />
      </MainContainer>
    );
  }

  if (!session) {
    return <MainContainer>로그인 후 이용해주세요.</MainContainer>;
  }

  return (
    <MainContainer className="flex flex-col items-center py-8">
      <h1 className="text-3xl font-bold mb-8">마이페이지</h1>
      <MyPageContent />
    </MainContainer>
  );
};

export default MyPage;
