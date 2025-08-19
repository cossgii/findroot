import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSession } from 'next-auth/react';
import { createPlaceSchema } from '~/src/services/place/place-schema';

type AddPlaceFormValues = z.infer<typeof createPlaceSchema>;

interface UseAddPlaceFormProps {
  onClose: () => void;
  onPlaceAdded: () => void;
}

export const useAddPlaceForm = ({
  onClose,
  onPlaceAdded,
}: UseAddPlaceFormProps) => {
  const { data: session } = useSession();
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

  const onSubmit = async (values: AddPlaceFormValues) => {
    if (!session?.user?.id) {
      alert('로그인 후 장소를 등록할 수 있습니다.');
      return;
    }

    try {
      const response = await fetch('/api/places', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        alert('장소가 성공적으로 등록되었습니다.');
        form.reset({}); // Reset form without triggering immediate validation
        onPlaceAdded();
        onClose();
      } else {
        const errorData = await response.json();
        alert(`장소 등록 실패: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error adding place:', error);
      alert('장소 등록 중 오류가 발생했습니다.');
    }
  };

  return { form, onSubmit };
};
