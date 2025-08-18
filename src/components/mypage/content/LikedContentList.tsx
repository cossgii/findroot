'use client';

import { type MyPageSubTab } from '../MyPageTabs';
import { LikedPlace, MyLikedRoute } from '~/src/hooks/useMyPageData';

interface LikedContentListProps {
  activeSubTab: MyPageSubTab;
  likedPlaces: LikedPlace[];
  likedRoutes: MyLikedRoute[];
}

export default function LikedContentList({
  activeSubTab,
  likedPlaces,
  likedRoutes,
}: LikedContentListProps) {
  if (activeSubTab === 'places') {
    return likedPlaces.length > 0 ? (
      <ul className="space-y-3">
        {likedPlaces.map((like) => (
          <li key={like.id} className="bg-white rounded-lg shadow-md p-4">
            <p className="font-semibold">{like.place?.name}</p>
            <p className="text-sm text-gray-500">{like.place?.address}</p>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-500 text-center py-10">
        좋아요를 누른 장소가 없습니다.
      </p>
    );
  }

  return likedRoutes.length > 0 ? (
    <ul className="space-y-3">
      {likedRoutes.map((like) => (
        <li key={like.id} className="bg-white rounded-lg shadow-md p-4">
          <p className="font-semibold">{like.route?.name}</p>
          <p className="text-sm text-gray-500">{like.route?.description}</p>
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-gray-500 text-center py-10">
      좋아요를 누른 루트가 없습니다.
    </p>
  );
}
