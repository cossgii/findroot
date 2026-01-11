'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getRouteById } from '~/src/services/route/routeService';
import BaseModal from '~/src/components/common/BaseModal';
import KakaoMap from '~/src/components/common/KakaoMap';
import { PlaceCategory, RoutePurpose, RouteStopLabel } from '@prisma/client';

type RouteDetail = NonNullable<Awaited<ReturnType<typeof getRouteById>>>;

interface RoutePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  routeId: string;
}

const purposeMap: Record<RoutePurpose, string> = {
  ENTIRE: '전체',
  FAMILY: '가족',
  GATHERING: '모임',
  SOLO: '나홀로',
  COUPLE: '커플',
};

const routeStopLabelMap: Record<RouteStopLabel, string> = {
  MEAL: '식사',
  CAFE: '카페',
  BAR: '주점',
};

const fetchRouteDetails = async (routeId: string): Promise<RouteDetail> => {
  const response = await fetch(`/api/routes/${routeId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch route details');
  }
  return response.json();
};

const RoutePreviewModalContent = ({ routeId }: { routeId: string }) => {
  const { data: route } = useSuspenseQuery<RouteDetail>({
    queryKey: ['route', routeId],
    queryFn: () => fetchRouteDetails(routeId),
  });

  const mapMarkers = useMemo(
    () =>
      route.places.map((rp) => ({
        id: rp.place.id,
        title: rp.place.name,
        latitude: rp.place.latitude,
        longitude: rp.place.longitude,
        category: rp.place.category as PlaceCategory,
      })),
    [route.places],
  );

  const mainPolyline = useMemo(
    () => [
      {
        path: route.places.map((rp) => ({
          lat: rp.place.latitude,
          lng: rp.place.longitude,
        })),
      },
    ],
    [route.places],
  );

  const center = useMemo(() => {
    if (route.places.length > 0) {
      const latitudes = route.places.map((p) => p.place.latitude);
      const longitudes = route.places.map((p) => p.place.longitude);
      return {
        lat: latitudes.reduce((a, b) => a + b, 0) / latitudes.length,
        lng: longitudes.reduce((a, b) => a + b, 0) / longitudes.length,
      };
    }
    return { lat: 37.5665, lng: 126.978 };
  }, [route.places]);

  return (
    <div className="p-6">
      <div className="mb-4">
        <div className="flex items-baseline gap-x-3">
          <Link href={`/routes/${routeId}`} passHref>
            <h2 className="text-2xl font-bold hover:underline">{route.name}</h2>
          </Link>
          <Link href={`/routes/${routeId}`} passHref>
            <span className="text-sm font-semibold text-blue-600 hover:underline whitespace-nowrap">
              상세보기 &gt;
            </span>
          </Link>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          만든 사람: {route.creator.name}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/2 h-64 rounded-lg overflow-hidden">
          <KakaoMap
            latitude={center.lat}
            longitude={center.lng}
            markers={mapMarkers}
            polylines={mainPolyline}
          />
        </div>
        <div className="w-full md:w-1/2">
          <div className="mb-2">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">
              #{purposeMap[route.purpose]}
            </span>
          </div>
          <p className="text-sm text-gray-700 h-20 overflow-hidden text-ellipsis">
            {route.description}
          </p>
          <div className="mt-2 border-t pt-2">
            <h4 className="font-semibold text-sm mb-1">경유지 요약</h4>
            <ul className="space-y-1">
              {route.places.map((rp) => (
                <li key={rp.id} className="text-xs text-gray-600">
                  {rp.order}. [{routeStopLabelMap[rp.label]}] {rp.place.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function RoutePreviewModal({
  isOpen,
  onClose,
  routeId,
}: RoutePreviewModalProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} contentClassName="max-w-2xl">
      <React.Suspense fallback={<div className="p-6">경로 정보를 불러오는 중...</div>}>
        <RoutePreviewModalContent routeId={routeId} />
      </React.Suspense>
    </BaseModal>
  );
}
