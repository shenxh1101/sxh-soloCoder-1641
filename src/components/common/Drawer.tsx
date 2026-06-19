import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeStyles = {
  sm: 'w-80',
  md: 'w-96',
  lg: 'w-[32rem]',
  xl: 'w-[40rem]',
};

export function Drawer({ isOpen, onClose, title, children, footer, size = 'md' }: DrawerProps) {
  return (
    <>
      <div
        className={cn(
          'fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          'fixed top-0 right-0 h-full bg-white shadow-2xl z-50 transition-transform duration-300 ease-out',
          sizeStyles[size],
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <h3 className="text-lg font-semibold text-stone-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 h-[calc(100vh-130px)]">
          {children}
        </div>
        {footer && (
          <div className="px-6 py-4 border-t border-stone-200 bg-stone-50">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}
