import { cn } from '~/src/utils/class-name';

interface EmptyStateProps {
  message: string;
  description?: string;
  className?: string;
}

export default function EmptyState({ message, description, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center min-h-[120px] rounded-xl bg-gray-50 px-6 py-10',
        className,
      )}
    >
      <p className="text-sm font-medium text-gray-500">{message}</p>
      {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
    </div>
  );
}
