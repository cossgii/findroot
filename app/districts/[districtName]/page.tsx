'use client';

import { useParams } from 'next/navigation';
import KakaoMap from '~/src/components/common/kakao-map';
import RestaurantCategorySection from '~/src/components/districts/restaurant-category-section';
import Modal from '~/src/components/districts/modal'; // Modal import 경로 변경
import RestaurantDetailModalContent from '~/src/components/districts/restaurant-detail-modal-content'; // Modal Content import 경로 변경
import { CATEGORIES, mockRestaurants } from '~/src/data/mock-data';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';
import { useAtom } from 'jotai'; // useAtom import
import { activeRestaurantModalIdAtom } from '~/src/stores/app-store'; // 아톰 import

export default function DistrictPage() {
  const params = useParams() as { districtName: string };
  const districtId = params.districtName;
  const districtInfo = SEOUL_DISTRICTS.find((d) => d.id === districtId);

  const center = districtInfo
    ? { lat: districtInfo.lat, lng: districtInfo.lng }
    : { lat: 37.5665, lng: 126.978 };

  const restaurantsToShow =
    districtId === 'all'
      ? mockRestaurants
      : mockRestaurants.filter((r) => r.district === districtId);

  const [activeRestaurantModalId, setActiveRestaurantModalId] = useAtom(
    activeRestaurantModalIdAtom
  ); // 아톰 값과 setter 가져오기

  const selectedRestaurant = activeRestaurantModalId
    ? mockRestaurants.find((r) => r.id === activeRestaurantModalId)
    : null;

  const handleCloseModal = () => {
    setActiveRestaurantModalId(null); // 모달 닫기
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="w-full h-1/2">
        <KakaoMap
          latitude={center.lat}
          longitude={center.lng}
          className="w-full h-full"
        />
      </div>
      <div className="flex-grow p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">맛집 루트 추천 ({districtInfo?.name || districtId})</h2>
        <div className="space-y-8">
          {CATEGORIES.map((category) => (
            <RestaurantCategorySection
              key={category.id}
              category={category}
              restaurants={restaurantsToShow.filter(
                (r) => r.category === category.id
              )}
            />
          ))}
        </div>
      </div>

      {/* 모달 렌더링 */}
      {selectedRestaurant && (
        <Modal isOpen={!!selectedRestaurant} onClose={handleCloseModal}>
          <RestaurantDetailModalContent restaurant={selectedRestaurant} />
        </Modal>
      )}
    </div>
  );
}
