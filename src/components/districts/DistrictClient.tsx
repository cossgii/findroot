'use client';

import { useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import KakaoMap from '~/src/components/common/KakaoMap';
import { useSetAtom, useAtomValue } from 'jotai';
import {
  modalAtom,
  isKakaoMapApiLoadedAtom,
  contentCreatorAtom,
} from '~/src/stores/app-store';
import SortDropdown from '~/src/components/common/SortDropdown';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { PlaceCategory } from '@prisma/client';
import { cn } from '~/src/utils/class-name';
import PlaceList from './PlaceList';
import RestaurantListSkeletonGrid from './RestaurantListSkeletonGrid';
import { Place } from '@prisma/client';
import DistrictViewToggle from './DistrictViewToggle';
import { useSession } from 'next-auth/react';

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
}: DistrictClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const setModal = useSetAtom(modalAtom);
  const isApiLoaded = useAtomValue(isKakaoMapApiLoadedAtom);
  const { data: session } = useSession();
  const contentCreator = useAtomValue(contentCreatorAtom);

  const targetUserId =
    contentCreator.type === 'user'
      ? contentCreator.userId
      : contentCreator.type === 'me' && session?.user?.id
        ? session.user.id
        : undefined;

  const { data: allPlaceLocations = [] } = useQuery<PlaceLocation[], Error>({
    queryKey: ['placeLocations', districtInfo?.name, targetUserId],
    queryFn: () => fetchAllPlaceLocations(districtInfo?.name, targetUserId),
    enabled: !!districtInfo?.name,
  });

  const handleUrlChange = (newParams: Record<string, string | number>) => {
    const params = new URLSearchParams();
    params.set('sort', newParams.sort?.toString() || currentSort);
    params.set('page', newParams.page?.toString() || '1');
    if (newParams.category) {
      params.set('category', newParams.category.toString());
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleCategoryChange = (category?: PlaceCategory) => {
    handleUrlChange({ category: category || '', page: 1 });
  };

  const handleSortChange = (sortOption: string) => {
    handleUrlChange({
      sort: sortOption,
      page: 1,
      category: currentCategory || '',
    });
  };

  const handlePageChange = (page: number) => {
    handleUrlChange({ page, category: currentCategory || '' });
  };

  const handleMarkerClick = useCallback(
    (markerId: string) => {
      setModal({
        type: 'RESTAURANT_DETAIL',
        props: { restaurantId: markerId },
      });
    },
    [setModal],
  );

  const { data, isLoading } = useQuery({
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
    contentCreator.type === 'user'
      ? `${contentCreator.userName}님의`
      : '추천';

  return (
    <div className="flex flex-col desktop:flex-row h-full desktop:gap-4 desktop:items-center">
      <div className="w-full mobile:w-[375px] tablet:w-[744px] desktop:w-1/2 mx-auto h-[440px] aspect-video desktop:h-full relative">
        <KakaoMap
          latitude={center.lat}
          longitude={center.lng}
          markers={mapMarkers}
          polylines={mapPolylines}
          onMarkerClick={handleMarkerClick}
          className="absolute inset-0 w-full h-full"
        />
      </div>
      <div className="flex-grow desktop:w-1/2 p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {`${districtInfo?.name || districtId} ${creatorName} 맛집 정보`}
          </h2>
          <DistrictViewToggle districtId={districtId} />
        </div>
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
          />
          {isLoading ? (
            <RestaurantListSkeletonGrid />
          ) : (
            <PlaceList
              places={data?.places || []}
              districtName={districtInfo?.name || '전체'}
              categoryName={
                TABS.find((tab) => tab.value === currentCategory)?.label ||
                '전체'
              }
              totalPages={data?.totalPages || 1}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}

