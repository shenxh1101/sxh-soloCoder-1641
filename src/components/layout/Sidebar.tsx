import { NavLink } from 'react-router-dom';
import {
  UtensilsCrossed,
  BarChart3,
  Calculator,
  ArrowUpDown,
  ChefHat,
  ClipboardList,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/dishes', label: '菜品管理', icon: UtensilsCrossed },
  { path: '/statistics', label: '统计报表', icon: BarChart3 },
  { path: '/cost-cards', label: '成本卡管理', icon: Calculator },
  { path: '/sorting', label: '推荐排序', icon: ArrowUpDown },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-stone-200 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-stone-800 text-lg">味来餐饮</h1>
            <p className="text-xs text-stone-500">菜品管理系统</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                'text-stone-600 hover:bg-stone-50 hover:text-stone-900',
                isActive && 'bg-orange-50 text-orange-600 font-medium'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}

        <div className="my-4 border-t border-stone-100" />

        <NavLink
          to="/order"
          className={({ isActive }) =>
            cn(
              'flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200',
              'bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100',
              'text-orange-700 hover:from-orange-100 hover:to-amber-100 font-medium group',
              isActive && 'shadow-md shadow-orange-100'
            )
          }
        >
          <div className="flex items-center gap-3">
            <ClipboardList className="w-5 h-5" />
            <span>点餐端菜单</span>
          </div>
          <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
        </NavLink>

        <p className="px-4 mt-2 text-xs text-stone-400">
          顾客点餐视图，展示在售菜品
        </p>
      </nav>

      <div className="p-4 border-t border-stone-200">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-stone-200 flex items-center justify-center">
            <span className="text-sm font-medium text-stone-600">张</span>
          </div>
          <div>
            <p className="text-sm font-medium text-stone-800">张师傅</p>
            <p className="text-xs text-stone-500">后厨主管</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
