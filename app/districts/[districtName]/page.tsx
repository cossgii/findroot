import { getPlacesByDistrict } from '~/src/services/place/placeService';
import { getRoutes } from '~/src/services/route/routeService';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '~/src/services/auth/authOptions';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';
import DistrictClient from '~/src/components/districts/DistrictClient';
import { PlaceCategory, RoutePurpose } from '@prisma/client';

export const dynamic = 'force-dynamic';

interface DistrictPageProps {
  params: Promise<{ districtName: string }>;
  searchParams: Promise<{
    sort?: 'recent' | 'likes';
    page?: string;
    category?: PlaceCategory;
    purpose?: RoutePurpose;
    targetUserId?: string;
  }>;
}
export default async function DistrictPage({
  params,
  searchParams,
}: DistrictPageProps) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const { districtName } = resolvedParams;
  const {
    sort = 'recent',
    page: pageParam = '1',
    category,
    purpose,
    targetUserId,
  } = resolvedSearchParams;
  const districtId = districtName;
  const districtInfo = SEOUL_DISTRICTS.find((d) => d.id === districtId);
  const center = districtInfo
    ? { lat: districtInfo.lat, lng: districtInfo.lng }
    : { lat: 37.5665, lng: 126.978 };
  const page = parseInt(pageParam, 10);
  const initialPlacesResult = await getPlacesByDistrict(
    districtInfo?.name || '전체',
    userId,
    page,
    10,
    sort,
    category,
    undefined,
  );

  const isAllDistricts = districtId === 'all';

  const initialRoutesResult = await getRoutes(
    districtId,
    userId,
    page,
    10,
    purpose,
    targetUserId,
    isAllDistricts ? true : undefined,
    isAllDistricts ? true : sort === 'likes',
  );

  return (
    <DistrictClient
      districtId={districtId}
      districtInfo={districtInfo}
      center={center}
      currentSort={sort}
      currentCategory={category}
      currentPage={page}
      initialPlaces={initialPlacesResult.places}
      initialTotalPages={initialPlacesResult.totalPages}
      initialRoutes={initialRoutesResult.routes}
      initialTotalRoutePages={initialRoutesResult.totalPages}
    />
  );
}
