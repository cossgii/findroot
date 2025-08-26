import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import { getPlacesByDistrict } from '~/src/services/place/placeService';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';
import DistrictClient from '~/src/components/districts/districtClient';
import { PlaceCategory } from '@prisma/client';

interface DistrictPageProps {
  params: Promise<{
    districtName: string;
  }>;
  searchParams: Promise<{
    sort?: 'recent' | 'likes';
    page?: string;
    category?: PlaceCategory;
  }>;
}

export default async function DistrictPage({
  params,
  searchParams,
}: DistrictPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const districtId = resolvedParams.districtName;
  const districtInfo = SEOUL_DISTRICTS.find((d) => d.id === districtId);
  const center = districtInfo
    ? { lat: districtInfo.lat, lng: districtInfo.lng }
    : { lat: 37.5665, lng: 126.978 }; // Default to Seoul City Hall

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const sort = resolvedSearchParams.sort || 'recent';
  const page = parseInt(resolvedSearchParams.page || '1', 10);
  const category = resolvedSearchParams.category;

  const {
    places,
    totalPages,
    currentPage,
  } = await getPlacesByDistrict(
    districtInfo?.name || '전체',
    userId,
    page,
    12, // limit
    sort,
    category,
  );

  return (
    <DistrictClient
      districtId={districtId}
      districtInfo={districtInfo}
      center={center}
      initialPlaces={places}
      totalPages={totalPages}
      currentPage={currentPage}
      currentSort={sort}
      currentCategory={category}
    />
  );
}

export async function generateStaticParams() {
  return SEOUL_DISTRICTS.map((district) => ({
    districtName: district.id,
  }));
}
