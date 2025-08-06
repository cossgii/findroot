'use client';

import { useSetAtom } from 'jotai';
import { activeRestaurantModalIdAtom } from '~/src/stores/app-store';

interface RestaurantCardProps {
  id: number;
  name: string;
  description?: string;
  address?: string; // address prop 유지
  district?: string;
}

export default function RestaurantCard({
  id,
  name,
  description,
  address, // prop으로 받음
  district,
}: RestaurantCardProps) {
  const setActiveRestaurantModalId = useSetAtom(activeRestaurantModalIdAtom);

  const handleOpenModal = () => {
    setActiveRestaurantModalId(id);
  };

  // address는 렌더링하지 않음

  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
      <div className="flex-grow">
        <h3 className="text-lg font-semibold">{name}</h3>
        {description && <p className="text-gray-600 text-sm mt-1">{description}</p>}
        {district && <p className="text-gray-400 text-xs mt-1">{district}</p>}
      </div>
      <button
        onClick={handleOpenModal}
        className="p-2 rounded-full hover:bg-gray-200"
        aria-label="메뉴 더보기"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      </button>
    </div>
  );
}


