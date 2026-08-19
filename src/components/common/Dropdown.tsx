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
  renderInFlow?: boolean;
  disabled?: boolean;
  maxVisibleItems?: number; // Added prop
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
  renderInFlow = false,
  disabled = false,
  maxVisibleItems,
}: DropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const closeDropdown = () => setIsOpen(false);
  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
  };

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
        'min-w-[120px] text-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700',
        !value ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-200',
        'min-w-0',
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
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
              'bg-white border border-gray-200 rounded-md shadow-lg mt-2 dark:bg-gray-800 dark:border-gray-600',
              renderInFlow ? '' : 'absolute min-w-full z-20',
              renderInFlow ? '' : align === 'left' ? 'left-0' : 'right-0',
              contentClassName,
            )}
            style={
              maxVisibleItems
                ? {
                    maxHeight: `${maxVisibleItems * 36 + 8}px`,
                    overflowY: 'auto',
                  }
                : {}
            }
          >
            {options && getOptionLabel && onChange ? (
              <ul className="py-1">
                {options.map((option, index) => (
                  <li
                    key={index}
                    onClick={() => handleSelect(option)}
                    className={cn(
                      'px-4 py-2 text-sm cursor-pointer whitespace-nowrap',
                      value && getOptionLabel(option) === getOptionLabel(value)
                        ? 'bg-primary-100 text-primary-700 font-bold dark:bg-primary-950 dark:text-primary-300'
                        : 'text-gray-700 dark:text-gray-200',
                      'hover:bg-primary-50 dark:hover:bg-gray-700',
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
