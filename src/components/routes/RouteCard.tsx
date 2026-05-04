'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { RouteWithLikeData } from '~/src/types/restaurant';
import LikeButton from '~/src/components/common/LikeButton';

interface RouteCardProps {
  route: RouteWithLikeData;
}

export default function RouteCard({ route }: RouteCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden card-hover-effect h-full flex flex-col">
      <Link href={`/routes/${route.id}`} className="block flex-grow">
        <div className="relative h-48 w-full bg-gray-200">
          <Image
            src={`/api/routes/${route.id}/image`}
            alt={route.name}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
        <div className="p-4">
          <h3 className="text-xl font-semibold text-gray-800 line-clamp-1">
            {route.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 mt-2">
            {route.description}
          </p>
        </div>
      </Link>
      <div className="px-4 pb-3 flex items-center justify-between">
        <span className="text-sm text-gray-500">💬 {route.commentsCount}</span>
        <LikeButton
          routeId={route.id}
          initialIsLiked={route.isLiked}
          initialLikesCount={route.likesCount}
        />
      </div>
    </div>
  );
}
