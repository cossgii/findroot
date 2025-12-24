'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '~/src/utils/class-name';
import PurposeSelectionOverlay from './PurposeSelectionOverlay';
import { RoutePurpose } from '@prisma/client';

interface DistrictViewToggleProps {
  districtId: string;
}

export default function DistrictViewToggle({
  districtId,
}: DistrictViewToggleProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  const isRouteView = pathname.includes('/routes');

  const baseStyles =
    'px-4 py-2 text-sm font-medium rounded-md transition-colors';
  const activeStyles = 'bg-primary-600 text-white';
  const inactiveStyles =
    'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300';

  const handleSelectPurpose = (purpose: Exclude<RoutePurpose, 'ENTIRE'>) => {
    setIsOverlayOpen(false);
    router.push(`/districts/${districtId}/routes?purpose=${purpose}`);
  };

  return (
    <>
      <div className="flex space-x-2">
        <Link
          href={`/districts/${districtId}`}
          className={cn(baseStyles, !isRouteView ? activeStyles : inactiveStyles)}
        >
          장소
        </Link>
        <button
          type="button"
          onClick={() => setIsOverlayOpen(true)}
          className={cn(baseStyles, isRouteView ? activeStyles : inactiveStyles)}
        >
          루트
        </button>
      </div>
      <PurposeSelectionOverlay
        isOpen={isOverlayOpen}
        onClose={() => setIsOverlayOpen(false)}
        onSelectPurpose={handleSelectPurpose}
      />
    </>
  );
}
