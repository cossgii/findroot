'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '~/src/utils/class-name';

interface DistrictViewToggleProps {
  districtId: string;
}

export default function DistrictViewToggle({
  districtId,
}: DistrictViewToggleProps) {
  const pathname = usePathname();
  const isRouteView = pathname.includes('/routes');

  const baseStyles =
    'px-4 py-2 text-sm font-medium rounded-md transition-colors';
  const activeStyles = 'bg-primary-600 text-white';
  const inactiveStyles =
    'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300';

  return (
    <div className="flex space-x-2">
      <Link
        href={`/districts/${districtId}`}
        className={cn(baseStyles, !isRouteView ? activeStyles : inactiveStyles)}
      >
        장소
      </Link>
      <Link
        href={`/districts/${districtId}/routes`}
        className={cn(baseStyles, isRouteView ? activeStyles : inactiveStyles)}
      >
        루트
      </Link>
    </div>
  );
}
