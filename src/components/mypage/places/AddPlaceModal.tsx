'use client';

import React from 'react';
import Modal from '~/src/components/districts/modal';
import { useAddPlaceForm } from './useAddPlaceForm';
import AddPlaceForm from './AddPlaceForm';

interface AddPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaceAdded: () => void;
}

export default function AddPlaceModal({ isOpen, onClose, onPlaceAdded }: AddPlaceModalProps) {
  const { form, onSubmit } = useAddPlaceForm({ onClose, onPlaceAdded });

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">새 장소 등록</h2>
        <AddPlaceForm form={form} onSubmit={onSubmit} onClose={onClose} />
      </div>
    </Modal>
  );
}
