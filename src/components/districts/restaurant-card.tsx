'use client';

import { useSetAtom } from 'jotai';
import { modalAtom } from '~/src/stores/app-store';
import LikeButton from '~/src/components/common/LikeButton';

interface RestaurantCardProps {
  id: string;
  name: string;
  district?: string | null;
  address?: string | null;
  description?: string | null;
}

export default function RestaurantCard({
  id,
  name,
  district,
}: RestaurantCardProps) {
  const setModal = useSetAtom(modalAtom);

  const handleOpenModal = () => {
    setModal({ type: 'RESTAURANT_DETAIL', props: { restaurantId: id } });
  };

  return (
    <div
      onClick={handleOpenModal}
      className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between cursor-pointer transition-all hover:shadow-lg hover:bg-gray-50"
    >
      <div className="flex-grow pr-4">
        <h3 className="text-lg font-semibold">{name}</h3>
        {district && <p className="text-gray-400 text-xs mt-1">{district}</p>}
      </div>
      <LikeButton placeId={id} />
    </div>
  );
}
