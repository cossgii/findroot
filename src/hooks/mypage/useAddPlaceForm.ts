import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSession } from 'next-auth/react';
import { createPlaceSchema } from '~/src/services/place/place-schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type AddPlaceFormValues = z.infer<typeof createPlaceSchema>;

interface UseAddPlaceFormProps {
  onClose: () => void;
  onPlaceAdded: () => void;
}

// Mutation Function
const createPlaceApi = async (payload: AddPlaceFormValues) => {
  const response = await fetch('/api/places', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create place');
  }
  return response.json();
};

export const useAddPlaceForm = ({
  onClose,
  onPlaceAdded,
}: UseAddPlaceFormProps) => {
  const { data: session } = useSession();
  const queryClient = useQueryClient(); // Initialize useQueryClient
  const form = useForm<AddPlaceFormValues>({
    resolver: zodResolver(createPlaceSchema),
    mode: 'onTouched', // Validate on blur/change after first touch
    defaultValues: {
      name: '',
      latitude: 0,
      longitude: 0,
      address: '',
      district: '',
      description: '',
      // category is intentionally left out to be undefined initially
    },
  });

  const { mutate: addPlaceMutation } = useMutation({
    mutationFn: createPlaceApi,
    onSuccess: () => {
      alert('장소가 성공적으로 등록되었습니다.');
      form.reset({}); // Reset form
      onPlaceAdded(); // Callback for parent component
      onClose(); // Close modal
      // Invalidate queries to refetch lists that might include this new place
      queryClient.invalidateQueries({ queryKey: ['user', session?.user?.id, 'places', 'created'] });
      queryClient.invalidateQueries({ queryKey: ['placeLocations'] }); // Invalidate all place locations for map
    },
    onError: (error) => {
      alert(`장소 등록 실패: ${error.message}`);
      console.error('Error adding place:', error);
    },
  });

  const onSubmit = async (values: AddPlaceFormValues) => {
    if (!session?.user?.id) {
      alert('로그인 후 장소를 등록할 수 있습니다.');
      return;
    }
    addPlaceMutation(values);
  };

  return { form, onSubmit };
};
