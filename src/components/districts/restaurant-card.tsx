'use client';

import { useSetAtom } from 'jotai';
import { modalAtom } from '~/src/stores/app-store';
import LikeButton from '~/src/components/common/LikeButton';
import { Place } from '@prisma/client';
// The new shape of the place object, including our custom fields
type PlaceWithLikeData = Place & {
  likesCount: number;
  isLiked: boolean;
};

interface RestaurantCardProps {
  place: PlaceWithLikeData;
}

export default function RestaurantCard({ place }: RestaurantCardProps) {
  // Add a check for undefined or null place
  if (!place) {
    console.error("RestaurantCard received an undefined or null place prop.");
    return null; // Or render a placeholder/error message
  }

  const setModal = useSetAtom(modalAtom);

  const handleOpenModal = () => {
    setModal({ type: 'RESTAURANT_DETAIL', props: { restaurantId: place.id } });
  };

  return (
    <div
      onClick={handleOpenModal}
      className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between cursor-pointer transition-all hover:shadow-lg hover:bg-gray-50"
    >
      <div className="flex-grow pr-4">
        <h3 className="text-lg font-semibold">{place.name}</h3>
        {place.district && <p className="text-gray-400 text-xs mt-1">{place.district}</p>}
      </div>
      <LikeButton
        placeId={place.id}
        initialIsLiked={place.isLiked}
        initialLikesCount={place.likesCount}
      />
    </div>
  );
}