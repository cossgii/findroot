'use client';

import Dropdown from '~/src/components/common/Dropdown';
import { PURPOSE_OPTIONS_WITH_ALL, type PurposeSelection } from '@/constants/purpose';

interface PurposeOption {
  id: PurposeSelection;
  name: string;
}

interface PurposeDropdownProps {
  currentPurpose: PurposeSelection | undefined;
  onPurposeChange: (purpose: PurposeSelection) => void;
  maxVisibleItems?: number;
}

export default function PurposeDropdown({
  currentPurpose,
  onPurposeChange,
  maxVisibleItems,
}: PurposeDropdownProps) {
  const selectedOption = PURPOSE_OPTIONS_WITH_ALL.find(
    (option) => option.id === currentPurpose,
  );

  return (
    <div className="my-4 flex justify-end">
      <Dropdown<PurposeOption>
        options={PURPOSE_OPTIONS_WITH_ALL}
        value={selectedOption}
        onChange={(option) => onPurposeChange(option.id)}
        getOptionLabel={(option) => option.name}
        placeholder="목적 선택"
        maxVisibleItems={maxVisibleItems}
      />
    </div>
  );
}
