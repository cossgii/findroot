'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { User, Like, Place, Route } from '@prisma/client';
import { useSetAtom } from 'jotai';
import { modalAtom } from '~/src/stores/app-store';
import MainContainer from '~/src/components/layout/main-container';
import Button from '~/src/components/common/button';
import MyPageTabs, {
  type MyPageTab,
} from '~/src/components/mypage/MyPageTabs';
import UserProfileDisplay from '~/src/components/mypage/profile/UserProfileDisplay';
import UserProfileEditForm from '~/src/components/mypage/profile/UserProfileEditForm';
import SendMessageForm from '~/src/components/mypage/messages/SendMessageForm';
import SentMessages from '~/src/components/mypage/messages/SentMessages';
import MyPageContentToolbar, {
  type MyPageSubTab,
} from '~/src/components/mypage/MyPageContentToolbar';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';

interface LikedPlace extends Like {
  place: Place;
}

interface MyLikedRoute extends Like {
  route: Route;
}

const MyPage = () => {
  const { data: session, status } = useSession();
  const setModal = useSetAtom(modalAtom);

  // State
  const [activeTab, setActiveTab] = useState<MyPageTab>('profile');
  const [activeSubTab, setActiveSubTab] = useState<MyPageSubTab>('places');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [messageSentTrigger, setMessageSentTrigger] = useState(0);

  // Content State
  const [likedPlaces, setLikedPlaces] = useState<LikedPlace[]>([]);
  const [likedRoutes, setLikedRoutes] = useState<MyLikedRoute[]>([]);
  const [myCreatedPlaces, setMyCreatedPlaces] = useState<Place[]>([]);
  const [myCreatedRoutes, setMyCreatedRoutes] = useState<Route[]>([]);
  const [isContentLoading, setIsContentLoading] = useState(false);

  // Data Fetching
  const fetchProfileData = useCallback(async () => {
    if (!session?.user?.id) return;
    const res = await fetch('/api/users/me').catch(() => null);
    if (res?.ok) setUser(await res.json());
  }, [session]);

  const fetchMyContent = useCallback(async () => {
    if (!session?.user?.id) return;
    setIsContentLoading(true);
    const [placesRes, routesRes] = await Promise.all([
      fetch(`/api/users/${session.user.id}/places`),
      fetch(`/api/users/${session.user.id}/routes`),
    ]);
    if (placesRes.ok) setMyCreatedPlaces(await placesRes.json());
    if (routesRes.ok) setMyCreatedRoutes(await routesRes.json());
    setIsContentLoading(false);
  }, [session]);

  const fetchLikedContent = useCallback(async () => {
    if (!session?.user?.id) return;
    setIsContentLoading(true);
    const [placesRes, routesRes] = await Promise.all([
      fetch('/api/users/me/liked-places'),
      fetch('/api/users/me/liked-routes'),
    ]);
    if (placesRes.ok) setLikedPlaces(await placesRes.json());
    if (routesRes.ok) setLikedRoutes(await routesRes.json());
    setIsContentLoading(false);
  }, [session]);

  useEffect(() => {
    if (status !== 'authenticated') return;

    // Reset sub-tab and filter when main tab changes
    setActiveSubTab('places');
    setSelectedDistrict('all');

    switch (activeTab) {
      case 'profile':
        fetchProfileData();
        break;
      case 'content':
        fetchMyContent();
        break;
      case 'likes':
        fetchLikedContent();
        break;
      case 'messages':
        // Data for messages is fetched inside its own components
        break;
    }
  }, [status, activeTab, fetchProfileData, fetchMyContent, fetchLikedContent]);

  // Event Handlers
  const handleContentUpdated = useCallback(() => {
    if (activeTab === 'content') fetchMyContent();
    if (activeTab === 'likes') fetchLikedContent();
  }, [activeTab, fetchMyContent, fetchLikedContent]);

  const openAddPlaceModal = useCallback(
    () =>
      setModal({
        type: 'ADD_PLACE',
        props: { onPlaceAdded: handleContentUpdated },
      }),
    [setModal, handleContentUpdated],
  );
  const openAddRouteModal = useCallback(
    () =>
      setModal({
        type: 'ADD_ROUTE',
        props: { onRouteAdded: handleContentUpdated },
      }),
    [setModal, handleContentUpdated],
  );
  const handleEditPlace = useCallback(
    (placeId: string) =>
      setModal({
        type: 'EDIT_PLACE',
        props: { placeId, onPlaceUpdated: handleContentUpdated },
      }),
    [setModal, handleContentUpdated],
  );
  const handleEditRoute = useCallback(
    (routeId: string) =>
      setModal({
        type: 'EDIT_ROUTE',
        props: { routeId, onRouteUpdated: handleContentUpdated },
      }),
    [setModal, handleContentUpdated],
  );

  const handleDeletePlace = useCallback(async (placeId: string) => {
    if (!confirm('정말로 이 장소를 삭제하시겠습니까?')) return;
    const res = await fetch(`/api/places/${placeId}`, { method: 'DELETE' });
    if (res.ok) {
      alert('장소가 삭제되었습니다.');
      setMyCreatedPlaces((prev) => prev.filter((p) => p.id !== placeId));
    } else {
      alert(`장소 삭제 실패: ${(await res.json()).message}`);
    }
  }, []);

  const handleDeleteRoute = useCallback(async (routeId: string) => {
    if (!confirm('정말로 이 루트를 삭제하시겠습니까?')) return;
    const res = await fetch(`/api/routes/${routeId}`, { method: 'DELETE' });
    if (res.ok) {
      alert('루트가 삭제되었습니다.');
      setMyCreatedRoutes((prev) => prev.filter((r) => r.id !== routeId));
    } else {
      alert(`루트 삭제 실패: ${(await res.json()).message}`);
    }
  }, []);

  // Memoized filtered content
  const filteredCreatedPlaces = useMemo(() => {
    if (selectedDistrict === 'all') return myCreatedPlaces;
    const districtName = SEOUL_DISTRICTS.find(
      (d) => d.id === selectedDistrict,
    )?.name;
    return myCreatedPlaces.filter((place) => place.district === districtName);
  }, [myCreatedPlaces, selectedDistrict]);

  const filteredCreatedRoutes = useMemo(() => {
    if (selectedDistrict === 'all') return myCreatedRoutes;
    const districtName = SEOUL_DISTRICTS.find(
      (d) => d.id === selectedDistrict,
    )?.name;
    return myCreatedRoutes.filter((route) => route.districtId === districtName);
  }, [myCreatedRoutes, selectedDistrict]);

  const filteredLikedPlaces = useMemo(() => {
    if (selectedDistrict === 'all') return likedPlaces;
    const districtName = SEOUL_DISTRICTS.find(
      (d) => d.id === selectedDistrict,
    )?.name;
    return likedPlaces.filter((like) => like.place?.district === districtName);
  }, [likedPlaces, selectedDistrict]);

  const filteredLikedRoutes = useMemo(() => {
    if (selectedDistrict === 'all') return likedRoutes;
    return likedRoutes.filter(
      (like) => like.route?.districtId === selectedDistrict,
    );
  }, [likedRoutes, selectedDistrict]);

  // Render Logic
  if (status === 'loading') return <MainContainer>로딩 중...</MainContainer>;
  if (!session || !user)
    return <MainContainer>로그인 후 이용해주세요.</MainContainer>;

  const renderTabContent = () => {
    if (isContentLoading) {
      return <div className="text-center py-8">콘텐츠 로딩 중...</div>;
    }

    switch (activeTab) {
      case 'profile':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            {isEditing ? (
              <UserProfileEditForm
                user={user}
                onSave={(updatedUser) => {
                  setUser({ ...updatedUser }); // Force a new object reference
                  setIsEditing(false);
                }}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <>
                <UserProfileDisplay user={user} />
                <div className="mt-6 flex justify-center">
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="w-auto px-6"
                  >
                    프로필 수정
                  </Button>
                </div>
              </>
            )}
          </div>
        );
      case 'content':
        return (
          <div>
            <MyPageContentToolbar
              activeTab="content"
              activeSubTab={activeSubTab}
              onSubTabClick={setActiveSubTab}
              selectedDistrict={selectedDistrict}
              onDistrictChange={setSelectedDistrict}
              onAddPlace={openAddPlaceModal}
              onAddRoute={openAddRouteModal}
            />
            {activeSubTab === 'places' ? (
              filteredCreatedPlaces.length > 0 ? (
                <ul className="space-y-3">
                  {filteredCreatedPlaces.map((place) => (
                    <li
                      key={place.id}
                      className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold">{place.name}</p>
                        <p className="text-sm text-gray-500">
                          {place.address}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleEditPlace(place.id)}
                          variant="outlined"
                          size="small"
                          className="w-auto px-3 py-1 text-xs"
                        >
                          수정
                        </Button>
                        <Button
                          onClick={() => handleDeletePlace(place.id)}
                          variant="outlined"
                          size="small"
                          className="w-auto px-3 py-1 text-xs"
                        >
                          삭제
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-center py-10">
                  등록한 장소가 없습니다.
                </p>
              )
            ) : filteredCreatedRoutes.length > 0 ? (
              <ul className="space-y-3">
                {filteredCreatedRoutes.map((route) => (
                  <li
                    key={route.id}
                    className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold">{route.name}</p>
                      <p className="text-sm text-gray-500">
                        {route.description}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleEditRoute(route.id)}
                        variant="outlined"
                        size="small"
                        className="w-auto px-3 py-1 text-xs"
                      >
                        수정
                      </Button>
                      <Button
                        onClick={() => handleDeleteRoute(route.id)}
                        variant="outlined"
                        size="small"
                        className="w-auto px-3 py-1 text-xs"
                      >
                        삭제
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center py-10">
                등록한 루트가 없습니다.
              </p>
            )}
          </div>
        );
      case 'likes':
        return (
          <div>
            <MyPageContentToolbar
              activeTab="likes"
              activeSubTab={activeSubTab}
              onSubTabClick={setActiveSubTab}
              selectedDistrict={selectedDistrict}
              onDistrictChange={setSelectedDistrict}
              onAddPlace={() => {}}
              onAddRoute={() => {}}
            />
            {activeSubTab === 'places' ? (
              filteredLikedPlaces.length > 0 ? (
                <ul className="space-y-3">
                  {filteredLikedPlaces.map((like) => (
                    <li
                      key={like.id}
                      className="bg-white rounded-lg shadow-md p-4"
                    >
                      <p className="font-semibold">{like.place?.name}</p>
                      <p className="text-sm text-gray-500">
                        {like.place?.address}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-center py-10">
                  좋아요를 누른 장소가 없습니다.
                </p>
              )
            ) : filteredLikedRoutes.length > 0 ? (
              <ul className="space-y-3">
                {filteredLikedRoutes.map((like) => (
                  <li
                    key={like.id}
                    className="bg-white rounded-lg shadow-md p-4"
                  >
                    <p className="font-semibold">{like.route?.name}</p>
                    <p className="text-sm text-gray-500">
                      {like.route?.description}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center py-10">
                좋아요를 누른 루트가 없습니다.
              </p>
            )}
          </div>
        );
      case 'messages':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <SendMessageForm
              onMessageSent={() => setMessageSentTrigger((p) => p + 1)}
            />
            <div className="mt-8">
              <SentMessages key={messageSentTrigger} />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <MainContainer className="flex flex-col items-center py-8">
      <h1 className="text-3xl font-bold mb-8">마이페이지</h1>
      <MyPageTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="w-full max-w-4xl space-y-8">{renderTabContent()}</div>
    </MainContainer>
  );
};

export default MyPage;
