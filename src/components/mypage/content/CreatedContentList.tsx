'use client';

import { Place, Route } from '@prisma/client';
import Button from '~/src/components/common/button';
import { type MyPageSubTab } from '../MyPageTabs';

interface CreatedContentListProps {
  activeSubTab: MyPageSubTab;
  places: Place[];
  routes: Route[];
  onEditPlace: (id: string) => void;
  onDeletePlace: (id: string) => void;
  onEditRoute: (id: string) => void;
  onDeleteRoute: (id: string) => void;
}

export default function CreatedContentList({
  activeSubTab,
  places,
  routes,
  onEditPlace,
  onDeletePlace,
  onEditRoute,
  onDeleteRoute,
}: CreatedContentListProps) {
  if (activeSubTab === 'places') {
    return places.length > 0 ? (
      <ul className="space-y-3">
        {places.map((place) => (
          <li
            key={place.id}
            className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between"
          >
            <div>
              <p className="font-semibold">{place.name}</p>
              <p className="text-sm text-gray-500">{place.address}</p>
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
      {routes.map((route) => (
        <li
          key={route.id}
          className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between"
        >
          <div>
            <p className="font-semibold">{route.name}</p>
            <p className="text-sm text-gray-500">{route.description}</p>
          </div>
          <div className="flex space-x-2 flex-shrink-0">
            <Button
              onClick={() => onEditRoute(route.id)}
              variant="outlined"
              size="small"
              className="w-auto px-3 py-1 text-xs"
            >
              수정
            </Button>
            <Button
              onClick={() => onDeleteRoute(route.id)}
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
    <p className="text-gray-500 text-center py-10">등록한 루트가 없습니다.</p>
  );
}
