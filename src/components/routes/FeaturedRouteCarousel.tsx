'use client';

import React, { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RouteWithLikeData } from '~/src/types/restaurant';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { RoutePurpose } from '@prisma/client';

interface FeaturedRouteCarouselProps {
  districtId: string;
  creatorId?: string;
  purpose?: RoutePurpose;
}

export default function FeaturedRouteCarousel({
  districtId,
  creatorId,
  purpose,
}: FeaturedRouteCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['featuredRoutes', districtId, creatorId, purpose],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('districtId', districtId);
      if (creatorId) {
        params.set('creatorId', creatorId);
      }
      if (purpose) {
        params.set('purpose', purpose);
      }

      const response = await fetch(`/api/routes/featured?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch featured routes');
      }
      return response.json();
    },
    enabled: !!districtId,
  });

  const routes: RouteWithLikeData[] = data?.routes || [];
  const type = data?.type;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.offsetWidth;
      if (direction === 'left') {
        scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
        <p className="text-gray-500">대표 루트 불러오는 중...</p>
      </div>
    );
  }

  if (isError || !routes || routes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
        <p className="text-gray-500">대표 루트가 없습니다.</p>
      </div>
    );
  }

  const getLabel = () => {
    if (type === 'creator_fallback') {
      return '(인기 루트)';
    }
    if (type === 'creator_representative_overall') {
      return '(전체 대표 루트)';
    }
    return '(대표 루트)';
  };

  return (
    <div className="relative w-full h-full">
      <h2 className="text-xl font-bold mb-2 px-4">대표 루트 {getLabel()}</h2>
      <div
        ref={scrollRef}
        className="flex overflow-x-scroll snap-x snap-mandatory scroll-hidden-bar h-full"
      >
        {routes.map((route) => (
          <div
            key={route.id}
            className="flex-none w-full md:w-1/2 lg:w-1/3 xl:w-1/4 snap-center p-2"
          >
            <Link href={`/routes/${route.id}`} className="block h-full">
              <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col">
                <div className="relative h-40 w-full bg-gray-200">
                  <Image
                    src={`/api/routes/${route.id}/image`}
                    alt={route.name}
                    fill
                    className="object-cover"
                    unoptimized
                    priority
                  />
                </div>
                <div className="p-4 flex-grow">
                  <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
                    {route.name}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                    {route.description}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 mt-2">
                    <span>❤️ {route.likesCount}</span>
                    <span className="ml-4">💬 {route.commentsCount}</span>{' '}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
      {routes.length > 1 && (
        <>
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md ml-2 z-10"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md mr-2 z-10"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}
    </div>
  );
}
