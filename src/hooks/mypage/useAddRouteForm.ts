import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Place, RouteStopLabel } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { z } from 'zod';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '~/src/stores/toast-store';

const _apiPayloadSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  districtId: z.string().nullable(),
  places: z.array(
    z.object({
      placeId: z.string(),
      order: z.number().int(),
      label: z.enum(['MEAL', 'CAFE', 'BAR']),
    }),
  ),
});

type ApiPayload = z.infer<typeof _apiPayloadSchema>;

export interface RouteStop {
  listId: string;
  place: Place;
  label: RouteStopLabel;
}

const routeDetailsSchema = z.object({
  name: z.string().min(1, { message: '루트 이름을 입력해주세요.' }),
  description: z.string().optional(),
});

type RouteDetails = z.infer<typeof routeDetailsSchema>;

interface UseAddRouteFormProps {
  onClose: () => void;
  onRouteAdded: () => void;
}

const MAX_STOPS = 5;
const SEOUL_CENTER = { lat: 37.5665, lng: 126.978 };

const createRouteApi = async (payload: ApiPayload) => {
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
    },
  });

  const [stops, setStops] = useState<RouteStop[]>([]);
  const [userPlaces, setUserPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [pendingDistrictId, setPendingDistrictId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState(SEOUL_CENTER);

  useEffect(() => {
    const fetchUserPlaces = async () => {
      if (!session?.user?.id) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/users/${session.user.id}/places/all`,
        );
        if (!response.ok) {
          throw new Error('Failed to fetch user places');
        }
        const places: Place[] = await response.json();
        setUserPlaces(places);
      } catch (err) {
        setError('장소 목록을 불러오는 데 실패했습니다.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserPlaces();
  }, [session]);

  const { mutate: addRouteMutation, isPending } = useMutation({
    mutationFn: createRouteApi,
    onSuccess: () => {
      addToast({
        message: '루트가 성공적으로 등록되었습니다.',
        duration: 3000,
      });
      onRouteAdded();
      onClose();
      queryClient.invalidateQueries({
        queryKey: ['user', session?.user?.id, 'routes', 'created'],
      });
    },
    onError: (error) => {
      addToast({ message: `루트 등록 실패: ${error.message}`, duration: 5000 });
      console.error('Error adding route:', error);
    },
  });

  const addStop = (place: Place, label: RouteStopLabel) => {
    if (stops.length >= MAX_STOPS) {
      addToast({
        message: `경유지는 최대 ${MAX_STOPS}개까지 추가할 수 있습니다.`,
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
    const districtInfo = SEOUL_DISTRICTS.find((d) => d.id === pendingDistrictId);
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
      addToast({ message: '경유지를 하나 이상 추가해주세요.' });
      return;
    }

    const payload = {
      ...data,
      districtId: selectedDistrict,
      places: stops.map((stop, index) => ({
        placeId: stop.place.id,
        order: index + 1,
        label: stop.label,
      })),
    };

    addRouteMutation(payload);
  };

  return {
    form,
    stops,
    userPlaces,
    isLoading,
    error,
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
