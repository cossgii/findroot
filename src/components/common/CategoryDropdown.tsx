'use client';

import React from 'react';
import Dropdown from '~/src/components/common/Dropdown';
import { PlaceCategory } from '~/src/types/shared';

const categoryOptions = [
  { id: PlaceCategory.MEAL, name: '식사 (MEAL)' },
  { id: PlaceCategory.DRINK, name: '음료 (DRINK)' },
];

interface CategoryDropdownProps {
  value: PlaceCategory | undefined;
  onChange: (value: PlaceCategory) => void;
  placeholder?: string;
  triggerClassName?: string;
}

export default function CategoryDropdown({
  value,
  onChange,
  placeholder = '카테고리를 선택하세요',
  triggerClassName,
}: CategoryDropdownProps) {
  const selectedOption = categoryOptions.find((c) => c.id === value);

  return (
    <Dropdown
      options={categoryOptions}
      value={selectedOption}
      onChange={(option) => onChange(option.id)}
      getOptionLabel={(option) => option.name}
      placeholder={placeholder}
      triggerClassName={triggerClassName}
    />
  );
}
