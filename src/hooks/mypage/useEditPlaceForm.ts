import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSession } from 'next-auth/react';
import { createPlaceSchema } from '~/src/schemas/place-schema';
import { ClientPlace as Place } from '~/src/types/shared';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

type EditPlaceFormValues = z.infer<typeof createPlaceSchema>;

interface UseEditPlaceFormProps {
  placeId: string;
  onClose: () => void;
  onPlaceUpdated: () => void;
}

const fetchPlaceById = async (id: string): Promise<Place> => {
  const response = await fetch(`/api/places/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch place data');
  }
  return response.json();
};

const updatePlaceApi = async (payload: {
  placeId: string;
  values: EditPlaceFormValues;
}) => {
  const response = await fetch(`/api/places/${payload.placeId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload.values),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update place');
  }
  return response.json();
};

export const useEditPlaceForm = ({
  placeId,
  onClose,
  onPlaceUpdated,
}: UseEditPlaceFormProps) => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const form = useForm<EditPlaceFormValues>({
    resolver: zodResolver(createPlaceSchema),
    mode: 'onTouched',
  });

  const {
    data: placeData,
    isLoading,
    isError,
    error,
  } = useQuery<Place, Error>({
    queryKey: ['place', placeId],
    queryFn: () => fetchPlaceById(placeId),
    enabled: !!placeId,
  });

  useEffect(() => {
    if (placeData) {
      form.reset({
        name: placeData.name,
        address: placeData.address || '',
        latitude: placeData.latitude,
        longitude: placeData.longitude,
        district: placeData.district || '',
        description: placeData.description || '',
        link: placeData.link || '',
        category: placeData.category,
      });
    }
  }, [placeData, form]);

  useEffect(() => {
    if (isError && error) {
      console.error('Error fetching place data:', error);
      alert(`장소 정보를 불러오는 중 오류가 발생했습니다: ${error.message}`);
      onClose();
    }
  }, [isError, error, onClose]);

  const { mutate: updatePlaceMutation } = useMutation<
    Place,
    Error,
    { placeId: string; values: EditPlaceFormValues }
  >({
    mutationFn: updatePlaceApi,
    onSuccess: () => {
      alert('장소가 성공적으로 수정되었습니다.');
      onPlaceUpdated();
      onClose();
      queryClient.invalidateQueries({ queryKey: ['place', placeId] });
      queryClient.invalidateQueries({
        queryKey: ['user', session?.user?.id, 'places', 'created'],
      });
      queryClient.invalidateQueries({ queryKey: ['placeLocations'] });
    },
    onError: (err) => {
      console.error('Error updating place:', err);
      alert(`장소 수정 실패: ${err.message}`);
    },
  });

  const onSubmit = async (values: EditPlaceFormValues) => {
    if (!session?.user?.id) {
      alert('로그인 후 장소를 수정할 수 있습니다.');
      return;
    }
    updatePlaceMutation({ placeId, values });
  };

  return { form, onSubmit, isLoading, isError, error, placeData };
};
