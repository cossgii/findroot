'use client';

import React from 'react';
import Modal from '~/src/components/districts/modal';
import { useAddRouteForm } from './useAddRouteForm';
import AddRouteForm from './AddRouteForm';

interface AddRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRouteAdded: () => void;
}

export default function AddRouteModal({ isOpen, onClose, onRouteAdded }: AddRouteModalProps) {
  const { form, onSubmit, userPlaces } = useAddRouteForm({ onClose, onRouteAdded });

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">새 루트 등록</h2>
        <AddRouteForm form={form} onSubmit={onSubmit} onClose={onClose} userPlaces={userPlaces} />
      </div>
    </Modal>
  );
}
