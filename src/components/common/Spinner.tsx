import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '~/src/utils/class-name';

const spinnerVariants = cva(
  'border-primary-500 border-t-transparent rounded-full animate-spin dark:border-primary-400',
  {
    variants: {
      size: {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-4',
        lg: 'w-12 h-12 border-4',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

interface SpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string;
}

export default function Spinner({ size, className }: SpinnerProps) {
  return <div className={cn(spinnerVariants({ size }), className)} />;
}

export function SpinnerContainer({
  size,
  className,
}: {
  size?: SpinnerProps['size'];
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-center min-h-[120px]', className)}>
      <Spinner size={size} />
    </div>
  );
}
