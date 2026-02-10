'use client';

import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import Button from '~/src/components/common/Button';
import { type MyPageSubTab } from '../MyPageTabs';
import { Restaurant, RouteWithLikeData } from '~/src/types/restaurant';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';
import { ClientPlace, ClientRoutePlace } from '~/src/types/shared';
import { RouteStopLabel } from '@prisma/client';
import { cn } from '~/src/utils/class-name';
import AddAlternativeModal from '~/src/components/routes/AddAlternativeModal';
import EditAlternativeModal from '~/src/components/routes/EditAlternativeModal';
import { useSession } from 'next-auth/react';

interface AlternativeWithPlace {
  id: string;
  explanation: string;
  createdAt: string;
  updatedAt: string;
  routePlaceId: string;
  placeId: string;
  place: ClientPlace;
}

interface RoutePlaceWithAlts extends ClientRoutePlace {
  place: Restaurant;
  alternatives: AlternativeWithPlace[];
}

interface RouteWithPlacesAndAlts extends RouteWithLikeData {
  places: RoutePlaceWithAlts[];
  commentsCount: number;
}

interface CreatedContentListProps {
  activeSubTab: MyPageSubTab;
  places: Restaurant[];
  routes: RouteWithLikeData[];
  onEditPlace: (id: string) => void;
  onDeletePlace: (id: string) => void;
  onEditRoute: (id: string) => void;
  onDeleteRoute: (id: string) => void;
  onToggleIsRepresentative?: (
    routeId: string,
    isRepresentative: boolean,
  ) => void;
  onContentUpdate: () => void;
}
const routeStopLabelMap: Record<
  RouteStopLabel,
  { text: string; className: string }
> = {
  MEAL: { text: '식사', className: 'bg-blue-100 text-blue-800' },
  CAFE: { text: '카페', className: 'bg-green-100 text-green-800' },
  BAR: { text: '주점', className: 'bg-red-100 text-red-800' },
};
const fetchRouteDetails = async (
  routeId: string,
): Promise<RouteWithPlacesAndAlts> => {
  const response = await fetch(`/api/routes/${routeId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch route details');
  }
  return response.json();
};

export default function CreatedContentList({
  activeSubTab,
  places,
  routes,
  onEditPlace,
  onDeletePlace,
  onEditRoute,
  onDeleteRoute,
  onToggleIsRepresentative,
  onContentUpdate,
}: CreatedContentListProps) {
  const queryClient = useQueryClient();
  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);
  const [expandedRoutePlaceId, setExpandedRoutePlaceId] = useState<
    string | null
  >(null);
  const [addAlternativeModalState, setAddAlternativeModalState] = useState<{
    isOpen: boolean;
    routeId: string;
    routePlaceId: string;
    originalPlace: ClientPlace;
    existingAlternatives: { placeId: string }[];
  } | null>(null);
  const [editAlternativeModalState, setEditAlternativeModalState] = useState<{
    isOpen: boolean;
    routeId: string;
    routePlaceId: string;
    alternative: AlternativeWithPlace;
  } | null>(null);
  const [hoveredRoutePlaceId, setHoveredRoutePlaceId] = useState<string | null>(
    null,
  );
  const { data: session } = useSession();

  const handleToggleIsRepresentative = onToggleIsRepresentative;

  const toggleRepresentativeMutation = useMutation({
    mutationFn: async ({
      routeId,
      isRepresentative,
    }: {
      routeId: string;
      isRepresentative: boolean;
    }) => {
      const res = await fetch(`/api/routes/${routeId}/representative`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRepresentative }),
      });
      if (!res.ok) {
        throw new Error('Failed to update representative status');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['user', session?.user?.id, 'routes', 'created'],
      });
      onContentUpdate();
    },
    onError: (error) => {
      alert(`대표 루트 설정 실패: ${error.message}`);
    },
  });

  const { data: detailedRoute, isLoading: isLoadingRouteDetails } = useQuery<
    RouteWithPlacesAndAlts,
    Error
  >({
    queryKey: ['route', expandedRouteId],
    queryFn: () => fetchRouteDetails(expandedRouteId!),
    enabled: !!expandedRouteId,
  });

  const handleRouteClick = (routeId: string) => {
    setExpandedRouteId((prev) => (prev === routeId ? null : routeId));
    setExpandedRoutePlaceId(null);
  };

  const handleRoutePlaceClick = (routePlaceId: string) => {
    setExpandedRoutePlaceId((prev) =>
      prev === routePlaceId ? null : routePlaceId,
    );
  };

  const handleOpenAddAlternativeModal = (
    routeId: string,
    routePlaceId: string,
    originalPlace: ClientPlace,
    existingAlternatives: { placeId: string }[],
  ) => {
    setAddAlternativeModalState({
      isOpen: true,
      routeId,
      routePlaceId,
      originalPlace,
      existingAlternatives,
    });
  };

  const handleCloseAddAlternativeModal = () => {
    setAddAlternativeModalState(null);
  };

  const handleOpenEditAlternativeModal = (
    routeId: string,
    routePlaceId: string,
    alternative: AlternativeWithPlace,
  ) => {
    setEditAlternativeModalState({
      isOpen: true,
      routeId,
      routePlaceId,
      alternative,
    });
  };

  const handleCloseEditAlternativeModal = () => {
    setEditAlternativeModalState(null);
  };

  const handleAlternativeAddedOrUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ['route', expandedRouteId] });
    onContentUpdate();
  };

  const handleDeleteAlternative = async (
    routeId: string,
    routePlaceId: string,
    alternativeId: string,
  ) => {
    if (!confirm('정말로 이 예비 장소를 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(
        `/api/routes/${routeId}/places/${routePlaceId}/alternatives/${alternativeId}`,
        {
          method: 'DELETE',
        },
      );
      if (!res.ok) throw new Error(await res.text());
      alert('예비 장소가 삭제되었습니다.');
      handleAlternativeAddedOrUpdated();
    } catch (e) {
      alert(
        `예비 장소 삭제 실패: ${
          e instanceof Error ? e.message : '알 수 없는 오류'
        }`,
      );
    }
  };

  if (activeSubTab === 'places') {
    return places.length > 0 ? (
      <ul className="space-y-3">
        {places.map((place) => (
          <li
            key={place.id}
            className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between card-hover-effect"
          >
            <div>
              <p className="font-semibold">{place.name}</p>
              {place.district && (
                <p className="text-sm text-gray-500">{place.district}</p>
              )}
            </div>
            <div className="flex space-x-2 flex-shrink-0">
              <Button
                onClick={() => onEditPlace(place.id)}
                variant="outlined"
                size="small"
                className="w-auto px-3 py-1 text-xs"
              >
                수정
              </Button>
              <Button
                onClick={() => onDeletePlace(place.id)}
                variant="outlined"
                size="small"
                className="w-auto px-3 py-1 text-xs"
              >
                삭제
              </Button>
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-500 text-center py-10">등록한 장소가 없습니다.</p>
    );
  }

  return routes.length > 0 ? (
    <ul className="space-y-3">
      {routes.map((route) => {
        const districtName = route.districtId
          ? SEOUL_DISTRICTS.find((d) => d.id === route.districtId)?.name
          : null;
        const isRouteExpanded = expandedRouteId === route.id;

        return (
          <li
            key={route.id}
            className={cn(
              'bg-white rounded-lg shadow-md p-4 cursor-pointer card-hover-effect',
              isRouteExpanded
                ? 'shadow-lg ring-2 ring-primary-500'
                : 'hover:bg-gray-50',
            )}
            onClick={() => handleRouteClick(route.id)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-lg">{route.name}</p>
                {districtName && (
                  <p className="text-sm text-gray-500">{districtName}</p>
                )}
              </div>
              <div className="flex space-x-2 flex-shrink-0">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (handleToggleIsRepresentative) {
                      handleToggleIsRepresentative(
                        route.id,
                        !route.isRepresentative,
                      );
                    }
                  }}
                  variant="outlined"
                  size="small"
                  className={cn(
                    'w-auto px-3 py-1 text-xs',
                    route.isRepresentative
                      ? 'text-primary-500 border-primary-500'
                      : 'text-gray-400 border-gray-400 hover:text-primary-400 hover:border-primary-400',
                  )}
                  disabled={toggleRepresentativeMutation.isPending}
                >
                  📌
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditRoute(route.id);
                  }}
                  variant="outlined"
                  size="small"
                  className="w-auto px-3 py-1 text-xs"
                >
                  수정
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteRoute(route.id);
                  }}
                  variant="outlined"
                  size="small"
                  className="w-auto px-3 py-1 text-xs"
                >
                  삭제
                </Button>
              </div>
            </div>

            {isRouteExpanded && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                {isLoadingRouteDetails ? (
                  <p className="text-gray-500">
                    루트 상세 정보를 불러오는 중...
                  </p>
                ) : detailedRoute?.places && detailedRoute.places.length > 0 ? (
                  <ul className="space-y-3">
                    {detailedRoute.places.map((routePlace) => {
                      const isRoutePlaceExpanded =
                        expandedRoutePlaceId === routePlace.id;
                      const hasAlternatives =
                        routePlace.alternatives &&
                        routePlace.alternatives.length > 0;
                      const canAddAlternative =
                        routePlace.alternatives.length < 3;
                      const isHovered = hoveredRoutePlaceId === routePlace.id;

                      return (
                        <li
                          key={routePlace.id}
                          className={cn(
                            'bg-gray-50 rounded-lg p-3 transition-all duration-200 relative overflow-hidden',
                            isRoutePlaceExpanded
                              ? 'shadow-md ring-1 ring-blue-400'
                              : 'hover:bg-gray-100',
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRoutePlaceClick(routePlace.id);
                          }}
                          onMouseEnter={() =>
                            setHoveredRoutePlaceId(routePlace.id)
                          }
                          onMouseLeave={() => setHoveredRoutePlaceId(null)}
                        >
                          <div className="flex items-center">
                            <div className="flex-grow pr-24">
                              <p className="font-medium">
                                {routePlace.place.name}
                              </p>
                              <span
                                className={cn(
                                  'text-xs font-medium px-2 py-0.5 rounded-full',
                                  routeStopLabelMap[routePlace.label].className,
                                )}
                              >
                                {routeStopLabelMap[routePlace.label].text}
                              </span>
                            </div>
                          </div>
                          <div
                            className={cn(
                              'absolute right-3 top-3 transition-opacity duration-200',
                              isHovered ? 'opacity-100' : 'opacity-0',
                            )}
                          >
                            {canAddAlternative ? (
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenAddAlternativeModal(
                                    route.id,
                                    routePlace.id,
                                    routePlace.place,
                                    routePlace.alternatives,
                                  );
                                }}
                                size="small"
                                className="w-auto px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600"
                              >
                                예비 장소 추가
                              </Button>
                            ) : (
                              <span className="text-xs text-gray-500">
                                (최대 3개)
                              </span>
                            )}
                          </div>

                          {isRoutePlaceExpanded && (
                            <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                              <div className="flex justify-between items-center">
                                <p className="text-sm font-semibold">
                                  예비 장소:
                                </p>
                              </div>
                              {hasAlternatives &&
                                routePlace.alternatives.map((alt) => (
                                  <div
                                    key={alt.id}
                                    className="flex items-center justify-between bg-white p-2 rounded-md shadow-sm"
                                  >
                                    <p className="text-sm">
                                      {alt.place.name} ({alt.explanation})
                                    </p>
                                    <div className="flex space-x-1">
                                      <Button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenEditAlternativeModal(
                                            route.id,
                                            routePlace.id,
                                            alt,
                                          );
                                        }}
                                        variant="outlined"
                                        size="small"
                                        className="w-auto px-2 py-1 text-xs"
                                      >
                                        수정
                                      </Button>
                                      <Button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteAlternative(
                                            route.id,
                                            routePlace.id,
                                            alt.id,
                                          );
                                        }}
                                        variant="outlined"
                                        size="small"
                                        className="w-auto px-2 py-1 text-xs text-red-600 border-red-600 hover:bg-red-50"
                                      >
                                        삭제
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    등록된 경유지 장소가 없습니다.
                  </p>
                )}
              </div>
            )}
          </li>
        );
      })}
      {addAlternativeModalState && (
        <AddAlternativeModal
          isOpen={addAlternativeModalState.isOpen}
          onClose={handleCloseAddAlternativeModal}
          routeId={addAlternativeModalState.routeId}
          routePlaceId={addAlternativeModalState.routePlaceId}
          originalPlace={addAlternativeModalState.originalPlace}
          existingAlternatives={addAlternativeModalState.existingAlternatives}
          onAlternativeAdded={handleAlternativeAddedOrUpdated}
        />
      )}
      {editAlternativeModalState && (
        <EditAlternativeModal
          isOpen={editAlternativeModalState.isOpen}
          onClose={handleCloseEditAlternativeModal}
          routeId={editAlternativeModalState.routeId}
          routePlaceId={editAlternativeModalState.routePlaceId}
          alternative={editAlternativeModalState.alternative}
          onAlternativeUpdated={handleAlternativeAddedOrUpdated}
        />
      )}
    </ul>
  ) : (
    <p className="text-gray-500 text-center py-10">등록한 루트가 없습니다.</p>
  );
}
