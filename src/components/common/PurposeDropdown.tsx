'use client';

import Dropdown from '~/src/components/common/Dropdown';
import { RoutePurpose } from '@prisma/client';

interface PurposeOption {
  id: RoutePurpose;
  name: string;
}

const purposeOptions: readonly PurposeOption[] = [
  { id: 'ENTIRE', name: '전체' },
  { id: 'FAMILY', name: '가족' },
  { id: 'GATHERING', name: '모임' },
  { id: 'SOLO', name: '나홀로' },
  { id: 'COUPLE', name: '커플' },
];

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
  const selectedOption = purposeOptions.find(
    (option) => option.id === currentPurpose,
  );

  return (
    <div className="my-4 flex justify-end">
      <Dropdown<PurposeOption>
        options={purposeOptions}
        value={selectedOption}
        onChange={(option) => onPurposeChange(option.id)}
        getOptionLabel={(option) => option.name}
        placeholder="목적 선택"
        maxVisibleItems={maxVisibleItems}
      />
    </div>
  );
}
