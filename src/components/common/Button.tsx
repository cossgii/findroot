import React, {
  type ComponentPropsWithoutRef,
  type ForwardedRef,
  forwardRef,
} from 'react';

import { cn } from '~/src/utils/class-name';

interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: 'primary' | 'secondary' | 'outlined';
  size?: 'small' | 'large';
}

export default forwardRef(function Button(
  {
    children,
    variant = 'primary',
    disabled,
    className,
    size = 'large',
    ...props
  }: ButtonProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const sizeClass = size === 'small' ? 'h-[40px]' : 'h-[44px]';

  const variantClasses = {
    primary: disabled
      ? 'bg-secondary-400'
      : 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800',
    secondary: disabled
      ? 'bg-secondary-400'
      : 'bg-secondary-600 hover:bg-secondary-700 active:bg-secondary-800',
    outlined: disabled
      ? 'border border-secondary-400 bg-white text-secondary-400'
      : 'border border-primary-600 bg-white text-primary-600 hover:border-primary-700 hover:text-primary-700 active:border-primary-800 active:text-primary-800',
  };

  return (
    <button
      ref={ref}
      {...props}
      disabled={disabled}
      className={cn(
        'w-full rounded-xl px-3 text-white shadow-sm transition-colors duration-75 hover:shadow-md',
        sizeClass,
        variantClasses[variant],
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        className,
      )}
    >
      {children}
    </button>
  );
});
