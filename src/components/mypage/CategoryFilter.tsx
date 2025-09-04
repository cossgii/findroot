'use client';

import { PlaceCategory } from '@prisma/client';
import { cn } from '~/src/utils/class-name';

interface CategoryFilterProps {
  selectedCategory: PlaceCategory | undefined;
  onCategoryChange: (category: PlaceCategory | undefined) => void;
}

const TABS: { label: string; value: PlaceCategory | undefined }[] = [
  { label: '전체', value: undefined },
  { label: '식사', value: 'MEAL' },
  { label: '음료', value: 'DRINK' },
];

export default function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="border-b border-gray-200 mb-4">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {TABS.map((tab) => (
          <button
            key={tab.label}
            onClick={() => onCategoryChange(tab.value)}
            className={cn(
              'whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium',
              selectedCategory === tab.value
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
