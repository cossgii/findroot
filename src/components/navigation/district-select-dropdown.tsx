'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Dropdown, { DropdownItem } from '~/src/components/common/dropdown';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';
import { cn } from '~/src/utils/class-name';

export default function DistrictSelectDropdown() {
  const pathname = usePathname();
  const [selectedDistrictName, setSelectedDistrictName] =
    useState('자치구 선택');

  useEffect(() => {
    const currentDistrictId = pathname.split('/').pop();
    const foundDistrict = SEOUL_DISTRICTS.find(
      (district) => district.id === currentDistrictId,
    );
    if (foundDistrict) {
      setSelectedDistrictName(foundDistrict.name);
    } else if (pathname === '/districts') {
      setSelectedDistrictName('전체');
    } else {
      setSelectedDistrictName('자치구 선택');
    }
  }, [pathname]);

  return (
    <Dropdown
      trigger={
        <div
          className={cn(
            'flex items-center justify-between px-4 py-2 border border-gray-300 rounded-md cursor-pointer',
            'min-w-[120px] text-sm text-gray-700 hover:bg-gray-50',
          )}
        >
          <span>{selectedDistrictName}</span>
          <svg
            className="w-4 h-4 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </div>
      }
      contentClassName="max-h-60 overflow-y-auto"
    >
      {SEOUL_DISTRICTS.map((district) => (
        <Link
          key={district.id}
          href={
            district.id === 'all' ? '/districts' : `/districts/${district.id}`
          }
          passHref
        >
          <DropdownItem>{district.name}</DropdownItem>
        </Link>
      ))}
    </Dropdown>
  );
}
