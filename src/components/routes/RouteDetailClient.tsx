'use client';

import React, { useState, useMemo, Suspense } from 'react';
import KakaoMap from '~/src/components/common/KakaoMap';
import { useSession } from 'next-auth/react';

import { getRouteById } from '~/src/services/route/routeService';
import { PlaceCategory, RoutePurpose } from '@prisma/client';
import Link from 'next/link';
import Button from '~/src/components/common/Button';
import CommentSection from '~/src/components/comments/CommentSection';
import AddAlternativeModal from '~/src/components/routes/AddAlternativeModal';
import EditAlternativeModal from '~/src/components/routes/EditAlternativeModal';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type RouteDetail = NonNullable<Awaited<ReturnType<typeof getRouteById>>>;
type RoutePlaceWithAlts = RouteDetail['places'][0];
type AlternativeWithPlace = RoutePlaceWithAlts['alternatives'][0];

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

// Internal component for managing and displaying alternatives for a single route stop
const AlternativePlacesSection = ({
  routePlace,
  routeId,
  onPreview,
  onClearPreview,
  isPreviewing,
  previewOriginalPlaceId,
  onAlternativeAdded,
  onAlternativeUpdated,
  onAlternativeDeleted,
  isRouteOwner,
}: {
  routePlace: RoutePlaceWithAlts;
  routeId: string;
  onPreview: (alternative: AlternativeWithPlace) => void;
  onClearPreview: () => void;
  isPreviewing: boolean;
  previewOriginalPlaceId: string | null;
  onAlternativeAdded: () => void;
  onAlternativeUpdated: () => void;
  onAlternativeDeleted: () => void;
  isRouteOwner: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAlternative, setEditingAlternative] =
    useState<AlternativeWithPlace | null>(null);

  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: (alternativeId: string) =>
      fetch(
        `/api/routes/${routeId}/places/${routePlace.id}/alternatives/${alternativeId}`,
        {
          method: 'DELETE',
        },
      ),
    onSuccess: () => {
      onAlternativeDeleted();
      queryClient.invalidateQueries({
        queryKey: ['route', routeId],
      });
    },
    onError: (error) => {
      alert(`예비 장소 삭제 실패: ${error.message}`);
    },
  });

  const handleDeleteAlternative = (alternativeId: string) => {
    if (confirm('정말로 이 예비 장소를 삭제하시겠습니까?')) {
      deleteMutation.mutate(alternativeId);
    }
  };

  return (
    <div className="mt-3 pl-12">
      {(routePlace.alternatives && routePlace.alternatives.length > 0) ||
      isRouteOwner ? (
        <Button
          variant="outlined"
          size="small"
          className="w-auto px-3"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded
            ? '예비 장소 숨기기'
            : `예비 장소 보기 (${routePlace.alternatives?.length || 0})`}
        </Button>
      ) : null}

      {isExpanded && (
        <div className="mt-2 space-y-3 border-l-2 border-gray-200 pl-4">
          {routePlace.alternatives?.map((alt) => (
            <div key={alt.id} className="p-3 bg-gray-50 rounded-md">
              <p className="font-semibold text-gray-800">{alt.place.name}</p>
              <p className="text-sm text-gray-600 my-1">{alt.explanation}</p>
              <div className="flex space-x-2 mt-2">
                <Button
                  size="small"
                  className="w-auto px-2 py-1 text-xs"
                  onClick={() =>
                    isPreviewing && previewOriginalPlaceId === routePlace.id
                      ? onClearPreview()
                      : onPreview(alt)
                  }
                >
                  {isPreviewing && previewOriginalPlaceId === routePlace.id
                    ? '원래 루트 보기'
                    : '지도에서 보기'}
                </Button>
                {isRouteOwner && (
                  <>
                    <Button
                      size="small"
                      variant="outlined"
                      className="w-auto px-2 py-1 text-xs"
                      onClick={() => {
                        setEditingAlternative(alt);
                        setIsEditModalOpen(true);
                      }}
                    >
                      수정
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      className="w-auto px-2 py-1 text-xs"
                      onClick={() => handleDeleteAlternative(alt.id)}
                    >
                      삭제
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
          {isRouteOwner && routePlace.alternatives.length < 3 && (
            <Button
              size="small"
              className="w-full mt-2"
              onClick={() => setIsAddModalOpen(true)}
            >
              예비 장소 추가
            </Button>
          )}
        </div>
      )}

      {isRouteOwner && (
        <>
          <AddAlternativeModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            routeId={routeId}
            routePlaceId={routePlace.id}
            onAlternativeAdded={onAlternativeAdded}
            originalPlace={routePlace.place}
          />
          {editingAlternative && (
            <EditAlternativeModal
              isOpen={isEditModalOpen}
              onClose={() => {
                setIsEditModalOpen(false);
                setEditingAlternative(null);
              }}
              routeId={routeId}
              routePlaceId={routePlace.id}
              alternative={editingAlternative}
              onAlternativeUpdated={onAlternativeUpdated}
            />
          )}
        </>
      )}
    </div>
  );
};

export default function RouteDetailClient({ route }: RouteDetailClientProps) {
  const { data: session } = useSession();
  const isRouteOwner = session?.user?.id === route.creatorId;

  const [previewAlternative, setPreviewAlternative] =
    useState<AlternativeWithPlace | null>(null);
  const [previewOriginalPlaceId, setPreviewOriginalPlaceId] = useState<
    string | null
  >(null);

  const queryClient = useQueryClient();

  const onAlternativeChange = () => {
    queryClient.invalidateQueries({ queryKey: ['route', route.id] });
  };

  const mainPolyline = useMemo(
    () => [
      {
        path: route.places.map((p) => ({
          lat: p.place.latitude,
          lng: p.place.longitude,
        })),
      },
    ],
    [route.places],
  );

  const previewPolyline = useMemo(() => {
    if (!previewAlternative || !previewOriginalPlaceId) return null;

    const newPath = route.places.map((p) => {
      if (p.id === previewOriginalPlaceId) {
        return {
          lat: previewAlternative.place.latitude,
          lng: previewAlternative.place.longitude,
        };
      }
      return { lat: p.place.latitude, lng: p.place.longitude };
    });

    return [{ path: newPath, strokeColor: '#0000FF' }]; // Different color for preview
  }, [route.places, previewAlternative, previewOriginalPlaceId]);

  const handlePreview = (
    originalRoutePlaceId: string,
    alternative: AlternativeWithPlace,
  ) => {
    setPreviewOriginalPlaceId(originalRoutePlaceId);
    setPreviewAlternative(alternative);
  };

  const handleClearPreview = () => {
    setPreviewOriginalPlaceId(null);
    setPreviewAlternative(null);
  };

  const mapMarkers = route.places.map((p) => ({
    id: p.place.id,
    title: p.place.name,
    latitude: p.place.latitude,
    longitude: p.place.longitude,
    category: p.place.category as PlaceCategory,
  }));

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
        <Link
          href={`/districts/${route.districtId || 'all'}/routes`}
          className="p-2 rounded-md hover:bg-gray-100 text-sm"
        >
          목록으로
        </Link>
      </div>
      <div className="flex items-center space-x-4 mb-4">
        <span className="font-semibold">목적: {purposeMap[route.purpose]}</span>
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
          <ul className="space-y-4">
            {route.places.map((rp, index) => (
              <li
                key={rp.id}
                className="border p-4 rounded-lg bg-white shadow-sm"
              >
                <div className="flex items-center mb-2">
                  <span className="bg-primary-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4">
                    {index + 1}
                  </span>
                  <h3 className="text-xl font-semibold">{rp.place.name}</h3>
                </div>
                <p className="text-gray-500 ml-12">{rp.place.description}</p>
                <AlternativePlacesSection
                  routePlace={rp}
                  routeId={route.id}
                  onPreview={(alt) => handlePreview(rp.id, alt)}
                  onClearPreview={handleClearPreview}
                  isPreviewing={previewOriginalPlaceId === rp.id}
                  previewOriginalPlaceId={previewOriginalPlaceId}
                  onAlternativeAdded={onAlternativeChange}
                  onAlternativeUpdated={onAlternativeChange}
                  onAlternativeDeleted={onAlternativeChange}
                  isRouteOwner={isRouteOwner}
                />
              </li>
            ))}
          </ul>
        </div>
        <div className="h-[400px] md:h-full w-full rounded-lg overflow-hidden sticky top-24">
          <KakaoMap
            latitude={center.lat}
            longitude={center.lng}
            markers={mapMarkers}
            polylines={previewPolyline || mainPolyline}
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
