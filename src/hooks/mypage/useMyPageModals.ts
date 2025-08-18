'use client';

import { useCallback } from 'react';
import { useSetAtom } from 'jotai';
import { modalAtom } from '~/src/stores/app-store';

export function useMyPageModals(onSuccess: () => void) {
  const setModal = useSetAtom(modalAtom);

  const openAddPlaceModal = useCallback(
    () => setModal({ type: 'ADD_PLACE', props: { onPlaceAdded: onSuccess } }),
    [setModal, onSuccess],
  );

  const openAddRouteModal = useCallback(
    () => setModal({ type: 'ADD_ROUTE', props: { onRouteAdded: onSuccess } }),
    [setModal, onSuccess],
  );

  const openEditPlaceModal = useCallback(
    (placeId: string) =>
      setModal({
        type: 'EDIT_PLACE',
        props: { placeId, onPlaceUpdated: onSuccess },
      }),
    [setModal, onSuccess],
  );

  const openEditRouteModal = useCallback(
    (routeId: string) =>
      setModal({
        type: 'EDIT_ROUTE',
        props: { routeId, onRouteUpdated: onSuccess },
      }),
    [setModal, onSuccess],
  );

  return {
    openAddPlaceModal,
    openAddRouteModal,
    openEditPlaceModal,
    openEditRouteModal,
  };
}
