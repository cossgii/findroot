'use client';
import * as React from 'react';
import Image from 'next/image';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cva, type VariantProps } from 'class-variance-authority';
import { User } from 'lucide-react';

import { cn } from '~/src/utils/class-name';

type AvatarSize = 'small' | 'medium' | 'large';

const AvatarSizeContext = React.createContext<AvatarSize>('large');

const sizePxMap: Record<AvatarSize, string> = {
  small: '28px',
  medium: '40px',
  large: '56px',
};

const avatarVariants = cva('relative flex shrink-0 rounded-full shadow-sm', {
  variants: {
    size: {
      small: 'h-7 w-7',
      medium: 'h-10 w-10',
      large: 'h-14 w-14',
    },
  },
  defaultVariants: {
    size: 'large',
  },
});

const Avatar = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> &
    VariantProps<typeof avatarVariants>
>(({ className, size = 'large', ...props }, ref) => {
  return (
    <AvatarSizeContext.Provider value={size ?? 'large'}>
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(avatarVariants({ size }), className)}
        {...props}
      />
    </AvatarSizeContext.Provider>
  );
});
Avatar.displayName = AvatarPrimitive.Root.displayName;

interface AvatarImageProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>,
    'src'
  > {
  src?: string;
}

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, src, alt }, ref) => {
    const size = React.useContext(AvatarSizeContext);
    if (!src) {
      return null;
    }
    return (
      <Image
        ref={ref}
        src={src}
        alt={alt || 'User Avatar'}
        fill
        className={cn(
          'aspect-square h-full w-full overflow-hidden rounded-full object-cover',
          className,
        )}
        sizes={sizePxMap[size]}
        unoptimized
      />
    );
  },
);
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-gray-200 dark:bg-gray-600',
      className,
    )}
    {...props}
  >
    <User className="h-3/5 w-3/5 text-gray-500 dark:text-gray-300" />
  </AvatarPrimitive.Fallback>
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarFallback, AvatarImage };
