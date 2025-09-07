'use client';

import { useSetAtom } from 'jotai';
import { modalAtom } from '~/src/stores/app-store';
import LikeButton from '~/src/components/common/LikeButton';
import { Restaurant } from '~/src/types/restaurant';
import { RouteStopLabel } from '~/src/types/shared';
import { cn } from '~/src/utils/class-name';

interface RestaurantCardProps {
  place: Restaurant;
  label?: RouteStopLabel;
  onLikeToggle?: (handleLike: (forceLike?: boolean) => Promise<void>) => void;
}

const labelDisplayMap: Record<RouteStopLabel, { text: string; className: string }> = {
  MEAL: { text: '식사', className: 'bg-blue-100 text-blue-800' },
  CAFE: { text: '카페', className: 'bg-green-100 text-green-800' },
  BAR: { text: '주점', className: 'bg-red-100 text-red-800' },
};

export default function RestaurantCard({ place, label, onLikeToggle }: RestaurantCardProps) {
  if (!place) {
    console.error("RestaurantCard received an undefined or null place prop.");
    return null;
  }

  const setModal = useSetAtom(modalAtom);

  const handleOpenModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setModal({ type: 'RESTAURANT_DETAIL', props: { restaurantId: place.id } });
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between cursor-pointer transition-all hover:shadow-lg hover:bg-gray-50"
    >
      <div className="flex-grow pr-4" onClick={handleOpenModal}>
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">{place.name}</h3>
          {label && (
            <span
              className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-full',
                labelDisplayMap[label].className
              )}
            >
              {labelDisplayMap[label].text}
            </span>
          )}
        </div>
        {!label && place.district && (
          <p className="text-gray-400 text-xs mt-1">{place.district}</p>
        )}
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
