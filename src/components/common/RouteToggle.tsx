'use client';

import React from 'react';
import { cn } from '~/src/utils/class-name';
import { RouteView } from '~/src/stores/app-store';

interface RouteToggleProps {
  routeView: RouteView;
  onToggleClick: (view: RouteView) => void;
}

export default function RouteToggle({
  routeView,
  onToggleClick,
}: RouteToggleProps) {
  return (
    <div className="flex items-center justify-center p-2 bg-gray-100 rounded-full shadow-inner dark:bg-gray-700">
      <button
        onClick={() => onToggleClick('districts')}
        className={cn(
          'px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200',
          routeView === 'districts'
            ? 'bg-primary-500 text-white shadow dark:bg-primary-400'
            : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-600',
        )}
      >
        장소
      </button>
      <button
        onClick={() => onToggleClick('routes')}
        className={cn(
          'px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200',
          routeView === 'routes'
            ? 'bg-primary-500 text-white shadow dark:bg-primary-400'
            : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-600',
        )}
      >
        루트
      </button>
    </div>
  );
}
