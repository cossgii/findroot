'use client';

import Image from 'next/image';
import { useSetAtom } from 'jotai'; // useSetAtom import
import { activeRestaurantModalIdAtom } from '~/src/stores/app-store'; // 아톰 import

interface RestaurantCardProps {
  id: number; // id prop 추가
  name: string;
  description?: string;
  imageUrl?: string;
  address?: string;
  district?: string;
}

export default function RestaurantCard({
  id, // id prop 받기
  name,
  description,
  imageUrl,
  address,
  district,
}: RestaurantCardProps) {
  const setActiveRestaurantModalId = useSetAtom(activeRestaurantModalIdAtom); // 아톰 setter 가져오기

  const handleViewDetails = () => {
    setActiveRestaurantModalId(id); // 클릭 시 해당 맛집 ID로 아톰 업데이트
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
      {imageUrl && (
        <div className="relative w-full h-48">
          <Image
            src={imageUrl}
            alt={name}
            layout="fill"
            objectFit="cover"
            className="w-full h-full"
          />
        </div>
      )}
      <div className="p-4 flex-grow">
        <h3 className="text-lg font-semibold mb-2">{name}</h3>
        {description && <p className="text-gray-600 text-sm mb-2">{description}</p>}
        {address && <p className="text-gray-500 text-xs">{address}</p>}
        {district && <p className="text-gray-400 text-xs mt-1">{district}</p>}
      </div>
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleViewDetails} // 클릭 핸들러 연결
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          자세히 보기
        </button>
      </div>
    </div>
  );
}


