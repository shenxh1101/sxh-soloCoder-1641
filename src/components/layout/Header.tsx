import { Bell, Settings } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <div>
        <h2 className="text-xl font-bold text-stone-800">{title}</h2>
        {subtitle && <p className="text-sm text-stone-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {action}
        <button className="p-2 rounded-lg text-stone-500 hover:bg-stone-100 transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <button className="p-2 rounded-lg text-stone-500 hover:bg-stone-100 transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
