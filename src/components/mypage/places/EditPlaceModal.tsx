'use client';

import React from 'react';
import Modal from '~/src/components/districts/modal';
import { useEditPlaceForm } from './useEditPlaceForm';
import EditPlaceForm from './EditPlaceForm';

interface EditPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  placeId: string;
  onPlaceUpdated: () => void;
}

export default function EditPlaceModal({
  isOpen,
  onClose,
  placeId,
  onPlaceUpdated,
}: EditPlaceModalProps) {
  const { form, onSubmit } = useEditPlaceForm({
    placeId,
    onClose,
    onPlaceUpdated,
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">장소 정보 수정</h2>
        <EditPlaceForm form={form} onSubmit={onSubmit} onClose={onClose} />
      </div>
    </Modal>
  );
}
