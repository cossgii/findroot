'use client';

import { useCallback } from 'react';
import { Place, Route } from '@prisma/client';

interface ActionProps {
  setMyCreatedPlaces: React.Dispatch<React.SetStateAction<Place[]>>;
  setMyCreatedRoutes: React.Dispatch<React.SetStateAction<Route[]>>;
}

export function useMyPageActions({
  setMyCreatedPlaces,
  setMyCreatedRoutes,
}: ActionProps) {
  const handleDeletePlace = useCallback(
    async (placeId: string) => {
      if (!confirm('정말로 이 장소를 삭제하시겠습니까?')) return;
      try {
        const res = await fetch(`/api/places/${placeId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(await res.text());
        alert('장소가 삭제되었습니다.');
        setMyCreatedPlaces((prev) => prev.filter((p) => p.id !== placeId));
      } catch (e) {
        alert(`장소 삭제 실패: ${e instanceof Error ? e.message : '알 수 없는 오류'}`);
      }
    },
    [setMyCreatedPlaces],
  );

  const handleDeleteRoute = useCallback(
    async (routeId: string) => {
      if (!confirm('정말로 이 루트를 삭제하시겠습니까?')) return;
      try {
        const res = await fetch(`/api/routes/${routeId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(await res.text());
        alert('루트가 삭제되었습니다.');
        setMyCreatedRoutes((prev) => prev.filter((r) => r.id !== routeId));
      } catch (e) {
        alert(`루트 삭제 실패: ${e instanceof Error ? e.message : '알 수 없는 오류'}`);
      }
    },
    [setMyCreatedRoutes],
  );

  return { handleDeletePlace, handleDeleteRoute };
}
