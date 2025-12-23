import { SEOUL_DISTRICTS } from '~/src/utils/districts';
import DistrictRoutesClient from '~/src/components/districts/DistrictRoutesClient';

interface DistrictRoutePageProps {
  params: Promise<{ districtName: string }>;
}

export default async function DistrictRoutePage({
  params,
}: DistrictRoutePageProps) {
  const resolvedParams = await params;
  const districtId = resolvedParams.districtName;

  const districtInfo = SEOUL_DISTRICTS.find((d) => d.id === districtId);
  const center = districtInfo
    ? { lat: districtInfo.lat, lng: districtInfo.lng }
    : { lat: 37.5665, lng: 126.978 };

  return (
    <DistrictRoutesClient
      districtId={districtId}
      districtInfo={districtInfo}
      center={center}
    />
  );
}

export async function generateStaticParams() {
  return SEOUL_DISTRICTS.map((district) => ({
    districtName: district.id,
  }));
}
