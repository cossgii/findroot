import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';
import { getPlacesByDistrict } from '~/src/services/place/placeService';
import DistrictClient from '~/src/components/districts/districtClient';

interface DistrictPageProps {
  params: Promise<{ districtName: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DistrictPage({ params, searchParams }: DistrictPageProps) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const districtId = resolvedParams.districtName;
  const districtInfo = SEOUL_DISTRICTS.find((d) => d.id === districtId);

  const page = typeof resolvedSearchParams.page === 'string' ? Number(resolvedSearchParams.page) : 1;
  const sort =
    typeof resolvedSearchParams.sort === 'string' &&
    ['recent', 'likes'].includes(resolvedSearchParams.sort)
      ? (resolvedSearchParams.sort as 'recent' | 'likes')
      : 'recent';

  const districtNameForQuery = districtInfo?.name || districtId;

  const { places, totalPages, currentPage } = await getPlacesByDistrict(
    districtNameForQuery,
    userId,
    page,
    12, // limit
    sort,
  );

  const center = districtInfo
    ? { lat: districtInfo.lat, lng: districtInfo.lng }
    : { lat: 37.5665, lng: 126.978 };

  return (
    <DistrictClient
      districtId={districtId}
      districtInfo={districtInfo}
      center={center}
      initialPlaces={places}
      totalPages={totalPages}
      currentPage={currentPage}
      currentSort={sort}
    />
  );
}
