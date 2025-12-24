'use client';

import React from 'react';
import KakaoMap from '~/src/components/common/KakaoMap';
import { Awaited } from '~/src/types/shared';
import { getRouteById } from '~/src/services/route/routeService';
import { PlaceCategory, RoutePurpose } from '@prisma/client';
import Link from 'next/link';

type RouteDetail = NonNullable<Awaited<ReturnType<typeof getRouteById>>>;

interface RouteDetailClientProps {
  route: RouteDetail;
}

const purposeMap: Record<RoutePurpose, string> = {
  ENTIRE: '전체',
  FAMILY: '가족',
  GATHERING: '모임',
  SOLO: '나홀로',
  COUPLE: '커플',
};

export default function RouteDetailClient({ route }: RouteDetailClientProps) {
  const mapMarkers = route.places.map((p) => ({
    id: p.place.id,
    title: p.place.name,
    latitude: p.place.latitude,
    longitude: p.place.longitude,
    category: p.place.category as PlaceCategory,
  }));

  const mapPolylines = [
    {
      path: route.places.map((p) => ({
        lat: p.place.latitude,
        lng: p.place.longitude,
      })),
    },
  ];

  const center =
    route.places.length > 0
      ? {
          lat: route.places[0].place.latitude,
          lng: route.places[0].place.longitude,
        }
      : { lat: 37.5665, lng: 126.978 };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">{route.name}</h1>
        <Link href="/" className="p-2 rounded-md hover:bg-gray-100 text-sm">
          홈으로
        </Link>
      </div>
      <div className="mb-4">
        <span className="font-semibold">목적:</span> {purposeMap[route.purpose]}
      </div>
      <p className="text-gray-600 mb-8">{route.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">경유지 목록</h2>
          <ul className="space-y-4">
            {route.places.map((rp, index) => (
              <li key={rp.id} className="border p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <span className="bg-primary-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4">
                    {index + 1}
                  </span>
                  <h3 className="text-xl font-semibold">{rp.place.name}</h3>
                </div>
                <p className="text-gray-500 ml-12">{rp.place.description}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="h-[400px] md:h-full w-full rounded-lg overflow-hidden">
          <KakaoMap
            latitude={center.lat}
            longitude={center.lng}
            markers={mapMarkers}
            polylines={mapPolylines}
          />
        </div>
      </div>
    </div>
  );
}
