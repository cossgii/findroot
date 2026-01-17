import React, {
  type ButtonHTMLAttributes,
  type ForwardedRef,
  forwardRef,
} from 'react';
import {
  cva,
  type VariantProps as CvaVariantProps,
} from 'class-variance-authority';
import { cn } from '~/src/utils/class-name';

const buttonVariants = cva(
  'inline-flex items-center justify-center w-full rounded-xl px-3 shadow-sm transition-colors duration-150 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary:
          'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800',
        secondary:
          'bg-secondary-600 text-white hover:bg-secondary-700 active:bg-secondary-800',
        outlined:
          'border border-primary-600 bg-white text-primary-600 hover:border-primary-700 hover:text-primary-700 active:border-primary-800 active:text-primary-800',
      },
      size: {
        small: 'h-10 text-sm',
        large: 'h-11 text-base',
      },
      disabled: {
        true: '',
      },
    },
    compoundVariants: [
      {
        variant: ['primary', 'secondary'],
        disabled: true,
        className: 'bg-secondary-300 text-secondary-500',
      },
      {
        variant: 'outlined',
        disabled: true,
        className: 'border-secondary-300 bg-white text-secondary-400',
      },
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'large',
    },
  },
);
type ButtonVariantProps = Omit<
  CvaVariantProps<typeof buttonVariants>,
  'disabled'
>;

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonVariantProps {}

const Button = forwardRef(function Button(
  { className, variant, size, disabled, ...props }: ButtonProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  return (
    <button
      ref={ref}
      className={cn(
        buttonVariants({ variant, size, disabled: !!disabled, className }),
      )}
      disabled={disabled}
      {...props}
    />
  );
});

export default Button;
