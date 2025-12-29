import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSession } from 'next-auth/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '~/src/stores/toast-store';
import { ClientPlace } from '~/src/types/shared';
import { useMemo } from 'react';

const alternativeSchema = z.object({
  placeId: z.string().min(1, { message: '장소를 선택해주세요.' }),
  explanation: z.string().min(1, { message: '설명을 입력해주세요.' }),
});

type AlternativeFormValues = z.infer<typeof alternativeSchema>;

interface UseAlternativeFormProps {
  routeId: string;
  routePlaceId: string;
  alternative?: { id: string; placeId: string; explanation: string }; // For edit mode
  originalPlace?: ClientPlace;
  onClose: () => void;
  onSuccess: () => void;
}

const fetchUserPlaces = async (userId: string): Promise<ClientPlace[]> => {
  const response = await fetch(`/api/users/${userId}/places/all`);
  if (!response.ok) {
    throw new Error('Failed to fetch user places');
  }
  return response.json();
};

export const useAlternativeForm = ({
  routeId,
  routePlaceId,
  alternative,
  originalPlace,
  onClose,
  onSuccess,
}: UseAlternativeFormProps) => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const addToast = useSetAtom(addToastAtom);

  const form = useForm<AlternativeFormValues>({
    resolver: zodResolver(alternativeSchema),
    defaultValues: {
      placeId: alternative?.placeId || '',
      explanation: alternative?.explanation || '',
    },
  });

  const { data: userPlaces = [], isLoading: isLoadingUserPlaces } = useQuery<
    ClientPlace[],
    Error
  >({
    queryKey: ['userPlaces', session?.user?.id],
    queryFn: () => fetchUserPlaces(session?.user?.id || ''),
    enabled: !!session?.user?.id,
  });

  const filteredUserPlaces = useMemo(() => {
    if (!originalPlace) {
      return userPlaces;
    }
    return userPlaces.filter(
      (place) =>
        place.district === originalPlace.district &&
        place.category === originalPlace.category &&
        place.id !== originalPlace.id,
    );
  }, [userPlaces, originalPlace]);

  const mutationFn = async (values: AlternativeFormValues) => {
    const url = alternative
      ? `/api/routes/${routeId}/places/${routePlaceId}/alternatives/${alternative.id}`
      : `/api/routes/${routeId}/places/${routePlaceId}/alternatives`;
    const method = alternative ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to save alternative');
    }
    return response.json();
  };

  const { mutate, isPending } = useMutation({
    mutationFn,
    onSuccess: () => {
      addToast({
        message: alternative
          ? '예비 장소가 수정되었습니다.'
          : '예비 장소가 추가되었습니다.',
        duration: 3000,
      });
      onSuccess();
      onClose();
      queryClient.invalidateQueries({ queryKey: ['route', routeId] });
    },
    onError: (error) => {
      addToast({
        message: `예비 장소 저장 실패: ${error.message}`,
        duration: 5000,
      });
      console.error('Error saving alternative:', error);
    },
  });

  const onSubmit = (values: AlternativeFormValues) => {
    if (!session?.user?.id) {
      addToast({ message: '로그인 후 예비 장소를 추가할 수 있습니다.' });
      return;
    }
    mutate(values);
  };

  return {
    form,
    onSubmit,
    isPending,
    userPlaces: filteredUserPlaces,
    isLoadingUserPlaces,
  };
};
