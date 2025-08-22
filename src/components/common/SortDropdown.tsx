'use client';

interface SortDropdownProps {
  currentSort: 'recent' | 'likes';
  onSortChange: (sortOption: 'recent' | 'likes') => void;
}

export default function SortDropdown({ currentSort, onSortChange }: SortDropdownProps) {
  return (
    <div className="my-4 flex justify-end">
      <select
        value={currentSort}
        onChange={(e) => onSortChange(e.target.value as 'recent' | 'likes')}
        className="rounded-md border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 text-sm py-2 px-3"
      >
        <option value="recent">최신순</option>
        <option value="likes">좋아요순</option>
      </select>
    </div>
  );
}