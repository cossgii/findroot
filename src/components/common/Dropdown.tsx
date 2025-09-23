'use client';

import React, {
  useState,
  useRef,
  useEffect,
  createContext,
  useContext,
} from 'react';
import { cn } from '~/src/utils/class-name';

const DropdownContext = createContext({
  closeDropdown: () => {},
});

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
  const { closeDropdown } = useContext(DropdownContext);

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    closeDropdown();
  };

  return (
    <li
      onClick={handleClick}
      className={cn(
        'px-4 py-2 text-sm cursor-pointer hover:bg-primary-50',
        className,
      )}
    >
      {children}
    </li>
  );
}

interface DropdownProps<T> {
  options?: readonly T[];
  value?: T;
  onChange?: (value: T) => void;
  getOptionLabel?: (option: T) => string;
  placeholder?: string;
  triggerClassName?: string;
  trigger?: React.ReactNode;
  children?: React.ReactNode;
  contentClassName?: string;
  align?: 'left' | 'right';
}

export default function Dropdown<T>({
  options,
  value,
  onChange,
  getOptionLabel,
  placeholder = 'Select an option',
  triggerClassName,
  trigger,
  children,
  contentClassName,
  align = 'right',
}: DropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const closeDropdown = () => setIsOpen(false);
  const toggleDropdown = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (option: T) => {
    if (onChange) {
      onChange(option);
    }
    closeDropdown();
  };

  const triggerNode = trigger ?? (
    <div
      className={cn(
        'flex items-center justify-between px-4 py-2 border border-gray-300 rounded-md',
        'min-w-[120px] text-sm hover:bg-gray-50',
        !value ? 'text-gray-400' : 'text-gray-700',
        'min-w-0',
        triggerClassName,
      )}
    >
      <span className="truncate">
        {value && getOptionLabel ? getOptionLabel(value) : placeholder}
      </span>
      <svg
        className="w-4 h-4 ml-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M19 9l-7 7-7-7"
        ></path>
      </svg>
    </div>
  );

  return (
    <DropdownContext.Provider value={{ closeDropdown }}>
      <div className="relative" ref={dropdownRef}>
        <div onClick={toggleDropdown} className="cursor-pointer">
          {triggerNode}
        </div>
        {isOpen && (
          <div
            className={cn(
              'absolute mt-2 w-full bg-white border border-gray-200 rounded-md shadow-lg z-20',
              align === 'left' ? 'left-0' : 'right-0',
              contentClassName,
            )}
          >
            {options && getOptionLabel && onChange ? (
              <ul className="py-1">
                {options.map((option, index) => (
                  <li
                    key={index}
                    onClick={() => handleSelect(option)}
                    className={cn(
                      'px-4 py-2 text-sm cursor-pointer',
                      value && JSON.stringify(option) === JSON.stringify(value)
                        ? 'bg-primary-100 text-primary-700 font-bold'
                        : 'text-gray-700',
                      'hover:bg-primary-50',
                    )}
                  >
                    {getOptionLabel(option)}
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="py-1">{children}</ul>
            )}
          </div>
        )}
      </div>
    </DropdownContext.Provider>
  );
}
