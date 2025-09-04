import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSession } from 'next-auth/react';
import { createPlaceSchema } from '~/src/services/place/place-schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '~/src/stores/toast-store';

type AddPlaceFormValues = z.infer<typeof createPlaceSchema>;

interface UseAddPlaceFormProps {
  onClose: () => void;
  onPlaceAdded: () => void;
}

const createPlaceApi = async (payload: AddPlaceFormValues) => {
  const response = await fetch('/api/places', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create place');
  }
  return response.json();
};

export const useAddPlaceForm = ({
  onClose,
  onPlaceAdded,
}: UseAddPlaceFormProps) => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const addToast = useSetAtom(addToastAtom);
  const form = useForm<AddPlaceFormValues>({
    resolver: zodResolver(createPlaceSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      latitude: 0,
      longitude: 0,
      address: '',
      district: '',
      description: '',
    },
  });

  const { mutate: addPlaceMutation, isPending } = useMutation({
    mutationFn: createPlaceApi,
    onSuccess: () => {
      addToast({ message: '장소가 성공적으로 등록되었습니다.', duration: 3000 });
      form.reset({});
      onPlaceAdded();
      onClose();
      queryClient.invalidateQueries({
        queryKey: ['user', session?.user?.id, 'places', 'created'],
      });
      queryClient.invalidateQueries({ queryKey: ['placeLocations'] });
    },
    onError: (error) => {
      if (error.message.includes('이미 동일한 주소의 장소를 등록하셨습니다.')) {
        addToast({ message: error.message, duration: 5000 });
      } else {
        addToast({
          message: `장소 등록 실패: ${error.message}`,
          duration: 5000,
        });
      }
      console.error('Error adding place:', error);
    },
  });

  const onSubmit = (values: AddPlaceFormValues) => {
    if (!session?.user?.id) {
      addToast({
        message: '로그인 후 장소를 등록할 수 있습니다.',
        duration: 5000,
      });
      return;
    }
    addPlaceMutation(values);
  };

  return { form, onSubmit, isPending };
};
