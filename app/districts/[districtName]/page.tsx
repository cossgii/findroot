import { SEOUL_DISTRICTS } from '~/src/utils/districts';
import DistrictClient from '~/src/components/districts/DistrictClient';
import { PlaceCategory } from '~/src/types/shared';

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
    : { lat: 37.5665, lng: 126.978 }; // 시청 위치

  const sort = resolvedSearchParams.sort || 'recent';
  const page = parseInt(resolvedSearchParams.page || '1', 10);
  const category = resolvedSearchParams.category;

  return (
    <DistrictClient
      districtId={districtId}
      districtInfo={districtInfo}
      center={center}
      currentSort={sort}
      currentCategory={category}
      currentPage={page}
    />
  );
}

export async function generateStaticParams() {
  return SEOUL_DISTRICTS.map((district) => ({
    districtName: district.id,
  }));
}
