'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import KakaoMap from '~/src/components/common/kakao-map';
import ToggleSwitch from '~/src/components/common/ToggleSwitch';
import RestaurantListContainer from '~/src/components/districts/RestaurantListContainer';
import RestaurantRouteContainer from '~/src/components/districts/RestaurantRouteContainer';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';

export default function DistrictPage() {
  const [isRouteView, setIsRouteView] = useState(false);
  const params = useParams() as { districtName: string };
  const districtId = params.districtName;
  const districtInfo = SEOUL_DISTRICTS.find((d) => d.id === districtId);

  const center = districtInfo
    ? { lat: districtInfo.lat, lng: districtInfo.lng }
    : { lat: 37.5665, lng: 126.978 };

  return (
    <div className="flex flex-col h-full">
      <div className="w-full h-[440px] relative">
        <KakaoMap
          latitude={center.lat}
          longitude={center.lng}
          className="absolute inset-0 w-full h-full"
        />
      </div>
      <div className="flex-grow p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {`${districtInfo?.name || districtId} ${isRouteView ? '맛집 루트 정보' : '맛집 정보'}`}
          </h2>
          <ToggleSwitch
            isOn={isRouteView}
            onToggle={() => setIsRouteView(!isRouteView)}
            optionLabels={['목록', '루트']}
          />
        </div>
        {isRouteView ? (
          <RestaurantRouteContainer />
        ) : (
          <RestaurantListContainer districtId={districtId} />
        )}
      </div>
    </div>
  );
}
