import { SEOUL_DISTRICTS } from '~/src/utils/districts';
import { getPlacesByDistrict } from '~/src/services/place/placeService';
import DistrictClient from '~/src/components/districts/districtClient';

interface DistrictPageProps {
  params: Promise<{ districtName: string }>;
}

export default async function DistrictPage({ params }: DistrictPageProps) {
  const resolvedParams = await params;
  const districtId = resolvedParams.districtName;
  const districtInfo = SEOUL_DISTRICTS.find((d) => d.id === districtId);

  const districtNameForQuery = districtInfo?.name || districtId;
  const places = await getPlacesByDistrict(districtNameForQuery);

  const center = districtInfo
    ? { lat: districtInfo.lat, lng: districtInfo.lng }
    : { lat: 37.5665, lng: 126.978 };

  return (
    <DistrictClient
      districtId={districtId}
      districtInfo={districtInfo}
      center={center}
      places={places}
    />
  );
}
