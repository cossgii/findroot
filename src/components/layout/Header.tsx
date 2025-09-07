'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '~/src/utils/class-name';
import DistrictDropdown from '~/src/components/navigation/DistrictSelectDropdown';
import AuthHeaderControls from '~/src/components/auth/AuthHeaderControls';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const pathSegments = pathname.split('/');
  const districtId =
    pathSegments[1] === 'districts' ? pathSegments[2] || 'all' : 'all';
  const handleDistrictChange = (newDistrictId: string) => {
    if (newDistrictId === 'all') {
      router.push('/districts');
    } else {
      router.push(`/districts/${newDistrictId}`);
    }
  };

  const hideDistrictDropdown = [
    '/',
    '/login',
    '/signup',
    '/mypage',
    '/forgot-password',
    '/reset-password',
  ].includes(pathname);
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
