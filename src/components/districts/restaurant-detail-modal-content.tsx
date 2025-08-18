import React, { useState, useEffect } from 'react';
import { Place } from '@prisma/client';
import { useSession } from 'next-auth/react';
import Button from '~/src/components/common/button';

interface RestaurantDetailModalContentProps {
  restaurant: Place;
}

export default function RestaurantDetailModalContent({
  restaurant,
}: RestaurantDetailModalContentProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const mockLink = `https://search.naver.com/search.naver?query=${restaurant.name} ${restaurant.address}`;

  useEffect(() => {
    if (userId && restaurant.id) {
      // 좋아요 상태 및 개수 가져오기
      const fetchLikeStatus = async () => {
        try {
          const [statusRes, countRes] = await Promise.all([
            fetch(
              `/api/likes/status?userId=${userId}&placeId=${restaurant.id}`,
            ),
            fetch(`/api/likes/count?placeId=${restaurant.id}`),
          ]);

          if (statusRes.ok) {
            const { liked } = await statusRes.json();
            setIsLiked(liked);
          }
          if (countRes.ok) {
            const { count } = await countRes.json();
            setLikesCount(count);
          }
        } catch (error) {
          console.error('Error fetching like status/count:', error);
        }
      };
      fetchLikeStatus();
    }
  }, [userId, restaurant.id]);

  const handleLikeToggle = async () => {
    if (!userId) {
      alert('로그인 후 이용해주세요.');
      return;
    }

    try {
      const method = isLiked ? 'DELETE' : 'POST';
      const response = await fetch('/api/likes', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ placeId: restaurant.id }),
      });

      if (response.ok) {
        setIsLiked(!isLiked);
        setLikesCount((prevCount) => (isLiked ? prevCount - 1 : prevCount + 1));
      } else {
        const errorData = await response.json();
        alert(`좋아요 처리 실패: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('좋아요 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="p-6">
      <h3 className="text-2xl font-bold mb-4">{restaurant.name}</h3>
      <p className="text-gray-600 mb-2">주소: {restaurant.address}</p>
      {restaurant.district && (
        <p className="text-gray-500 mb-4">자치구: {restaurant.district}</p>
      )}

      <div className="flex items-center mb-4">
        <Button
          onClick={handleLikeToggle}
          disabled={!userId} // 로그인하지 않은 경우 비활성화
          className="mr-2"
        >
          {isLiked ? '좋아요 취소' : '좋아요'}
        </Button>
        <span>좋아요 {likesCount}개</span>
      </div>

      <div className="mb-6">
        <h4 className="text-xl font-semibold mb-2">리뷰</h4>
        <p className="text-gray-700 leading-relaxed">{restaurant.description || '리뷰가 없습니다.'}</p>
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
