'use client';
import * as React from 'react';
import Image from 'next/image';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { User } from 'lucide-react';

import { cn } from '~/src/utils/class-name';

const Avatar = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
    size?: 'small' | 'medium' | 'large';
  }
>(({ className, size = 'large', ...props }, ref) => {
  const sizeClass =
    size === 'small'
      ? 'h-7 w-7'
      : size === 'medium'
        ? 'h-10 w-10'
        : 'h-14 w-14';

  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        'relative flex shrink-0 rounded-full shadow-sm',
        sizeClass,
        className,
      )}
      {...props}
    />
  );
});
Avatar.displayName = AvatarPrimitive.Root.displayName;

interface AvatarImageProps extends Omit<
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>,
  'src'
> {
  src?: string;
}

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, src, alt }, ref) => {
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
        sizes="48px"
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
      'bg-muted flex h-full w-full items-center justify-center rounded-full bg-gray-200',
      className,
    )}
    {...props}
  >
    <User className="h-3/5 w-3/5 text-gray-500" />
  </AvatarPrimitive.Fallback>
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarFallback, AvatarImage };
