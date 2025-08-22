'use client';

import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import {
  modalAtom,
  InfoMessageModalProps,
  AddPlaceModalProps,
  AddRouteModalProps,
  RestaurantDetailModalProps,
  EditPlaceModalProps,
  EditRouteModalProps,
} from '~/src/stores/app-store';
import { Restaurant } from '~/src/types/restaurant';

// Import all modal components
import Modal from '~/src/components/districts/modal';
import RestaurantDetailModalContent from '~/src/components/districts/restaurant-detail-modal-content';
import AddPlaceModal from '~/src/components/mypage/places/AddPlaceModal';
import AddRouteModal from '~/src/components/mypage/routes/AddRouteModal';
import EditPlaceModal from '~/src/components/mypage/places/EditPlaceModal';
import EditRouteModal from '~/src/components/mypage/routes/EditRouteModal';

/**
 * A helper component to fetch data for the restaurant detail modal.
 * This keeps the data fetching logic isolated to when it's needed.
 */
const RestaurantDetailModal = ({
  restaurantId,
  onClose,
}: RestaurantDetailModalProps & { onClose: () => void }) => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
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
        const restaurantData: Restaurant = await response.json();
        setRestaurant(restaurantData);
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

// INFO_MESSAGE 타입의 모달을 위한 컴포넌트
const InfoMessageModal = ({
  title,
  message,
  onClose,
}: InfoMessageModalProps & { onClose: () => void }) => {
  return (
    <Modal isOpen={true} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p>{message}</p>
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            확인
          </button>
        </div>
      </div>
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
      return (
        <RestaurantDetailModal
          {...(modal.props as RestaurantDetailModalProps)}
          onClose={closeModal}
        />
      );
    case 'ADD_PLACE':
      return (
        <AddPlaceModal
          isOpen={true}
          {...(modal.props as AddPlaceModalProps)}
          onClose={closeModal}
        />
      );
    case 'ADD_ROUTE':
      return (
        <AddRouteModal
          isOpen={true}
          {...(modal.props as AddRouteModalProps)}
          onClose={closeModal}
        />
      );
    case 'INFO_MESSAGE':
      return (
        <InfoMessageModal
          {...(modal.props as InfoMessageModalProps)}
          onClose={closeModal}
        />
      );
    case 'EDIT_PLACE':
      return (
        <EditPlaceModal
          isOpen={true}
          {...(modal.props as EditPlaceModalProps)}
          onClose={closeModal}
        />
      );
    case 'EDIT_ROUTE':
      return (
        <EditRouteModal
          isOpen={true}
          {...(modal.props as EditRouteModalProps)}
          onClose={closeModal}
        />
      );
    default:
      return null;
  }
}
