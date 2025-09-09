'use client';

import { useAtom } from 'jotai';
import dynamic from 'next/dynamic';
import { Suspense, useEffect } from 'react';
import { usePathname } from 'next/navigation';
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

import BaseModal from '~/src/components/common/BaseModal';
import RestaurantDetailModalContent from '~/src/components/districts/RestaurantDetailModalContent';
import { useSuspenseQuery } from '@tanstack/react-query';
import RestaurantDetailSkeleton from '~/src/components/districts/RestaurantDetailSkeleton';

const AddPlaceModal = dynamic(
  () => import('~/src/components/mypage/places/AddPlaceModal'),
  {
    ssr: false,
    loading: () => <div className="p-6">로딩 중...</div>,
  },
);
const AddRouteModal = dynamic(
  () => import('~/src/components/mypage/routes/AddRouteModal'),
  {
    ssr: false,
    loading: () => <div className="p-6">로딩 중...</div>,
  },
);
const EditPlaceModal = dynamic(
  () => import('~/src/components/mypage/places/EditPlaceModal'),
  {
    ssr: false,
    loading: () => <div className="p-6">로딩 중...</div>,
  },
);
const EditRouteModal = dynamic(
  () => import('~/src/components/mypage/routes/EditRouteModal'),
  {
    ssr: false,
    loading: () => <div className="p-6">로딩 중...</div>,
  },
);

const RestaurantDetailModal = ({
  restaurantId,
  onClose,
}: RestaurantDetailModalProps & { onClose: () => void }) => {
  const { data: restaurant } = useSuspenseQuery<Restaurant>({
    queryKey: ['place', restaurantId],
    queryFn: async () => {
      const response = await fetch(`/api/places/${restaurantId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
  });

  return (
    <BaseModal isOpen={true} onClose={onClose}>
      <Suspense fallback={<RestaurantDetailSkeleton />}>
        <RestaurantDetailModalContent restaurant={restaurant} />
      </Suspense>
    </BaseModal>
  );
};

// INFO_MESSAGE 타입의 모달을 위한 컴포넌트
const InfoMessageModal = ({
  title,
  message,
  onClose,
}: InfoMessageModalProps & { onClose: () => void }) => {
  return (
    <BaseModal isOpen={true} onClose={onClose}>
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
    </BaseModal>
  );
};

export default function GlobalModalRenderer() {
  const [modal, setModal] = useAtom(modalAtom);
  const pathname = usePathname();

  const closeModal = () => {
    setModal({ type: null, props: {} });
  };

  useEffect(() => {
    if (modal.type) {
      closeModal();
    }
  }, [pathname]);

  if (!modal.type) {
    return null;
  }

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
