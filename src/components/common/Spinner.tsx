import { cn } from '~/src/utils/class-name';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-4',
  lg: 'w-12 h-12 border-4',
};

export default function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div
      className={cn(
        sizeMap[size],
        'border-primary-500 border-t-transparent rounded-full animate-spin',
        className,
      )}
    />
  );
}

export function SpinnerContainer({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-center min-h-[120px]', className)}>
      <Spinner size={size} />
    </div>
  );
}
