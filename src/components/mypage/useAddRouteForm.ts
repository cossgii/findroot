import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSession } from 'next-auth/react';
import { Place } from '@prisma/client';

const createRouteSchema = z.object({
  name: z.string().min(1, { message: '루트 이름을 입력해주세요.' }),
  description: z.string().optional(),
  districtId: z.string().min(1, { message: '자치구를 선택해주세요.' }),
  selectedPlaces: z
    .array(z.string())
    .min(1, { message: '최소 하나 이상의 장소를 선택해주세요.' }),
});

type AddRouteFormValues = z.infer<typeof createRouteSchema>;

interface UseAddRouteFormProps {
  onClose: () => void;
  onRouteAdded: () => void;
}

export const useAddRouteForm = ({
  onClose,
  onRouteAdded,
}: UseAddRouteFormProps) => {
  const { data: session } = useSession();
  const [userPlaces, setUserPlaces] = useState<Place[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  const form = useForm<AddRouteFormValues>({
    resolver: zodResolver(createRouteSchema),
    defaultValues: {
      name: '',
      description: '',
      districtId: '',
      selectedPlaces: [],
    },
  });

  useEffect(() => {
    if (session?.user?.id) {
      const fetchUserPlaces = async () => {
        try {
          const url = selectedDistrict
            ? `/api/users/${session.user.id}/places?district=${selectedDistrict}`
            : `/api/users/${session.user.id}/places`;

          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const places: Place[] = await response.json();
          setUserPlaces(places);
          // Reset selected places if district changes
          form.setValue('selectedPlaces', []);
        } catch (error) {
          console.error('Error fetching user places:', error);
        }
      };
      fetchUserPlaces();
    }
  }, [session, selectedDistrict]);

  const onSubmit = async (values: AddRouteFormValues) => {
    if (!session?.user?.id) {
      alert('로그인 후 루트를 등록할 수 있습니다.');
      return;
    }

    try {
      const routeResponse = await fetch('/api/routes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name,
          description: values.description,
          districtId: values.districtId, // Pass districtId
        }),
      });

      if (!routeResponse.ok) {
        const errorData = await routeResponse.json();
        alert(`루트 등록 실패: ${errorData.message}`);
        return;
      }

      const newRoute = await routeResponse.json();

      for (let i = 0; i < values.selectedPlaces.length; i++) {
        const placeId = values.selectedPlaces[i];
        await fetch('/api/route-places', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            routeId: newRoute.id,
            placeId: placeId,
            order: i,
          }),
        });
      }

      alert('루트가 성공적으로 등록되었습니다.');
      form.reset();
      onRouteAdded();
      onClose();
    } catch (error) {
      console.error('Error adding route:', error);
      alert('루트 등록 중 오류가 발생했습니다.');
    }
  };

  return { form, onSubmit, userPlaces, selectedDistrict, setSelectedDistrict };
};
