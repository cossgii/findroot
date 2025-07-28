import React from 'react';
import { Restaurant } from '~/src/types/restaurant';

interface RestaurantDetailModalContentProps {
  restaurant: Restaurant;
}

export default function RestaurantDetailModalContent({
  restaurant,
}: RestaurantDetailModalContentProps) {
  // 임시 리뷰 및 링크 데이터 (실제로는 API에서 가져올 것)
  const mockReview = `이곳은 ${restaurant.name}에 대한 저의 솔직한 리뷰입니다. 분위기가 정말 좋고, ${restaurant.category === 'cafe' ? '커피 맛이 일품' : '음식이 환상적'}이었어요. 특히 ${restaurant.address} 근처에 있어서 접근성도 좋았습니다.`;
  const mockLink = `https://search.naver.com/search.naver?query=${restaurant.name} ${restaurant.address}`;

  return (
    <div className="p-6">
      <h3 className="text-2xl font-bold mb-4">{restaurant.name}</h3>
      <p className="text-gray-600 mb-2">주소: {restaurant.address}</p>
      {restaurant.district && (
        <p className="text-gray-500 mb-4">자치구: {restaurant.district}</p>
      )}

      <div className="mb-6">
        <h4 className="text-xl font-semibold mb-2">리뷰</h4>
        <p className="text-gray-700 leading-relaxed">{mockReview}</p>
      </div>

      <div>
        <h4 className="text-xl font-semibold mb-2">참고 링크</h4>
        <a
          href={mockLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          네이버 검색 결과 보기
        </a>
      </div>
    </div>
  );
}
