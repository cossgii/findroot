'use client';

import React from 'react';
import Modal from '~/src/components/districts/modal';
import { useEditRouteForm } from '~/src/hooks/mypage/useEditRouteForm';
import EditRouteForm from './EditRouteForm';

interface EditRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  routeId: string;
  onRouteUpdated: () => void;
}

export default function EditRouteModal({
  isOpen,
  onClose,
  routeId,
  onRouteUpdated,
}: EditRouteModalProps) {
  const {
    form,
    onSubmit,
    stops,
    userPlaces,
    isLoading,
    error,
    addStop,
    removeStop,
    selectedDistrict,
    mapCenter,
    handleDistrictChange,
  } = useEditRouteForm({
    routeId,
    onClose,
    onRouteUpdated,
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} contentClassName="max-w-2xl">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">루트 정보 수정</h2>
        <EditRouteForm
          form={form}
          onSubmit={onSubmit}
          onClose={onClose}
          stops={stops}
          userPlaces={userPlaces}
          isLoading={isLoading}
          error={error}
          addStop={addStop}
          removeStop={removeStop}
          selectedDistrict={selectedDistrict}
          mapCenter={mapCenter}
          handleDistrictChange={handleDistrictChange}
        />
      </div>
    </Modal>
  );
}
