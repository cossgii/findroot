'use client';

import { useMemo, Suspense, useState, useEffect } from 'react';
import KakaoMap from '~/src/components/common/KakaoMap';
import Link from 'next/link';
import React from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useSetAtom } from 'jotai';
import { modalAtom } from '~/src/stores/app-store';

import { getRouteById } from '~/src/services/route/routeService';
import { PlaceCategory } from '@prisma/client';
import CommentSection from '~/src/components/comments/CommentSection';
import { ArrowDown } from 'lucide-react';
import { cn } from '~/src/utils/class-name';
import { PURPOSE_MAP } from '@/constants/purpose';

type RouteDetail = NonNullable<Awaited<ReturnType<typeof getRouteById>>>;
type Waypoint = RouteDetail['places'][0];

interface RouteDetailClientProps {
  route: RouteDetail;
}

const WaypointCard = ({
  rp,
  index,
  onSelect,
  selectedPlaceId,
}: {
  rp: Waypoint;
  index: number;
  onSelect: (placeId: string) => void;
  selectedPlaceId: string;
}) => {
  const [isFlipped, setFlipped] = useState(false);
  const { transform, opacity } = useSpring({
    opacity: isFlipped ? 1 : 0,
    transform: `perspective(600px) rotateY(${isFlipped ? 180 : 0}deg)`,
    config: { mass: 5, tension: 500, friction: 80 },
  });

  const selectedPlace =
    rp.place.id === selectedPlaceId
      ? rp.place
      : rp.alternatives.find((alt) => alt.place.id === selectedPlaceId)
          ?.place || rp.place;

  const handleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (rp.alternatives.length > 0) {
      setFlipped((f) => !f);
    }
  };

  const handleSelectAndFlip = (e: React.MouseEvent, placeId: string) => {
    e.stopPropagation();
    onSelect(placeId);
    setFlipped(false);
  };

  return (
    <div
      className="relative w-full min-h-[12rem]"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <animated.div
        className="absolute w-full h-full cursor-default"
        style={{
          opacity,
          transform,
          rotateY: '180deg',
          backfaceVisibility: 'hidden',
        }}
      >
        <div className="bg-gray-100 rounded-lg shadow-lg p-4 h-full flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-gray-800">장소 변경</h4>
          </div>
          <div className="space-y-2 overflow-y-auto flex-grow">
            {[
              { place: rp.place, explanation: '(원래 장소)' },
              ...rp.alternatives,
            ].map(({ place, explanation }) => (
              <div
                key={place.id}
                onClick={(e) => handleSelectAndFlip(e, place.id)}
                className={cn(
                  'p-2 border rounded-md cursor-pointer transition-colors bg-white',
                  selectedPlaceId === place.id
                    ? 'border-primary-600 ring-1 ring-primary-500'
                    : 'hover:bg-gray-50',
                )}
              >
                <p className="font-medium text-sm">{place.name}</p>
                <p className="text-xs text-gray-500">{explanation}</p>
              </div>
            ))}
          </div>
        </div>
      </animated.div>
      <animated.div
        className={cn(
          'absolute w-full h-full border p-4 rounded-lg bg-white shadow-sm',
          rp.alternatives.length > 0 && 'cursor-pointer',
        )}
        style={{
          opacity: opacity.to((o) => 1 - o),
          transform,
          backfaceVisibility: 'hidden',
        }}
        onClick={handleFlip}
      >
        <div className="flex items-center mb-2">
          <span className="bg-primary-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4">
            {index + 1}
          </span>
          <h3 className="text-xl font-semibold">{selectedPlace.name}</h3>
        </div>
        <p className="text-gray-500 ml-12">{selectedPlace.description}</p>
        {rp.alternatives.length > 0 && (
          <div className="absolute bottom-2 right-3 text-xs text-primary-600 font-semibold">
            (카드 클릭하여 장소 변경)
          </div>
        )}
      </animated.div>
    </div>
  );
};

export default function RouteDetailClient({ route }: RouteDetailClientProps) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const setModal = useSetAtom(modalAtom);

  const [selectedAlternatives, setSelectedAlternatives] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      setModal({
        type: 'LOGIN_PROMPT',
        props: {
          title: '로그인이 필요합니다',
          message: '루트 상세 정보를 보려면 로그인이 필요합니다.',
          onConfirm: () =>
            router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`),
          onCancel: () =>
            router.push(`/districts/${route.districtId || 'all'}/routes`),
        },
      });
    }
  }, [status, setModal, router, pathname, route.districtId]);

  const handleAlternativeChange = (
    routePlaceId: string,
    newPlaceId: string,
  ) => {
    setSelectedAlternatives((prev) => ({
      ...prev,
      [routePlaceId]: newPlaceId,
    }));
  };

  const currentPlaces = useMemo(() => {
    return route.places.map((rp) => {
      const selectedPlaceId = selectedAlternatives[rp.id] || rp.place.id;
      if (selectedPlaceId !== rp.place.id) {
        const alternative = rp.alternatives.find(
          (alt) => alt.place.id === selectedPlaceId,
        );
        return alternative ? alternative.place : rp.place;
      }
      return rp.place;
    });
  }, [route.places, selectedAlternatives]);

  const mainPolyline = useMemo(
    () => [
      {
        path: currentPlaces.map((p) => ({
          lat: p.latitude,
          lng: p.longitude,
        })),
      },
    ],
    [currentPlaces],
  );

  const mapMarkers = useMemo(
    () =>
      currentPlaces.map((p) => ({
        id: p.id,
        title: p.name,
        latitude: p.latitude,
        longitude: p.longitude,
        category: p.category as PlaceCategory,
      })),
    [currentPlaces],
  );

  const center = useMemo(() => {
    if (currentPlaces.length > 0) {
      const latitudes = currentPlaces.map((p) => p.latitude);
      const longitudes = currentPlaces.map((p) => p.longitude);
      return {
        lat: latitudes.reduce((a, b) => a + b, 0) / latitudes.length,
        lng: longitudes.reduce((a, b) => a + b, 0) / longitudes.length,
      };
    }
    return { lat: 37.5665, lng: 126.978 };
  }, [currentPlaces]);

  if (status !== 'authenticated') {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>로그인 정보를 확인하는 중...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">{route.name}</h1>
        <Link
          href={`/districts/${route.districtId || 'all'}?purpose=${route.purpose}`}
          className="p-2 rounded-md hover:bg-gray-100 text-sm"
        >
          목록으로
        </Link>
      </div>
      <div className="flex items-center space-x-4 mb-4">
        <span className="font-semibold">
          목적: {PURPOSE_MAP[route.purpose].title}
        </span>
        <a
          href="#comments"
          className="flex items-center text-gray-600 hover:underline"
        >
          <span className="mr-1">💬</span>
          <span>{route.commentsCount}</span>
        </a>
      </div>
      <p className="text-gray-600 mb-8">{route.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">경유지 목록</h2>
          <ul className="flex flex-col items-center">
            {route.places.flatMap((rp, index) => {
              const waypoint = (
                <WaypointCard
                  key={rp.id}
                  rp={rp}
                  index={index}
                  onSelect={(placeId) =>
                    handleAlternativeChange(rp.id, placeId)
                  }
                  selectedPlaceId={selectedAlternatives[rp.id] || rp.place.id}
                />
              );

              if (index === 0) {
                return [waypoint];
              }

              const arrow = (
                <li key={`arrow-${rp.id}`} aria-hidden="true" className="my-2">
                  <ArrowDown className="h-6 w-6 text-gray-400" />
                </li>
              );

              return [arrow, waypoint];
            })}
          </ul>
        </div>
        <div className="h-[400px] md:h-full w-full rounded-lg overflow-hidden sticky top-24">
          <KakaoMap
            latitude={center.lat}
            longitude={center.lng}
            markers={mapMarkers}
            polylines={mainPolyline}
          />
        </div>
      </div>
      <Suspense
        fallback={
          <div className="mt-12 pt-8 border-t">댓글을 불러오는 중...</div>
        }
      >
        <CommentSection routeId={route.id} />
      </Suspense>
    </div>
  );
}
