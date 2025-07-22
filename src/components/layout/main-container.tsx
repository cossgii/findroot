import { type ComponentPropsWithoutRef, type PropsWithChildren } from 'react';

import { cn } from '~/src/utils/class-name';

export default function MainContainer({
  children,
  className,
  ...props
}: PropsWithChildren<ComponentPropsWithoutRef<'main'>>) {
  return (
    <main
      className={cn(
        'relative mx-auto min-h-dvh max-w-screen-desktop bg-secondary-50 pt-header',
        'px-4 tablet:px-6 desktop:px-[6.25rem]',
        className,
      )}
      {...props}
    >
      {children}
    </main>
  );
}
