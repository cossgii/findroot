// src/components/navigation/district-select-dropdown.tsx
'use client';

import Link from 'next/link';
import Button from '~/src/components/common/button';
import Dropdown from '~/src/components/common/dropdown';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';

export default function DistrictSelectDropdown() {
  return (
    <Dropdown
      trigger={
        <Button variant="outlined" size="small" className="w-auto px-4">
          자치구 선택
        </Button>
      }
      contentClassName="max-h-60 overflow-y-auto"
    >
      {SEOUL_DISTRICTS.map((district) => (
        <Link
          key={district.id}
          href={district.id === 'all' ? '/districts' : `/districts/${district.id}`}
          passHref
        >
          <div className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
            {district.name}
          </div>
        </Link>
      ))}
    </Dropdown>
  );
}