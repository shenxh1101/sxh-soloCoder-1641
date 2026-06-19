import { ChefHat } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export default function Empty({
  title = '暂无数据',
  description,
  icon,
  action,
  className,
}: EmptyProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 text-center',
        className
      )}
    >
      <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-4">
        {icon || <ChefHat className="w-10 h-10 text-stone-400" />}
      </div>
      <h3 className="text-lg font-semibold text-stone-700 mb-1">{title}</h3>
      {description && (
        <p className="text-stone-500 mb-6 max-w-sm">{description}</p>
      )}
      {action}
    </div>
  );
}
