'use client';

import Dropdown from '~/src/components/common/Dropdown';
import { SEOUL_DISTRICTS } from '~/src/utils/districts';

type District = (typeof SEOUL_DISTRICTS)[0];

interface DistrictDropdownProps {
  value: string;
  onChange: (districtId: string) => void;
  className?: string;
}

export default function DistrictDropdown({
  value,
  onChange,
  className,
}: DistrictDropdownProps) {
  const selectedDistrict = SEOUL_DISTRICTS.find((d) => d.id === value);

  return (
    <div className={className}>
      <Dropdown<District>
        options={SEOUL_DISTRICTS}
        value={selectedDistrict || SEOUL_DISTRICTS[0]}
        onChange={(district) => onChange(district.id)}
        getOptionLabel={(district) => district.name}
        contentClassName="max-h-60 overflow-y-auto"
      />
    </div>
  );
}
