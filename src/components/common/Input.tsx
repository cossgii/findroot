'use client';

import { forwardRef, useState } from 'react';
import { cn } from '~/src/utils/class-name';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value'> {
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
      <>
        <div className="relative">
          <input
            {...restProps}
            value={value ?? ''}
            ref={ref}
            className={cn(
              'w-full rounded-xl border-2 border-secondary-50 bg-gray-50 px-[16px] py-[10px] shadow-sm outline-2 transition-colors duration-75 hover:border-primary-300 focus:outline-primary-600',
              error && 'border-2 border-red-600',
              value && 'border-2 border-secondary-50',
              className,
            )}
            type={showPassword && type === 'password' ? 'text' : type}
          />
          {type === 'password' && (
            <button
              type="button"
              onClick={togglePassword}
              className="absolute right-2 top-1/2 -translate-y-1/2 transform"
              aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
            ></button>
          )}
        </div>
      </>
    );
  },
);

Input.displayName = 'Input';

export default Input;
