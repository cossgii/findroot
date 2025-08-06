import { SEOUL_DISTRICTS } from '~/src/utils/districts';
import { getPlacesByDistrict } from '~/src/services/place/placeService';
import DistrictClient from '~/src/components/districts/districtClient';

interface DistrictPageProps {
  params: { districtName: string };
}

export default async function DistrictPage({ params }: DistrictPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const districtId = resolvedParams.districtName;
  const districtInfo = SEOUL_DISTRICTS.find((d) => d.id === districtId);

  const districtNameForQuery = districtInfo?.name || districtId; // 한글 이름 또는 ID 사용
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
