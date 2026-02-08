'use client';

import Dropdown from '~/src/components/common/Dropdown';
import { RoutePurpose } from '@prisma/client';
import { PURPOSE_OPTIONS } from '@/constants/purpose';

interface PurposeOption {
  id: RoutePurpose;
  name: string;
}

interface PurposeDropdownProps {
  currentPurpose: RoutePurpose | undefined;
  onPurposeChange: (purposeOption: RoutePurpose) => void;
  maxVisibleItems?: number;
}

export default function PurposeDropdown({
  currentPurpose,
  onPurposeChange,
  maxVisibleItems,
}: PurposeDropdownProps) {
  const selectedOption = PURPOSE_OPTIONS.find(
    (option) => option.id === currentPurpose,
  );

  return (
    <div className="my-4 flex justify-end">
      <Dropdown<PurposeOption>
        options={PURPOSE_OPTIONS}
        value={selectedOption}
        onChange={(option) => onPurposeChange(option.id)}
        getOptionLabel={(option) => option.name}
        placeholder="목적 선택"
        maxVisibleItems={maxVisibleItems}
      />
    </div>
  );
}
