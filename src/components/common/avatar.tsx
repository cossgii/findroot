'use client';
import * as React from 'react';
import Image from 'next/image';
import * as AvatarPrimitive from '@radix-ui/react-avatar';

import profilelarge from '../../../public/assets/profile-large.png';
import { cn } from '~/src/utils/class-name';

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
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

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn(
      'aspect-square h-full w-full overflow-hidden rounded-full',
      className,
    )}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'bg-muted flex h-full w-full items-center justify-center rounded-full',
      className,
    )}
    {...props}
  >
    <Image src={profilelarge} alt="profile_img" className="object-cover" />
  </AvatarPrimitive.Fallback>
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarFallback, AvatarImage };
