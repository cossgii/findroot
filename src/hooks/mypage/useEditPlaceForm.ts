import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSession } from 'next-auth/react';
import { createPlaceSchema } from '~/src/services/place/place-schema';
import { useEffect } from 'react';
import { Place } from '@prisma/client';

type EditPlaceFormValues = z.infer<typeof createPlaceSchema>;

interface UseEditPlaceFormProps {
  placeId: string;
  onClose: () => void;
  onPlaceUpdated: () => void;
}

export const useEditPlaceForm = ({
  placeId,
  onClose,
  onPlaceUpdated,
}: UseEditPlaceFormProps) => {
  const { data: session } = useSession();
  const form = useForm<EditPlaceFormValues>({
    resolver: zodResolver(createPlaceSchema),
    mode: 'onTouched',
  });

  useEffect(() => {
    const fetchPlaceData = async () => {
      try {
        const response = await fetch(`/api/places/${placeId}`);
        if (response.ok) {
          const place: Place = await response.json();
          form.reset({
            name: place.name,
            address: place.address || '',
            latitude: place.latitude,
            longitude: place.longitude,
            district: place.district || '',
            description: place.description || '',
            category: place.category,
          });
        } else {
          console.error('Failed to fetch place data');
          alert('장소 정보를 불러오는 데 실패했습니다.');
          onClose();
        }
      } catch (error) {
        console.error('Error fetching place data:', error);
        alert('장소 정보를 불러오는 중 오류가 발생했습니다.');
        onClose();
      }
    };
    fetchPlaceData();
  }, [placeId, form, onClose]);

  const onSubmit = async (values: EditPlaceFormValues) => {
    if (!session?.user?.id) {
      alert('로그인 후 장소를 수정할 수 있습니다.');
      return;
    }

    try {
      const response = await fetch(`/api/places/${placeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        alert('장소가 성공적으로 수정되었습니다.');
        onPlaceUpdated();
        onClose();
      } else {
        const errorData = await response.json();
        alert(`장소 수정 실패: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating place:', error);
      alert('장소 수정 중 오류가 발생했습니다.');
    }
  };

  return { form, onSubmit };
};
