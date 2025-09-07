import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ClientPlace, ClientRoute as Route, RouteStopLabel, ClientRoutePlace } from '~/src/types/shared';
import { useSession } from 'next-auth/react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';
import { UpdateRouteApiSchema } from '~/src/schemas/route-schema';

// Define the shape of a stop in the route creation UI
export interface RouteStop {
  listId: string; // Unique ID for React list operations
  place: ClientPlace;
  label: RouteStopLabel;
}

// Define the Zod schema for the form details (name and description)
const routeDetailsSchema = z.object({
  name: z.string().min(1, { message: '루트 이름을 입력해주세요.' }),
  description: z.string().optional(),
});

type RouteDetails = z.infer<typeof routeDetailsSchema>;

interface UseEditRouteFormProps {
  routeId: string;
  onClose: () => void;
  onRouteUpdated: () => void;
}

const MAX_STOPS = 5;
const SEOUL_CENTER = { lat: 37.5665, lng: 126.978 };

// Define the type for a route with its places included
type RouteWithPlaces = Route & {
  places: ClientRoutePlace[];
};

export const useEditRouteForm = ({
  routeId,
  onClose,
  onRouteUpdated,
}: UseEditRouteFormProps) => {
  const { data: session } = useSession();
  const form = useForm<RouteDetails>({
    resolver: zodResolver(routeDetailsSchema),
  });

  const [stops, setStops] = useState<RouteStop[]>([]);
  const [userPlaces, setUserPlaces] = useState<ClientPlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState(SEOUL_CENTER);

  // Fetch initial route data and all user places
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!session?.user?.id) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const [routeRes, placesRes] = await Promise.all([
          fetch(`/api/routes/${routeId}`),
          fetch(`/api/users/${session.user.id}/places/all`),
        ]);

        if (!routeRes.ok) throw new Error('Failed to fetch route data');
        if (!placesRes.ok) throw new Error('Failed to fetch user places');

        const routeData: RouteWithPlaces = await routeRes.json();
        const placesData: ClientPlace[] = await placesRes.json();

        // Populate form
        form.reset({
          name: routeData.name,
          description: routeData.description || '',
        });

        // Populate stops
        const initialStops = routeData.places.map(p => ({
          listId: p.id,
          place: p.place,
          label: p.label,
        }));
        setStops(initialStops);

        // Set user places for the selector
        setUserPlaces(placesData);

        // Set initial district and map center
        if (routeData.districtId) {
            setSelectedDistrict(routeData.districtId);
            const districtInfo = SEOUL_DISTRICTS.find((d) => d.id === routeData.districtId);
            if (districtInfo) {
                setMapCenter({ lat: districtInfo.lat, lng: districtInfo.lng });
            }
        } else if (initialStops.length > 0) {
            const firstStop = initialStops[0].place;
            setMapCenter({ lat: firstStop.latitude, lng: firstStop.longitude });
        }

      } catch (err) {
        setError('데이터를 불러오는 데 실패했습니다.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [session, routeId, form]);

  // --- Stop Management Functions (same as in useAddRouteForm) ---
  const addStop = (place: ClientPlace, label: RouteStopLabel) => {
    if (stops.length >= MAX_STOPS) {
      alert(`경유지는 최대 ${MAX_STOPS}개까지 추가할 수 있습니다.`);
      return;
    }
    setStops((prev) => [...prev, { listId: Date.now().toString(), place, label }]);
  };

  const removeStop = (listId: string) => {
    setStops((prev) => prev.filter((stop) => stop.listId !== listId));
  };

  // --- District and Map Functions (same as in useAddRouteForm) ---
  const handleDistrictChange = (districtId: string) => {
    setSelectedDistrict(districtId);
    const districtInfo = SEOUL_DISTRICTS.find((d) => d.id === districtId);
    setMapCenter(districtInfo ? { lat: districtInfo.lat, lng: districtInfo.lng } : SEOUL_CENTER);
  };

  // --- Form Submission ---
  const onSubmit = async (data: RouteDetails) => {
    if (stops.length === 0) {
      alert('경유지를 하나 이상 추가해주세요.');
      return;
    }

    const payload: z.infer<typeof UpdateRouteApiSchema> = {
      ...data,
      districtId: selectedDistrict || undefined,
      places: stops.map((stop, index) => ({
        placeId: stop.place.id,
        order: index + 1,
        label: stop.label,
      })),
    };

    try {
      const response = await fetch(`/api/routes/${routeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to update route');
      }

      alert('루트가 성공적으로 수정되었습니다.');
      onRouteUpdated();
      onClose();
    } catch (err) {
      alert('루트 수정에 실패했습니다.');
      console.error(err);
    }
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
  };
};
