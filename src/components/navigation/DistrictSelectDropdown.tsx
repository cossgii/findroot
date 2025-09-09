'use client';

import Dropdown from '~/src/components/common/Dropdown';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';

type District = (typeof SEOUL_DISTRICTS)[0];

interface DistrictDropdownProps {
  value: string;
  onChange: (districtId: string) => void;
  className?: string;
  showAll?: boolean;
}

export default function DistrictDropdown({
  value,
  onChange,
  className,
  showAll = true,
}: DistrictDropdownProps) {
  const districtOptions = showAll
    ? SEOUL_DISTRICTS
    : SEOUL_DISTRICTS.filter((d) => d.id !== 'all');
  const selectedDistrict = districtOptions.find((d) => d.id === value);

  return (
    <div className={className}>
      <Dropdown<District>
        options={districtOptions}
        value={selectedDistrict || districtOptions[0]}
        onChange={(district) => onChange(district.id)}
        getOptionLabel={(district) => district.name}
        contentClassName="max-h-60 overflow-y-auto"
      />
    </div>
  );
}
