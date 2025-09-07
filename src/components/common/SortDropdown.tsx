'use client';

import Dropdown from '~/src/components/common/Dropdown';

interface SortOption {
  id: 'recent' | 'likes';
  name: string;
}

const sortOptions: readonly SortOption[] = [
  { id: 'recent', name: '최신순' },
  { id: 'likes', name: '좋아요순' },
];

interface SortDropdownProps {
  currentSort: 'recent' | 'likes';
  onSortChange: (sortOption: 'recent' | 'likes') => void;
}

export default function SortDropdown({ currentSort, onSortChange }: SortDropdownProps) {
  const selectedOption = sortOptions.find(option => option.id === currentSort);

  return (
    <div className="my-4 flex justify-end">
      <Dropdown<SortOption>
        options={sortOptions}
        value={selectedOption}
        onChange={(option) => onSortChange(option.id)}
        getOptionLabel={(option) => option.name}
      />
    </div>
  );
}
