'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { User } from '@prisma/client';
import { useSetAtom } from 'jotai';
import { modalAtom } from '~/src/stores/app-store';
import UserProfileDisplay from '~/src/components/mypage/UserProfileDisplay';
import UserProfileEditForm from '~/src/components/mypage/UserProfileEditForm';
import MessageInbox from '~/src/components/mypage/MessageInbox';
import SendMessageForm from '~/src/components/mypage/SendMessageForm';
import MainContainer from '~/src/components/layout/main-container';
import Button from '~/src/components/common/button';
import ToggleSwitch from '~/src/components/common/ToggleSwitch';

const MyPage = () => {
  const { data: session, status } = useSession();
  const setModal = useSetAtom(modalAtom);
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [messageSentCount, setMessageSentCount] = useState(0); // 메시지 전송 시 갱신 트리거
  const [likedPlaces, setLikedPlaces] = useState<any[]>([]); // TODO: Like & Place 타입 정의
  const [likedRoutes, setLikedRoutes] = useState<any[]>([]); // TODO: Like & Route 타입 정의
  const [isProfileAndMessageView, setIsProfileAndMessageView] = useState(true); // true: 프로필/메시지, false: 장소/루트

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      const fetchUserProfileAndLikedItems = async () => {
        try {
          const [userRes, likedPlacesRes, likedRoutesRes] = await Promise.all([
            fetch('/api/users/me'),
            fetch('/api/users/me/liked-places'),
            fetch('/api/users/me/liked-routes'),
          ]);

          if (userRes.ok) {
            const userData: User = await userRes.json();
            setUser(userData);
          } else {
            console.error('Failed to fetch user profile');
          }

          if (likedPlacesRes.ok) {
            const likedPlacesData = await likedPlacesRes.json();
            setLikedPlaces(likedPlacesData);
          } else {
            console.error('Failed to fetch liked places');
          }

          if (likedRoutesRes.ok) {
            const likedRoutesData = await likedRoutesRes.json();
            setLikedRoutes(likedRoutesData);
          } else {
            console.error('Failed to fetch liked routes');
          }
        } catch (error) {
          console.error('Error fetching user data and liked items:', error);
        }
      };
      fetchUserProfileAndLikedItems();
    }
  }, [session, status]);

  if (status === 'loading') {
    return <MainContainer>로딩 중...</MainContainer>;
  }

  if (!session || !user) {
    return <MainContainer>로그인 후 이용해주세요.</MainContainer>;
  }

  const handleSave = (updatedUser: User) => {
    setUser(updatedUser);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handlePlaceAdded = () => {
    console.log('장소가 성공적으로 추가되었습니다.');
    // 장소 목록 새로고침 로직 추가 필요
  };

  const handleRouteAdded = () => {
    console.log('루트가 성공적으로 추가되었습니다.');
    // 루트 목록 새로고침 로직 추가 필요
  };

  const handleMessageSent = () => {
    setMessageSentCount((prev) => prev + 1);
  };

  const openAddPlaceModal = () => {
    setModal({ type: 'ADD_PLACE', props: { onPlaceAdded: handlePlaceAdded } });
  };

  const openAddRouteModal = () => {
    setModal({ type: 'ADD_ROUTE', props: { onRouteAdded: handleRouteAdded } });
  };

  return (
    <MainContainer className="flex flex-col items-center py-8">
      <h1 className="text-3xl font-bold mb-8">마이페이지</h1>

      <div className="flex justify-center items-center mb-8">
        <ToggleSwitch
          isOn={!isProfileAndMessageView} // 토글 스위치 상태 반전
          onToggle={() => setIsProfileAndMessageView(!isProfileAndMessageView)}
          optionLabels={['프로필/메시지', '장소/루트']}
        />
      </div>

      {isProfileAndMessageView ? (
        // 프로필 및 메시지 섹션
        <div className="w-full max-w-md space-y-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            {isEditing ? (
              <UserProfileEditForm user={user} onSave={handleSave} onCancel={handleCancel} />
            ) : (
              <>
                <UserProfileDisplay user={user} />
                <div className="mt-6 flex justify-center">
                  <Button onClick={() => setIsEditing(true)} className="w-auto px-6">
                    프로필 수정
                  </Button>
                </div>
              </>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <SendMessageForm onMessageSent={handleMessageSent} />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <MessageInbox key={messageSentCount} />
          </div>
        </div>
      ) : (
        // 장소 및 루트 섹션
        <div className="w-full max-w-md space-y-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">콘텐츠 관리</h2>
            <div className="flex justify-center space-x-4">
              <Button onClick={openAddPlaceModal} className="w-auto px-6">
                장소 등록
              </Button>
              <Button onClick={openAddRouteModal} className="w-auto px-6">
                루트 등록
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">내가 좋아요 누른 장소</h2>
            {likedPlaces.length > 0 ? (
              <ul className="space-y-2">
                {likedPlaces.map((like) => (
                  <li key={like.id} className="bg-gray-100 p-3 rounded-md">
                    {like.place?.name} ({like.place?.address})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">좋아요를 누른 장소가 없습니다.</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">내가 좋아요 누른 루트</h2>
            {likedRoutes.length > 0 ? (
              <ul className="space-y-2">
                {likedRoutes.map((like) => (
                  <li key={like.id} className="bg-gray-100 p-3 rounded-md">
                    {like.route?.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">좋아요를 누른 루트가 없습니다.</p>
            )}
          </div>
        </div>
      )}
    </MainContainer>
  );
};

export default MyPage;
