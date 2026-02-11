'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useAtomValue, useAtom } from 'jotai';
import { contentCreatorAtom, selectedDistrictFilterAtom } from '~/src/stores/app-store';
import { cn } from '~/src/utils/class-name';
import DistrictDropdown from '~/src/components/navigation/DistrictSelectDropdown';
import AuthHeaderControls from '~/src/components/auth/AuthHeaderControls';
import FollowerSelectionPanel from './FollowerSelectionPanel';
import { useSession } from 'next-auth/react';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const contentCreator = useAtomValue(contentCreatorAtom);
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useAtom(selectedDistrictFilterAtom);

  const pathSegments = pathname.split('/');
  const currentPathIsDistrictPage = pathSegments[1] === 'districts';

  const handleDistrictChange = (newDistrictId: string) => {
    setSelectedDistrictFilter(newDistrictId);

    if (currentPathIsDistrictPage) {
      const newPath = `/districts/${newDistrictId}`;
      const newSearchParams = new URLSearchParams(searchParams.toString());
      router.push(`${newPath}?${newSearchParams.toString()}`);
    } else if (pathname === '/') {
      if (newDistrictId === 'all') {
        router.push('/districts');
      } else {
        router.push(`/districts/${newDistrictId}`);
      }
    }
  };

  const hideDistrictDropdown = [
    '/login',
    '/signup',
    '/mypage',
    '/forgot-password',
    '/reset-password',
    '/routes/[routeId]',
  ].some(path => pathname.startsWith(path.replace(/\[.*?\]/, '')));
  const showDistrictDropdown = !hideDistrictDropdown;

  const creatorName =
    contentCreator.type === 'user'
      ? contentCreator.userName
      : contentCreator.type === 'me'
        ? '내 콘텐츠'
        : '추천';

  let dropdownValue = selectedDistrictFilter;
  if (currentPathIsDistrictPage) {
    dropdownValue = pathSegments[2] || 'all';
  }

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-30',
          'flex items-center justify-between',
          'h-header px-4 tablet:px-6 desktop:px-[6.25rem]',
          'bg-white shadow-sm',
        )}
      >
        <div className="flex items-center gap-4">
          <Link href="/">
            <h1 className="text-xl font-bold">FindRoot</h1>
          </Link>
          {session && showDistrictDropdown && (
            <button
              onClick={() => setIsPanelOpen(true)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
            >
              보기: <span className="font-semibold">{creatorName}</span>
            </button>
          )}
        </div>
        <nav className="flex items-center space-x-4">
          {showDistrictDropdown && (
            <DistrictDropdown
              value={dropdownValue}
              onChange={handleDistrictChange}
              triggerClassName="w-[100px] min-w-0"
              maxVisibleItems={5}
            />
          )}
          <AuthHeaderControls />
        </nav>
      </header>
      {session && (
        <FollowerSelectionPanel
          isOpen={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
        />
      )}
    </>
  );
}
