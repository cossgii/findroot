import { getPlacesByDistrict } from '~/src/services/place/placeService';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '~/src/services/auth/authOptions';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';
import DistrictClient from '~/src/components/districts/DistrictClient';
import { PlaceCategory } from '@prisma/client';

export const dynamic = 'force-dynamic';

interface DistrictPageProps {
  params: { districtName: string };
  searchParams: {
    sort?: 'recent' | 'likes';
    page?: string;
    category?: PlaceCategory;
  };
}

export default async function DistrictPage({
  params,
  searchParams,
}: DistrictPageProps) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const districtId = params.districtName;
  const districtInfo = SEOUL_DISTRICTS.find((d) => d.id === districtId);
  const center = districtInfo
    ? { lat: districtInfo.lat, lng: districtInfo.lng }
    : { lat: 37.5665, lng: 126.978 };

  const sort = searchParams.sort || 'recent';
  const page = parseInt(searchParams.page || '1', 10);
  const category = searchParams.category;
  const initialPlacesResult = await getPlacesByDistrict(
    districtInfo?.name || '전체',
    userId,
    page,
    12, // 페이지 당 아이템 수
    sort,
    category,
    undefined, // No targetUserId for initial server-side fetch
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
    />
  );
}
