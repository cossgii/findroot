'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ClientPlace as Place } from '~/src/types/shared';
import { useSession } from 'next-auth/react';
import { z } from 'zod';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '~/src/stores/toast-store';
import { NewRouteApiSchema, NewRouteInput } from '~/src/schemas/route-schema';
import { RoutePurpose, RouteStopLabel } from '@prisma/client';

export interface RouteStop {
  listId: string;
  place: Place;
  label: RouteStopLabel;
}

const routeDetailsSchema = z.object({
  name: z.string().min(1, { message: '루트 이름을 입력해주세요.' }),
  description: z.string().optional(),
  purpose: z.nativeEnum(RoutePurpose),
});

type RouteDetails = z.infer<typeof routeDetailsSchema>;

interface UseAddRouteFormProps {
  onClose: () => void;
  onRouteAdded: () => void;
}

const MAX_STOPS = 5;
const SEOUL_CENTER = { lat: 37.5665, lng: 126.978 };

const createRouteApi = async (payload: NewRouteInput) => {
  const response = await fetch('/api/routes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create route');
  }
  return response.json();
};

const fetchPlacesByDistrict = async (
  districtId: string | null,
): Promise<Place[]> => {
  if (!districtId) return [];
  const response = await fetch(`/api/places?district=${districtId}&limit=200`);
  if (!response.ok) {
    throw new Error('Failed to fetch places');
  }
  const data = await response.json();
  return data.places;
};

export const useAddRouteForm = ({
  onClose,
  onRouteAdded,
}: UseAddRouteFormProps) => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const addToast = useSetAtom(addToastAtom);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState(false);
  const form = useForm<RouteDetails>({
    resolver: zodResolver(routeDetailsSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      description: '',
      purpose: RoutePurpose.ENTIRE,
    },
  });

  const [stops, setStops] = useState<RouteStop[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [pendingDistrictId, setPendingDistrictId] = useState<string | null>(
    null,
  );
  const [mapCenter, setMapCenter] = useState(SEOUL_CENTER);

  const userId = session?.user?.id || '';

  const {
    data: userPlaces = [],
    isLoading,
    error,
  } = useQuery<Place[], Error>({
    queryKey: ['places', selectedDistrict],
    queryFn: () => fetchPlacesByDistrict(selectedDistrict),
    enabled: !!selectedDistrict,
  });

  const { mutate: addRouteMutation, isPending } = useMutation({
    mutationFn: createRouteApi,
    onSuccess: () => {
      addToast({
        id: Date.now().toString(),
        message: '루트가 성공적으로 등록되었습니다.',
        duration: 3000,
      });
      onRouteAdded();
      onClose();
      queryClient.invalidateQueries({
        queryKey: ['user', userId, 'routes', 'created'],
      });
    },
    onError: (error) => {
      addToast({
        id: Date.now().toString(),
        message: `루트 등록 실패: ${error.message}`,
        duration: 5000,
      });
      console.error('Error adding route:', error);
    },
  });

  const addStop = (place: Place, label: RouteStopLabel) => {
    if (stops.length >= MAX_STOPS) {
      addToast({
        id: Date.now().toString(),
        message: `경유지는 최대 ${MAX_STOPS}개까지 추가할 수 있습니다.`,
      });
      return;
    }

    const isDuplicate = stops.some(stop => stop.place.id === place.id);
    if (isDuplicate) {
      addToast({
        id: Date.now().toString(),
        message: '이미 추가된 장소입니다.',
      });
      return;
    }

    setStops((prev) => {
      const newStops = [
        ...prev,
        { listId: Date.now().toString(), place, label },
      ];
      setMapCenter({ lat: place.latitude, lng: place.longitude });
      return newStops;
    });
  };

  const removeStop = (listId: string) => {
    setStops((prev) => {
      const newStops = prev.filter((stop) => stop.listId !== listId);
      if (newStops.length > 0) {
        const lastStop = newStops[newStops.length - 1];
        setMapCenter({
          lat: lastStop.place.latitude,
          lng: lastStop.place.longitude,
        });
      } else if (selectedDistrict) {
        const districtInfo = SEOUL_DISTRICTS.find(
          (d) => d.id === selectedDistrict,
        );
        setMapCenter(
          districtInfo
            ? { lat: districtInfo.lat, lng: districtInfo.lng }
            : SEOUL_CENTER,
        );
      } else {
        setMapCenter(SEOUL_CENTER);
      }
      return newStops;
    });
  };

  const handleConfirmDistrictChange = () => {
    setStops([]);
    setSelectedDistrict(pendingDistrictId);
    const districtInfo = SEOUL_DISTRICTS.find(
      (d) => d.id === pendingDistrictId,
    );
    if (districtInfo) {
      setMapCenter({ lat: districtInfo.lat, lng: districtInfo.lng });
    }
    setPendingDistrictId(null);
    setIsConfirmationDialogOpen(false);
  };

  const handleCancelDistrictChange = () => {
    setPendingDistrictId(null);
    setIsConfirmationDialogOpen(false);
  };

  const handleDistrictChange = (newDistrictId: string) => {
    if (stops.length > 0 && newDistrictId !== selectedDistrict) {
      setPendingDistrictId(newDistrictId);
      setIsConfirmationDialogOpen(true);
    } else {
      setSelectedDistrict(newDistrictId);
      const districtInfo = SEOUL_DISTRICTS.find((d) => d.id === newDistrictId);
      if (districtInfo) {
        setMapCenter({ lat: districtInfo.lat, lng: districtInfo.lng });
      }
    }
  };

  const onSubmit = (data: RouteDetails) => {
    if (stops.length === 0) {
      addToast({ id: Date.now().toString(), message: '경유지를 하나 이상 추가해주세요.' });
      return;
    }

    const payload: NewRouteInput = {
      ...data,
      districtId: selectedDistrict,
      places: stops.map((stop, index) => ({
        placeId: stop.place.id,
        order: index + 1,
        label: stop.label,
      })),
    };

    const validationResult = NewRouteApiSchema.safeParse(payload);
    if (!validationResult.success) {
      console.error('API Payload validation failed:', validationResult.error);
      addToast({ id: Date.now().toString(), message: '입력 데이터가 올바르지 않습니다.' });
      return;
    }

    addRouteMutation(validationResult.data);
  };

  return {
    form,
    stops,
    userPlaces,
    isLoading,
    error: error ? error.message : null,
    addStop,
    removeStop,
    onSubmit,
    selectedDistrict,
    mapCenter,
    handleDistrictChange,
    isPending,
    isConfirmationDialogOpen,
    handleConfirmDistrictChange,
    handleCancelDistrictChange,
    pendingDistrictId,
  };
};
