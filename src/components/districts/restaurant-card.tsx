'use client';

import { useSetAtom } from 'jotai';
import { modalAtom } from '~/src/stores/app-store';
import LikeButton from '~/src/components/common/LikeButton';
import { Place } from '@prisma/client';

type PlaceWithLikeData = Place & {
  likesCount: number;
  isLiked: boolean;
};

interface RestaurantCardProps {
  place: PlaceWithLikeData;
  onLikeToggle?: (handleLike: (forceLike?: boolean) => Promise<void>) => void;
}

export default function RestaurantCard({ place, onLikeToggle }: RestaurantCardProps) {
  if (!place) {
    console.error("RestaurantCard received an undefined or null place prop.");
    return null;
  }

  const setModal = useSetAtom(modalAtom);

  const handleOpenModal = () => {
    setModal({ type: 'RESTAURANT_DETAIL', props: { restaurantId: place.id } });
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between cursor-pointer transition-all hover:shadow-lg hover:bg-gray-50"
    >
      <div className="flex-grow pr-4" onClick={handleOpenModal}>
        <h3 className="text-lg font-semibold">{place.name}</h3>
        {place.district && <p className="text-gray-400 text-xs mt-1">{place.district}</p>}
      </div>
      <LikeButton
        placeId={place.id}
        initialIsLiked={place.isLiked}
        initialLikesCount={place.likesCount}
        onLikeToggle={onLikeToggle}
      />
    </div>
  );
}
