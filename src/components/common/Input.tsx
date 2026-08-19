'use client';

import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '~/src/utils/class-name';

const inputVariants = cva(
  'w-full rounded-xl border-2 bg-gray-50 px-[16px] py-[10px] shadow-sm outline-2 transition-colors duration-75 hover:border-primary-300 focus:outline-primary-600 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-100 dark:hover:border-primary-400 dark:focus:outline-primary-500 dark:placeholder:text-gray-500',
  {
    variants: {
      state: {
        default: 'border-secondary-50 dark:border-gray-600',
        error: 'border-red-600 dark:border-red-400',
      },
    },
    defaultVariants: {
      state: 'default',
    },
  },
);

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value'>,
    Omit<VariantProps<typeof inputVariants>, 'state'> {
  error?: string;
  value?: string | number | readonly string[] | null;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, type, className, ...props }: InputProps, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const { value, ...restProps } = props;

    const togglePassword = () => {
      setShowPassword((prevState) => !prevState);
    };

    return (
      <div className="relative">
        <input
          {...restProps}
          value={value ?? ''}
          ref={ref}
          className={cn(
            inputVariants({ state: error ? 'error' : 'default' }),
            type === 'password' && 'pr-10',
            className,
          )}
          type={showPassword && type === 'password' ? 'text' : type}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={togglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
