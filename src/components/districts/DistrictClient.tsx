'use client';

import { useMemo, useCallback, useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import KakaoMap from '~/src/components/common/KakaoMap';
import { useSetAtom, useAtomValue, useAtom } from 'jotai';
import {
  modalAtom,
  isKakaoMapApiLoadedAtom,
  contentCreatorAtom,
  routeViewAtom,
} from '~/src/stores/app-store';
import SortDropdown from '~/src/components/common/SortDropdown';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { PlaceCategory, RoutePurpose } from '@prisma/client';
import { cn } from '~/src/utils/class-name';
import PlaceList from './PlaceList';
import RestaurantListSkeletonGrid from './RestaurantListSkeletonGrid';
import { Place } from '@prisma/client';
import { useSession } from 'next-auth/react';
import RouteToggle from '~/src/components/common/RouteToggle';
import FeaturedRouteCarousel from '~/src/components/routes/FeaturedRouteCarousel';
import { ClientRoute } from '~/src/types/shared';
import RouteListSkeletonGrid from '~/src/components/routes/RouteListSkeletonGrid';
import RouteList from '~/src/components/routes/RouteList';
import PurposeSelectionOverlay from './PurposeSelectionOverlay';
import PurposeDropdown from '~/src/components/common/PurposeDropdown';

type SerializablePlace = Omit<Place, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

type PlaceWithLikes = SerializablePlace & {
  likesCount: number;
  isLiked: boolean;
};

interface DistrictClientProps {
  districtId: string;
  districtInfo: { name: string; lat: number; lng: number } | undefined;
  center: { lat: number; lng: number };
  currentSort: 'recent' | 'likes';
  currentCategory?: PlaceCategory;
  currentPage: number;
  initialPlaces: PlaceWithLikes[];
  initialTotalPages: number;
  initialRoutes: ClientRoute[];
  initialTotalRoutePages: number;
}

interface PlaceLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  category: PlaceCategory;
}

const fetchAllPlaceLocations = async (
  districtName: string | undefined,
  targetUserId?: string,
): Promise<PlaceLocation[]> => {
  if (!districtName) return [];
  const params = new URLSearchParams({ district: districtName });
  if (targetUserId) {
    params.set('targetUserId', targetUserId);
  }
  const response = await fetch(`/api/places/locations?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch all place locations');
  }
  return response.json();
};

const TABS: { label: string; value?: PlaceCategory }[] = [
  { label: '전체', value: undefined },
  { label: '식사', value: PlaceCategory.MEAL },
  { label: '음료', value: PlaceCategory.DRINK },
];

export default function DistrictClient({
  districtId,
  districtInfo,
  center,
  currentPage,
  currentSort,
  currentCategory,
  initialPlaces,
  initialTotalPages,
  initialRoutes,
  initialTotalRoutePages,
}: DistrictClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const setModal = useSetAtom(modalAtom);
  const isApiLoaded = useAtomValue(isKakaoMapApiLoadedAtom);
  const { data: session, status: sessionStatus } = useSession();
  const contentCreator = useAtomValue(contentCreatorAtom);

  const initialPurposeFromUrl = searchParams.get('purpose') as
    | RoutePurpose
    | undefined;
  const [routeView, setRouteView] = useAtom(routeViewAtom);
  const [isPurposeOverlayOpen, setIsPurposeOverlayOpen] = useState(false);
  const currentPurpose = searchParams.get('purpose') as
    | RoutePurpose
    | undefined;

  useEffect(() => {
    if (initialPurposeFromUrl && routeView !== 'routes') {
      setRouteView('routes');
    } else if (!initialPurposeFromUrl && routeView !== 'districts') {
      setRouteView('districts');
    }
  }, [initialPurposeFromUrl, setRouteView]);

  const handleUrlChange = useCallback(
    (newParams: Record<string, string | number | undefined>) => {
      const params = new URLSearchParams();
      params.set('sort', newParams.sort?.toString() || currentSort);
      params.set('page', newParams.page?.toString() || '1');
      if (newParams.category) {
        params.set('category', newParams.category.toString());
      } else {
        params.delete('category');
      }
      if (newParams.purpose) {
        params.set('purpose', newParams.purpose.toString());
      } else {
        params.delete('purpose');
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [currentSort, pathname, router],
  );

  useEffect(() => {
    if (routeView === 'districts') {
      setIsPurposeOverlayOpen(false);
      if (currentPurpose) {
        handleUrlChange({
          sort: currentSort,
          page: currentPage,
          category: currentCategory,
          purpose: undefined,
        });
      }
    }
  }, [
    routeView,
    currentPurpose,
    handleUrlChange,
    currentSort,
    currentPage,
    currentCategory,
  ]);

  const targetUserId =
    contentCreator.type === 'user'
      ? contentCreator.userId
      : contentCreator.type === 'me' && session?.user?.id
        ? session.user.id
        : undefined;

  const { data: allPlaceLocations = [] } = useQuery<PlaceLocation[], Error>({
    queryKey: ['placeLocations', districtInfo?.name, targetUserId],
    queryFn: () => fetchAllPlaceLocations(districtInfo?.name, targetUserId),
    enabled: !!districtInfo?.name && routeView === 'districts',
  });

  const handleCategoryChange = useCallback(
    (category?: PlaceCategory) => {
      handleUrlChange({
        category: category || undefined,
        page: 1,
        purpose: currentPurpose,
      });
    },
    [handleUrlChange, currentPurpose],
  );

  const handleSortChange = useCallback(
    (sortOption: string) => {
      handleUrlChange({
        sort: sortOption,
        page: 1,
        category: currentCategory || undefined,
        purpose: currentPurpose,
      });
    },
    [handleUrlChange, currentCategory, currentPurpose],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      handleUrlChange({
        page,
        category: currentCategory || undefined,
        purpose: currentPurpose,
      });
    },
    [handleUrlChange, currentCategory, currentPurpose],
  );

  const handleMarkerClick = useCallback(
    (markerId: string) => {
      setModal({
        type: 'RESTAURANT_DETAIL',
        props: { restaurantId: markerId },
      });
    },
    [setModal],
  );

  const { data: placesData, isLoading: isLoadingPlaces } = useQuery({
    queryKey: [
      'places',
      districtInfo?.name,
      currentSort,
      currentCategory,
      currentPage,
      targetUserId,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        districtName: districtInfo?.name || '전체',
        sort: currentSort,
        page: currentPage.toString(),
      });
      if (currentCategory) {
        params.set('category', currentCategory);
      }
      if (targetUserId) {
        params.set('targetUserId', targetUserId);
      }

      const response = await fetch(
        `/api/districts/places?${params.toString()}`,
      );
      if (!response.ok) {
        throw new Error('Failed to fetch places on client');
      }
      return response.json();
    },
    initialData: {
      places: initialPlaces,
      totalPages: initialTotalPages,
      currentPage: currentPage,
    },
    placeholderData: keepPreviousData,
    enabled: routeView === 'districts',
  });

  const { data: routesData, isLoading: isLoadingRoutes } = useQuery({
    queryKey: [
      'districtRoutes',
      districtId,
      currentSort,
      currentPage,
      targetUserId,
      currentPurpose,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        sort: currentSort,
      });

      if (districtId && districtId !== 'all') {
        params.set('districtId', districtId);
      }
      if (currentPurpose) {
        params.set('purpose', currentPurpose);
      }
      if (targetUserId) {
        params.set('targetUserId', targetUserId);
      }

      const response = await fetch(`/api/routes/locations?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch routes on client');
      }
      return response.json();
    },
    initialData: {
      routes: initialRoutes,
      totalCount: initialRoutes.length,
      totalPages: initialTotalRoutePages,
      currentPage: currentPage,
    },
    placeholderData: keepPreviousData,
    enabled: routeView === 'routes' && !!currentPurpose,
  });

  const mapMarkers = useMemo(() => {
    const filteredLocations = currentCategory
      ? allPlaceLocations.filter((p) => p.category === currentCategory)
      : allPlaceLocations;

    return filteredLocations.map((p) => ({
      id: p.id,
      title: p.name,
      latitude: p.latitude,
      longitude: p.longitude,
      category: p.category,
    }));
  }, [allPlaceLocations, currentCategory, isApiLoaded]);

  const mapPolylines = useMemo(() => {
    return [];
  }, []);

  const creatorName =
    contentCreator.type === 'user' ? `${contentCreator.userName}님의` : '추천';

  return (
    <div className="flex flex-col desktop:flex-row h-full desktop:gap-4 desktop:items-center">
      <div className="w-full mobile:w-[375px] tablet:w-[744px] desktop:w-1/2 mx-auto h-[440px] aspect-video desktop:h-full relative">
        {routeView === 'districts' ? (
          <KakaoMap
            latitude={center.lat}
            longitude={center.lng}
            markers={mapMarkers}
            polylines={mapPolylines}
            onMarkerClick={handleMarkerClick}
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <FeaturedRouteCarousel
            districtId={districtId}
            creatorId={targetUserId}
            purpose={currentPurpose}
          />
        )}
      </div>

      <div className="flex-grow desktop:w-1/2 p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {routeView === 'districts'
              ? `${districtInfo?.name || districtId} ${creatorName} 맛집 정보`
              : `${districtInfo?.name || districtId} ${creatorName} 루트 정보`}
          </h2>
        </div>

        <div className="sticky top-0 z-10 bg-white py-2 -mt-2 mb-4 flex justify-center">
          <RouteToggle
            routeView={routeView}
            onToggleClick={(view) => {
              if (view === 'districts') {
                setRouteView('districts');
                handleUrlChange({
                  sort: currentSort,
                  page: currentPage,
                  category: currentCategory,
                  purpose: undefined,
                });
              } else {
                if (sessionStatus !== 'authenticated' || !session?.user?.id) {
                  setModal({
                    type: 'LOGIN_PROMPT',
                    props: {
                      title: '로그인이 필요합니다',
                      message: '로그인하고 루트를 확인해보세요!',
                      onConfirm: () =>
                        router.push(`/login?callbackUrl=${pathname}`),
                      onCancel: () => {},
                    },
                  });
                  return;
                }
                setIsPurposeOverlayOpen(true);
              }
            }}
          />
        </div>

        {routeView === 'districts' ? (
          <div>
            <div className="border-b border-gray-200 mb-4">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {TABS.map((tab) => (
                  <button
                    key={tab.label}
                    onClick={() => handleCategoryChange(tab.value)}
                    className={cn(
                      'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium',
                      currentCategory === tab.value
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <SortDropdown
              currentSort={currentSort}
              onSortChange={handleSortChange}
              maxVisibleItems={5}
            />
            {isLoadingPlaces ? (
              <RestaurantListSkeletonGrid />
            ) : (
              <PlaceList
                places={placesData?.places || []}
                districtName={districtInfo?.name || '전체'}
                categoryName={
                  TABS.find((tab) => tab.value === currentCategory)?.label ||
                  '전체'
                }
                totalPages={placesData?.totalPages || 1}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center">
              <PurposeDropdown
                currentPurpose={currentPurpose}
                onPurposeChange={(purpose) => {
                  handleUrlChange({
                    sort: currentSort,
                    page: 1,
                    category: currentCategory,
                    purpose: purpose,
                  });
                }}
                maxVisibleItems={5}
              />
              <SortDropdown
                currentSort={currentSort}
                onSortChange={handleSortChange}
                maxVisibleItems={5}
              />
            </div>
            {isLoadingRoutes ? (
              <RouteListSkeletonGrid />
            ) : (
              <RouteList
                routes={routesData?.routes || []}
                districtName={districtInfo?.name || '전체'}
                totalPages={routesData?.totalPages || 1}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        )}
      </div>
      <PurposeSelectionOverlay
        isOpen={isPurposeOverlayOpen}
        onClose={() => {
          setIsPurposeOverlayOpen(false);
          if (!currentPurpose) {
            setRouteView('districts');
            handleUrlChange({
              sort: currentSort,
              page: currentPage,
              category: currentCategory,
              purpose: undefined,
            });
          }
        }}
        onSelectPurpose={(purpose) => {
          setIsPurposeOverlayOpen(false);
          setRouteView('routes');
          handleUrlChange({
            sort: currentSort,
            page: 1,
            category: currentCategory,
            purpose: purpose,
          });
        }}
      />
    </div>
  );
}
