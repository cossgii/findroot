'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '~/src/utils/class-name';
import DistrictSelectDropdown from '~/src/components/navigation/district-select-dropdown'; // 새 컴포넌트 임포트
import AuthHeaderControls from '~/src/components/auth/auth-header-controls'; // 새 컴포넌트 임포트

export default function Header() {
  const pathname = usePathname();

  // 특정 페이지에서는 자치구 드롭다운을 숨깁니다.
  const hideDistrictDropdown = ['/', '/login', '/signup'].includes(pathname);
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
        {showDistrictDropdown && <DistrictSelectDropdown />}
        <AuthHeaderControls />
      </nav>
    </header>
  );
}

