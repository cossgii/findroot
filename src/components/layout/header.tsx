'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // Import useRouter

import { cn } from '~/src/utils/class-name';
import DistrictDropdown from '~/src/components/navigation/district-select-dropdown'; // Renamed
import AuthHeaderControls from '~/src/components/auth/auth-header-controls';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter(); // Initialize router

  // Get current district from pathname
  const pathSegments = pathname.split('/');
  const districtId = pathSegments[1] === 'districts' ? pathSegments[2] || 'all' : 'all';

  // Define onChange handler for the dropdown
  const handleDistrictChange = (newDistrictId: string) => {
    if (newDistrictId === 'all') {
      router.push('/districts');
    } else {
      router.push(`/districts/${newDistrictId}`);
    }
  };

  // 특정 페이지에서는 자치구 드롭다운을 숨깁니다.
  const hideDistrictDropdown = ['/', '/login', '/signup', '/mypage', '/forgot-password', '/reset-password'].includes(pathname);
  const showDistrictDropdown = !hideDistrictDropdown;

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50',
        'flex items-center justify-between',
        'h-header px-4 tablet:px-6 desktop:px-[6.25rem]',
        'bg-white shadow-sm',
      )}
    >
      <Link href="/">
        <h1 className="text-xl font-bold">FindRoot</h1>
      </Link>
      <nav className="flex items-center space-x-4">
        {showDistrictDropdown && (
          <DistrictDropdown
            value={districtId}
            onChange={handleDistrictChange}
          />
        )}
        <AuthHeaderControls />
      </nav>
    </header>
  );
}