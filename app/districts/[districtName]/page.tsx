'use client';

import { useParams } from 'next/navigation';
import KakaoMap from '~/src/components/common/kakao-map';
import { SEOUL_DISTRICTS } from '~/src/utils/districts'; // districts 데이터 임포트

export default function DistrictPage() {
  const params = useParams() as { districtName: string };
  const districtId = params.districtName;
  const districtInfo = SEOUL_DISTRICTS.find((d) => d.id === districtId);

  // 해당 구의 좌표를 찾습니다. 없으면 서울 시청을 기본값으로 합니다.
  const center = districtInfo
    ? { lat: districtInfo.lat, lng: districtInfo.lng }
    : { lat: 37.5665, lng: 126.978 };

  return (
    <div className="flex flex-col h-screen">
      <main className="flex-grow">
        <KakaoMap
          latitude={center.lat}
          longitude={center.lng}
          className="w-full h-full"
          // 향후 이 곳에 DB에서 불러온 맛집 마커들을 전달할 수 있습니다.
          // markers={sampleMarkers}
        />
      </main>
    </div>
  );
}
