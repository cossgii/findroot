'use client';

import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { modalAtom } from '~/src/stores/app-store';
import { Place } from '@prisma/client';

// Import all modal components
import Modal from '~/src/components/districts/modal';
import RestaurantDetailModalContent from '~/src/components/districts/restaurant-detail-modal-content';
import AddPlaceModal from '~/src/components/mypage/AddPlaceModal';
import AddRouteModal from '~/src/components/mypage/AddRouteModal';

/**
 * A helper component to fetch data for the restaurant detail modal.
 * This keeps the data fetching logic isolated to when it's needed.
 */
const RestaurantDetailModal = ({ restaurantId, onClose }: { restaurantId: number; onClose: () => void }) => {
  const [restaurant, setRestaurant] = useState<Place | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!restaurantId) return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/places/${restaurantId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const place: Place = await response.json();
        setRestaurant(place);
      } catch (e) {
        console.error('Error fetching place data:', e);
        setError('맛집 정보를 불러오는 데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [restaurantId]);

  return (
    <Modal isOpen={true} onClose={onClose}>
      {isLoading && <div className="p-6">로딩 중...</div>}
      {error && <div className="p-6">{error}</div>}
      {restaurant && <RestaurantDetailModalContent restaurant={restaurant} />}
    </Modal>
  );
};

export default function GlobalModalRenderer() {
  const [modal, setModal] = useAtom(modalAtom);

  if (!modal.type) {
    return null;
  }

  const closeModal = () => {
    setModal({ type: null, props: {} });
  };

  switch (modal.type) {
    case 'RESTAURANT_DETAIL':
      return <RestaurantDetailModal {...modal.props} onClose={closeModal} />;
    case 'ADD_PLACE':
      // AddPlaceModal expects isOpen and onClose. We manage that here.
      return <AddPlaceModal isOpen={true} {...modal.props} onClose={closeModal} />;
    case 'ADD_ROUTE':
      // AddRouteModal expects isOpen and onClose. We manage that here.
      return <AddRouteModal isOpen={true} {...modal.props} onClose={closeModal} />;
    default:
      return null;
  }
}