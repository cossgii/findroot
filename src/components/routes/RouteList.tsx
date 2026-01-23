'use client';

import React from 'react';
import RouteCard from './RouteCard';
import Pagination from '~/src/components/common/Pagination';
import { ClientRoute } from '~/src/types/shared';

interface RouteListProps {
  routes: ClientRoute[];
  districtName: string;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export default function RouteList({
  routes,
  districtName,
  totalPages,
  currentPage,
  onPageChange,
}: RouteListProps) {
  if (routes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>{districtName}에 등록된 루트가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {routes.map((route) => (
          <RouteCard key={route.id} route={route} />
        ))}
      </div>
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
