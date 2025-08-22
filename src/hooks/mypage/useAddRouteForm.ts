import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Place, RouteStopLabel } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { z } from 'zod';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';

// Define the shape of a stop in the route creation UI
export interface RouteStop {
  listId: string; // Unique ID for React list operations
  place: Place;
  label: RouteStopLabel;
}

// Define the Zod schema for the form itself (name and description)
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

export const useAddRouteForm = ({
  onClose,
  onRouteAdded,
}: UseAddRouteFormProps) => {
  const { data: session } = useSession();
  const form = useForm<RouteDetails>({
    resolver: zodResolver(routeDetailsSchema),
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
  const [mapCenter, setMapCenter] = useState(SEOUL_CENTER);

  // Fetch all places created by the user
  useEffect(() => {
    const fetchUserPlaces = async () => {
      if (!session?.user?.id) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const response = await fetch(`/api/users/${session.user.id}/places/all`);
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

  // --- Stop Management Functions ---

  const addStop = (place: Place, label: RouteStopLabel) => {
    if (stops.length >= MAX_STOPS) {
      alert(`경유지는 최대 ${MAX_STOPS}개까지 추가할 수 있습니다.`);
      return;
    }
    setStops((prev) => {
      const newStops = [...prev, { listId: Date.now().toString(), place, label }];
      setMapCenter({ lat: place.latitude, lng: place.longitude }); // Update map center
      return newStops;
    });
  };

  const removeStop = (listId: string) => {
    setStops((prev) => {
      const newStops = prev.filter((stop) => stop.listId !== listId);
      if (newStops.length > 0) {
        const lastStop = newStops[newStops.length - 1];
        setMapCenter({ lat: lastStop.place.latitude, lng: lastStop.place.longitude });
      } else {
        setMapCenter(SEOUL_CENTER);
      }
      return newStops;
    });
  };

  const updateStopLabel = (listId: string, newLabel: RouteStopLabel) => {
    setStops((prev) =>
      prev.map((stop) =>
        stop.listId === listId ? { ...stop, label: newLabel } : stop,
      ),
    );
  };

  const reorderStops = (sourceIndex: number, destinationIndex: number) => {
    setStops((prev) => {
      const result = Array.from(prev);
      const [removed] = result.splice(sourceIndex, 1);
      result.splice(destinationIndex, 0, removed);
      return result;
    });
  };

  // --- District and Map Functions ---
  const handleDistrictChange = (districtId: string) => {
    setSelectedDistrict(districtId);
    const districtInfo = SEOUL_DISTRICTS.find((d) => d.id === districtId);
    if (districtInfo) {
      setMapCenter({ lat: districtInfo.lat, lng: districtInfo.lng });
    } else {
      setMapCenter(SEOUL_CENTER);
    }
  };

  // --- Form Submission ---

  const onSubmit = async (data: RouteDetails) => {
    if (stops.length === 0) {
      alert('경유지를 하나 이상 추가해주세요.');
      return;
    }

    const placesForApi = stops.map((stop, index) => ({
      placeId: stop.place.id,
      order: index + 1,
      label: stop.label,
    }));

    const payload = {
      ...data,
      places: placesForApi,
      // Add districtId to the payload if a district is selected
      districtId: selectedDistrict,
    };

    try {
      const response = await fetch('/api/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to create route');
      }

      alert('루트가 성공적으로 생성되었습니다.');
      onRouteAdded();
      onClose();
    } catch (err) {
      alert('루트 생성에 실패했습니다.');
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
    updateStopLabel,
    reorderStops,
    onSubmit,
    selectedDistrict,
    mapCenter,
    handleDistrictChange,
  };
};
