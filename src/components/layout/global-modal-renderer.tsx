'use client';

import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { activeRestaurantModalIdAtom } from '~/src/stores/app-store';
import Modal from '~/src/components/districts/modal';
import RestaurantDetailModalContent from '~/src/components/districts/restaurant-detail-modal-content';
import { Place } from '@prisma/client';

export default function GlobalModalRenderer() {
  const [activeRestaurantModalId, setActiveRestaurantModalId] = useAtom(
    activeRestaurantModalIdAtom
  );
  const [selectedRestaurant, setSelectedRestaurant] = useState<Place | null>(null);

  useEffect(() => {
    if (!activeRestaurantModalId) {
      setSelectedRestaurant(null);
      return;
    }

    async function fetchData() {
      try {
        const response = await fetch(`/api/places/${activeRestaurantModalId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const place: Place = await response.json();
        setSelectedRestaurant(place);
      } catch (error) {
        console.error('Error fetching place data:', error);
        setSelectedRestaurant(null);
      }
    }

    fetchData();
  }, [activeRestaurantModalId]);

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
