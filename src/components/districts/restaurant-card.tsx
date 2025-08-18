'use client';

import { useSetAtom } from 'jotai';
import { modalAtom } from '~/src/stores/app-store';

interface RestaurantCardProps {
  id: string;
  name: string;
  description?: string;
  district?: string;
}

export default function RestaurantCard({
  id,
  name,
  description,
  district,
}: RestaurantCardProps) {
  const setModal = useSetAtom(modalAtom);

  const handleOpenModal = () => {
    setModal({ type: 'RESTAURANT_DETAIL', props: { restaurantId: id } });
  };

  // address는 렌더링하지 않음

  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
      <div className="flex-grow">
        <h3 className="text-lg font-semibold">{name}</h3>
        
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
