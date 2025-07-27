'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useState } from 'react'; // useState 임포트

import { cn } from '~/src/utils/class-name';
import Button from '~/src/components/common/button';
import { SEOUL_DISTRICTS } from '~/src/utils/districts'; // districts 데이터 임포트

export default function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // 드롭다운 상태 관리

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

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
        {/* 자치구 선택 드롭다운 */}
        <div className="relative">
          <Button
            onClick={toggleDropdown}
            variant="outlined"
            size="small"
            className="w-auto px-4" // 버튼 너비 자동 조절
          >
            자치구 선택
          </Button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
              {SEOUL_DISTRICTS.map((district) => (
                <Link
                  key={district.id}
                  href={district.id === 'all' ? '/districts' : `/districts/${district.id}`}
                  passHref
                >
                  <div
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    onClick={() => setIsDropdownOpen(false)} // 클릭 시 드롭다운 닫기
                  >
                    {district.name}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {status === 'loading' ? (
          <div className="animate-pulse w-24 h-6 bg-gray-200 rounded"></div>
        ) : session ? (
          <div className="flex items-center space-x-4">
            <span className="font-medium">
              {session.user?.name || session.user?.email}님
            </span>
            <Button onClick={() => signOut()} variant="outlined" size="small">
              로그아웃
            </Button>
          </div>
        ) : (
          !isAuthPage && (
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="outlined" size="small">
                  로그인
                </Button>
              </Link>
            </div>
          )
        )}
      </nav>
    </header>
  );
}

