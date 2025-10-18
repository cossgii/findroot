import LikeButton from '~/src/components/common/LikeButton';
import { Restaurant } from '~/src/types/restaurant';

interface RestaurantDetailModalContentProps {
  restaurant: Restaurant;
}

export default function RestaurantDetailModalContent({
  restaurant,
}: RestaurantDetailModalContentProps) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-2xl font-bold flex-grow pr-4">{restaurant.name}</h3>
      </div>

      <p className="text-gray-600 mb-2">주소: {restaurant.address}</p>
      {restaurant.district && (
        <p className="text-gray-500 mb-4">자치구: {restaurant.district}</p>
      )}

      <div className="mb-6">
        <h4 className="text-xl font-semibold mb-2">리뷰</h4>
        <p className="text-gray-700 leading-relaxed">
          {restaurant.description || '리뷰가 없습니다.'}
        </p>
      </div>

      <div>
        <h4 className="text-xl font-semibold mb-2">참고 링크</h4>
        <div className="flex justify-between items-center">
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
              className="text-blue-600 hover:underline"
            >
              유저 공유 링크
            </a>
          ) : (
            <a
              href={`https://map.kakao.com/?q=${restaurant.name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              카카오맵에서 보기
            </a>
          )}
          <LikeButton
            placeId={restaurant.id}
            initialIsLiked={restaurant.isLiked}
            initialLikesCount={restaurant.likesCount}
          />
        </div>
      </div>
    </div>
  );
}
