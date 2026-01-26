'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { RouteWithLikeData } from '~/src/types/restaurant';

interface RouteCardProps {
  route: RouteWithLikeData;
}

export default function RouteCard({ route }: RouteCardProps) {
  return (
    <Link href={`/routes/${route.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden card-hover-effect h-full flex flex-col">
        <div className="relative h-48 w-full bg-gray-200">
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
          <h3 className="text-xl font-semibold text-gray-800 line-clamp-1">
            {route.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 mt-2">
            {route.description}
          </p>
          <div className="flex items-center text-sm text-gray-500 mt-3">
            <span>❤️ {route.likesCount}</span>
            <span className="ml-4">💬 {route.commentsCount}</span>{' '}
          </div>
        </div>
      </div>
    </Link>
  );
}
