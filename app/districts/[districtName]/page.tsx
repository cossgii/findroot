import { getPlacesByDistrict } from '~/src/services/place/placeService';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '~/src/services/auth/authOptions';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';
import DistrictClient from '~/src/components/districts/DistrictClient';
import { PlaceCategory } from '~/src/types/shared';

interface DistrictPageProps {
  params: Promise<{ districtName: string }>;
  searchParams: Promise<{
    sort?: 'recent' | 'likes';
    page?: string;
    category?: PlaceCategory;
  }>;
}

export default async function DistrictPage({ params, searchParams }: DistrictPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const districtId = resolvedParams.districtName;
  const districtInfo = SEOUL_DISTRICTS.find((d) => d.id === districtId);
  const center = districtInfo
    ? { lat: districtInfo.lat, lng: districtInfo.lng }
    : { lat: 37.5665, lng: 126.978 };

  const sort = resolvedSearchParams.sort || 'recent';
  const page = parseInt(resolvedSearchParams.page || '1', 10);
  const category = resolvedSearchParams.category;

  // placeService 함수를 직접 호출하여 초기 데이터를 DB에서 가져옵니다.
  const initialPlacesResult = await getPlacesByDistrict(
    districtInfo?.name || '전체',
    userId,
    page,
    12, // 페이지 당 아이템 수
    sort,
    category
  );

  return (
    <DistrictClient
      districtId={districtId}
      districtInfo={districtInfo}
      center={center}
      currentSort={sort}
      currentCategory={category}
      currentPage={page}
      // 조회된 결과를 Client 컴포넌트에 props로 전달합니다.
      initialPlaces={initialPlacesResult.places}
      initialTotalPages={initialPlacesResult.totalPages}
    />
  );
}

export async function generateStaticParams() {
  return SEOUL_DISTRICTS.map((district) => ({
    districtName: district.id,
  }));
}
