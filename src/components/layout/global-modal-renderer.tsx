'use client';

import { useAtom } from 'jotai';
import { activeRestaurantModalIdAtom } from '~/src/stores/app-store';
import Modal from '~/src/components/districts/modal';
import RestaurantDetailModalContent from '~/src/components/districts/restaurant-detail-modal-content';
import { mockRestaurants } from '~/src/data/mock-data';

export default function GlobalModalRenderer() {
  const [activeRestaurantModalId, setActiveRestaurantModalId] = useAtom(
    activeRestaurantModalIdAtom
  );

  const selectedRestaurant = activeRestaurantModalId
    ? mockRestaurants.find((r) => r.id === activeRestaurantModalId)
    : null;

  const handleCloseModal = () => {
    setActiveRestaurantModalId(null);
  };

  if (!selectedRestaurant) {
    return null;
  }

  return (
    <Modal isOpen={!!selectedRestaurant} onClose={handleCloseModal}>
      <RestaurantDetailModalContent restaurant={selectedRestaurant} />
    </Modal>
  );
}
