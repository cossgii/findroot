import { BookOpen, MapPin, Link as LinkIcon } from 'lucide-react';
import LikeButton from '~/src/components/common/LikeButton';
import { Restaurant } from '~/src/types/restaurant';

interface RestaurantDetailModalContentProps {
  restaurant: Restaurant;
}

export default function RestaurantDetailModalContent({
  restaurant,
}: RestaurantDetailModalContentProps) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <h3 className="text-2xl font-bold text-gray-800">{restaurant.name}</h3>
        <div className="flex-shrink-0">
          <LikeButton
            placeId={restaurant.id}
            initialIsLiked={restaurant.isLiked}
            initialLikesCount={restaurant.likesCount}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <MapPin className="text-gray-400 h-4 w-4" />
            <p className="text-sm font-semibold text-gray-600">주소</p>
          </div>
          <p className="text-base text-gray-800 pl-6">{restaurant.address}</p>
          {restaurant.district && (
            <p className="text-sm text-gray-500 pl-6 mt-1">
              {restaurant.district}
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200" />

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <BookOpen className="text-gray-400 h-4 w-4" />
          <h4 className="text-lg font-semibold text-gray-700">리뷰</h4>
        </div>
        <p className="text-base text-gray-700 leading-relaxed pl-6">
          {restaurant.description || '리뷰가 없습니다.'}
        </p>
      </div>

      <div className="border-t border-gray-200" />

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <LinkIcon className="text-gray-400 h-4 w-4" />
          <h4 className="text-lg font-semibold text-gray-700">참고 링크</h4>
        </div>
        <div className="pl-6">
          {restaurant.link ? (
            <a
              href={
                restaurant.link.startsWith('http://') ||
                restaurant.link.startsWith('https://')
                  ? restaurant.link
                  : `https://${restaurant.link}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline hover:text-primary-700"
            >
              유저 공유 링크
            </a>
          ) : (
            <a
              href={`https://map.kakao.com/?q=${restaurant.name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline hover:text-primary-700"
            >
              카카오맵에서 보기
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
