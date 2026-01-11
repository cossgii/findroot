'use client';

import { Suspense, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useSetAtom, useAtomValue } from 'jotai';
import { modalAtom, contentCreatorAtom } from '~/src/stores/app-store';
import Pagination from '~/src/components/common/Pagination';
import { RouteWithPlaces } from '~/src/components/districts/RestaurantRouteContainer';
import { usePaginatedQuery } from '~/src/hooks/usePaginatedQuery';
import RouteContainerSkeleton from './RouteContainerSkeleton';
import RestaurantRouteContainer from '~/src/components/districts/RestaurantRouteContainer';
import DistrictViewToggle from './DistrictViewToggle';
import { RoutePurpose } from '@prisma/client';
import Dropdown from '~/src/components/common/Dropdown';

interface DistrictRoutesClientProps {
  districtId: string;
  districtInfo: { name: string; lat: number; lng: number } | undefined;
}

const purposeOptions: { id: RoutePurpose; name: string }[] = [
  { id: 'ENTIRE', name: '전체' },
  { id: 'FAMILY', name: '가족' },
  { id: 'GATHERING', name: '모임' },
  { id: 'SOLO', name: '나홀로' },
  { id: 'COUPLE', name: '커플' },
];

const RouteListDisplay = ({
  districtId,
  purpose,
  targetUserId,
}: {
  districtId: string;
  purpose?: RoutePurpose;
  targetUserId?: string;
}) => {
  const { data: session } = useSession();
  const userId = session?.user?.id || '';

  const { data, page, setPage } = usePaginatedQuery<RouteWithPlaces>({
    queryKey: ['allRoutes', districtId, purpose || 'all', targetUserId || ''],
    apiEndpoint: `/api/routes/locations`,
    queryParams: { districtId, limit: 5, purpose, targetUserId },
    suspense: true,
    enabled: !!userId,
  });

  return (
    <>
      <RestaurantRouteContainer routes={data?.data || []} isLoading={false} />
      <Pagination
        currentPage={page}
        totalPages={data?.totalPages || 1}
        onPageChange={setPage}
      />
    </>
  );
};

export default function DistrictRoutesClient({
  districtId,
  districtInfo,
}: DistrictRoutesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const setModal = useSetAtom(modalAtom);
  const contentCreator = useAtomValue(contentCreatorAtom);

  const targetUserId =
    contentCreator.type === 'user' ? contentCreator.userId : undefined;
  const creatorName =
    contentCreator.type === 'user' ? `${contentCreator.userName}님의` : '추천';

  const purpose =
    (searchParams.get('purpose') as RoutePurpose) || RoutePurpose.ENTIRE;

  useEffect(() => {
    if (status === 'unauthenticated') {
      const currentPath = `${pathname}?${searchParams.toString()}`;
      setModal({
        type: 'LOGIN_PROMPT',
        props: {
          title: '로그인이 필요합니다',
          message:
            '로그인하고 다른 사용자들이 만든 다양한 루트를 확인해보세요!',
          onConfirm: () =>
            router.push(
              `/login?callbackUrl=${encodeURIComponent(currentPath)}`,
            ),
          onCancel: () => router.push(`/districts/${districtId}`),
        },
      });
    }
  }, [status, setModal, router, districtId, pathname, searchParams]);

  const handlePurposeChange = (newPurpose: RoutePurpose) => {
    const params = new URLSearchParams(searchParams);
    if (newPurpose === 'ENTIRE') {
      params.delete('purpose');
    } else {
      params.set('purpose', newPurpose);
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="w-full p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {`${districtInfo?.name || districtId} ${creatorName} 맛집 루트`}
        </h2>
        <DistrictViewToggle districtId={districtId} />
      </div>
      <div className="flex justify-end mb-4">
        <Dropdown
          options={purposeOptions}
          value={purposeOptions.find((p) => p.id === purpose)}
          onChange={(option) => handlePurposeChange(option.id)}
          getOptionLabel={(option) => option.name}
          triggerClassName="w-32"
        />
      </div>
      {session ? (
        <Suspense fallback={<RouteContainerSkeleton />}>
          <RouteListDisplay
            districtId={districtId}
            purpose={purpose}
            targetUserId={targetUserId}
          />
        </Suspense>
      ) : (
        <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg py-20">
          <p className="text-gray-500">루트 정보는 로그인 후 볼 수 있습니다.</p>
        </div>
      )}
    </div>
  );
}
