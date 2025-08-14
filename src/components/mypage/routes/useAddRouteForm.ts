import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Place } from '@prisma/client';
import {
  createRouteSchema,
  CreateRouteInput,
} from '~/src/services/route/route-schema';

interface UseAddRouteFormProps {
  onClose: () => void;
  onRouteAdded: () => void;
}

export const useAddRouteForm = ({
  onClose,
  onRouteAdded,
}: UseAddRouteFormProps) => {
  const form = useForm<CreateRouteInput>({
    resolver: zodResolver(createRouteSchema),
    defaultValues: {
      name: '',
      description: '',
      districtId: '',
      placeForRound1Id: undefined,
      placeForRound2Id: undefined,
      placeForCafeId: undefined,
    },
  });

  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  // State to hold the actual Place objects for display
  const [selectedRound1Place, setSelectedRound1Place] = useState<Place | null>(
    null,
  );
  const [selectedRound2Place, setSelectedRound2Place] = useState<Place | null>(
    null,
  );
  const [selectedCafePlace, setSelectedCafePlace] = useState<Place | null>(null);

  const onSubmit = async (values: CreateRouteInput) => {
    // This will be handled by the API call in AddRouteModal or a parent component
    // For now, just log and close
    console.log('Route form submitted with values:', values);
    onRouteAdded();
    onClose();
  };

  // Function to assign a place to a specific slot
  const assignPlaceToSlot = (
    place: Place,
    slot: 'round1' | 'round2' | 'cafe',
  ) => {
    if (slot === 'round1') {
      form.setValue('placeForRound1Id', place.id);
      setSelectedRound1Place(place);
    } else if (slot === 'round2') {
      form.setValue('placeForRound2Id', place.id);
      setSelectedRound2Place(place);
    } else if (slot === 'cafe') {
      form.setValue('placeForCafeId', place.id);
      setSelectedCafePlace(place);
    }
    // Trigger validation for the assigned slot
    form.trigger(
      `placeFor${slot.charAt(0).toUpperCase() + slot.slice(1)}Id` as keyof CreateRouteInput,
    );
  };

  // Function to clear a slot
  const clearSlot = (slot: 'round1' | 'round2' | 'cafe') => {
    if (slot === 'round1') {
      form.setValue('placeForRound1Id', undefined);
      setSelectedRound1Place(null);
    } else if (slot === 'round2') {
      form.setValue('placeForRound2Id', undefined);
      setSelectedRound2Place(null);
    } else if (slot === 'cafe') {
      form.setValue('placeForCafeId', undefined);
      setSelectedCafePlace(null);
    }
    form.trigger(
      `placeFor${slot.charAt(0).toUpperCase() + slot.slice(1)}Id` as keyof CreateRouteInput,
    );
  };

  return {
    form,
    onSubmit,
    selectedDistrict,
    setSelectedDistrict,
    assignPlaceToSlot,
    clearSlot,
    selectedRound1Place,
    selectedRound2Place,
    selectedCafePlace,
  };
};
