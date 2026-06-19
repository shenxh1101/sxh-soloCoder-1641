import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Pin,
  PinOff,
  ArrowUp,
  ArrowDown,
  Search,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Badge } from '@/components/common/Badge';
import { useAppStore } from '@/store/useAppStore';
import { Dish, CATEGORY_LABELS } from '@/types';
import { formatPrice } from '@/utils/format';
import { cn } from '@/lib/utils';

interface SortableItemProps {
  dish: Dish;
  rank: number;
  onToggleTop: (id: string, isTop: boolean) => void;
}

function SortableItem({ dish, rank, onToggleTop }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: dish.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-4 p-4 bg-white border border-stone-200 rounded-xl mb-3',
        'transition-all duration-200',
        isDragging && 'shadow-xl border-orange-300 z-50 opacity-95',
        dish.isTop && 'border-orange-300 bg-orange-50/30'
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-2 -ml-2 text-stone-400 hover:text-stone-600"
      >
        <GripVertical className="w-5 h-5" />
      </div>

      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
          rank === 1
            ? 'bg-yellow-100 text-yellow-700'
            : rank === 2
            ? 'bg-stone-200 text-stone-600'
            : rank === 3
            ? 'bg-orange-100 text-orange-700'
            : 'bg-stone-100 text-stone-500'
        )}
      >
        {rank}
      </div>

      <img
        src={dish.image}
        alt={dish.name}
        className="w-12 h-12 rounded-lg object-cover"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-stone-800 truncate">{dish.name}</h4>
          {dish.isTop && (
            <Badge variant="orange" className="flex items-center gap-1">
              <Pin className="w-3 h-3" />
              置顶
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="default" className="text-xs">
            {CATEGORY_LABELS[dish.category]}
          </Badge>
          <span className="text-sm text-stone-500">{formatPrice(dish.price)}</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onToggleTop(dish.id, !dish.isTop)}
          className={cn(
            'p-2 rounded-lg transition-colors',
            dish.isTop
              ? 'text-orange-500 bg-orange-50 hover:bg-orange-100'
              : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'
          )}
          title={dish.isTop ? '取消置顶' : '置顶推荐'}
        >
          {dish.isTop ? <PinOff className="w-5 h-5" /> : <Pin className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}

export default function Sorting() {
  const { dishes, updateDishSortOrder, setDishTop } = useAppStore();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sortedDishes = [...dishes].sort((a, b) => {
    if (a.isTop && !b.isTop) return -1;
    if (!a.isTop && b.isTop) return 1;
    return a.sortOrder - b.sortOrder;
  });

  const filteredDishes = sortedDishes.filter((dish) => {
    const matchesSearch = dish.name.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || dish.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedDishes.findIndex((d) => d.id === active.id);
      const newIndex = sortedDishes.findIndex((d) => d.id === over.id);

      const newDishes = arrayMove(sortedDishes, oldIndex, newIndex);
      updateDishSortOrder(newDishes);
    }
  };

  const handleToggleTop = (id: string, isTop: boolean) => {
    setDishTop(id, isTop);
  };

  const topCount = dishes.filter((d) => d.isTop).length;

  return (
    <div className="flex flex-col h-screen">
      <Header
        title="推荐排序"
        subtitle="拖拽调整菜品排序，设置置顶推荐"
      />

      <div className="flex-1 overflow-y-auto bg-stone-50 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-stone-200 p-4">
            <p className="text-sm text-stone-500 mb-1">菜品总数</p>
            <p className="text-2xl font-bold text-stone-800">{dishes.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-4">
            <p className="text-sm text-stone-500 mb-1">置顶推荐</p>
            <p className="text-2xl font-bold text-orange-600">{topCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-4">
            <p className="text-sm text-stone-500 mb-1">在售菜品</p>
            <p className="text-2xl font-bold text-green-600">
              {dishes.filter((d) => d.isOnSale && !d.isSoldOut).length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-4">
            <p className="text-sm text-stone-500 mb-1">售罄菜品</p>
            <p className="text-2xl font-bold text-red-600">
              {dishes.filter((d) => d.isSoldOut).length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="p-5 border-b border-stone-200">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[240px] max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="搜索菜品..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-colors bg-white"
              >
                <option value="all">全部分类</option>
                <option value="hot">热菜</option>
                <option value="cold">凉菜</option>
                <option value="staple">主食</option>
                <option value="drink">饮品</option>
              </select>

              <div className="flex items-center gap-2 text-sm text-stone-500">
                <GripVertical className="w-4 h-4" />
                <span>拖拽卡片调整排序</span>
              </div>
            </div>
          </div>

          <div className="p-5 max-h-[calc(100vh-360px)] overflow-y-auto">
            {filteredDishes.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={filteredDishes.map((d) => d.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {filteredDishes.map((dish, index) => (
                    <SortableItem
                      key={dish.id}
                      dish={dish}
                      rank={index + 1}
                      onToggleTop={handleToggleTop}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            ) : (
              <div className="text-center py-16 text-stone-400">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>没有找到匹配的菜品</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
