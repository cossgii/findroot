// src/components/common/dropdown.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '~/src/utils/class-name';

interface DropdownProps {
  trigger: React.ReactNode; // 드롭다운을 여는 요소 (버튼 등)
  children: React.ReactNode; // 드롭다운 내부에 표시될 내용
  align?: 'left' | 'right'; // 드롭다운 정렬 (기본: right)
  contentClassName?: string; // 드롭다운 내용 컨테이너에 적용될 추가 CSS 클래스
}

export default function Dropdown({
  trigger,
  children,
  align = 'right',
  contentClassName,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={toggleDropdown} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div
          className={cn(
            "absolute mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20",
            align === 'left' ? 'left-0' : 'right-0',
            contentClassName
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

interface DropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function DropdownItem({
  children,
  onClick,
  className,
}: DropdownItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}