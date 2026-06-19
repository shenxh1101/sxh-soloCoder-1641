import { useState, useMemo } from 'react';
import {
  Search,
  Pin,
  AlertTriangle,
  Plus,
  Minus,
  ShoppingCart,
  ChevronRight,
  X,
  Trash2,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { useAppStore } from '@/store/useAppStore';
import { Dish, DishCategory, CATEGORY_LABELS, CATEGORY_COLORS } from '@/types';
import { formatPrice } from '@/utils/format';
import { cn } from '@/lib/utils';
import Empty from '@/components/Empty';

interface CartItem {
  dish: Dish;
  quantity: number;
}

const categories: { value: DishCategory | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'hot', label: '热菜' },
  { value: 'cold', label: '凉菜' },
  { value: 'staple', label: '主食' },
  { value: 'drink', label: '饮品' },
];

export default function OrderMenu() {
  const { dishes } = useAppStore();
  const [activeCategory, setActiveCategory] = useState<DishCategory | 'all'>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [cart, setCart] = useState<Map<string, CartItem>>(new Map());
  const [showCart, setShowCart] = useState(false);

  const filteredDishes = useMemo(() => {
    let result = dishes.filter((d) => d.isOnSale);

    if (activeCategory !== 'all') {
      result = result.filter((d) => d.category === activeCategory);
    }

    if (searchKeyword.trim()) {
      const keyword = searchKeyword.trim().toLowerCase();
      result = result.filter((d) =>
        d.name.toLowerCase().includes(keyword) ||
        (d.description?.toLowerCase().includes(keyword))
      );
    }

    result.sort((a, b) => {
      if (a.isTop !== b.isTop) return a.isTop ? -1 : 1;
      return a.sortOrder - b.sortOrder;
    });

    return result;
  }, [dishes, activeCategory, searchKeyword]);

  const groupedDishes = useMemo(() => {
    if (activeCategory !== 'all') return null;

    const groups: Record<DishCategory, Dish[]> = {
      hot: [],
      cold: [],
      staple: [],
      drink: [],
    };
    filteredDishes.forEach((d) => groups[d.category].push(d));
    return groups;
  }, [filteredDishes, activeCategory]);

  const cartTotal = useMemo(() => {
    let count = 0;
    let amount = 0;
    cart.forEach((item) => {
      count += item.quantity;
      amount += item.dish.price * item.quantity;
    });
    return { count, amount };
  }, [cart]);

  const handleAddToCart = (dish: Dish) => {
    if (dish.isSoldOut) return;
    setCart((prev) => {
      const next = new Map(prev);
      const existing = next.get(dish.id);
      if (existing) {
        next.set(dish.id, { ...existing, quantity: existing.quantity + 1 });
      } else {
        next.set(dish.id, { dish, quantity: 1 });
      }
      return next;
    });
  };

  const handleRemoveFromCart = (dish: Dish) => {
    setCart((prev) => {
      const next = new Map(prev);
      const existing = next.get(dish.id);
      if (existing) {
        if (existing.quantity <= 1) {
          next.delete(dish.id);
        } else {
          next.set(dish.id, { ...existing, quantity: existing.quantity - 1 });
        }
      }
      return next;
    });
  };

  const handleDeleteItem = (dishId: string) => {
    setCart((prev) => {
      const next = new Map(prev);
      next.delete(dishId);
      return next;
    });
  };

  const handleClearCart = () => {
    setCart(new Map());
  };

  const renderDishCard = (dish: Dish) => {
    const cartItem = cart.get(dish.id);
    const isSoldOut = dish.isSoldOut;

    return (
      <div
        key={dish.id}
        className={cn(
          'bg-white rounded-xl border border-stone-200 overflow-hidden',
          'transition-all duration-300 hover:shadow-md',
          isSoldOut && 'opacity-80'
        )}
      >
        <div className="flex">
          <div className={cn(
            'w-28 h-28 flex-shrink-0 overflow-hidden bg-stone-100 relative',
            isSoldOut && 'grayscale'
          )}>
            <img
              src={dish.image}
              alt={dish.name}
              className="w-full h-full object-cover"
            />
            {isSoldOut && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="bg-red-500 text-white px-2 py-1 rounded font-bold text-xs">
                  售罄
                </div>
              </div>
            )}
            {dish.isTop && !isSoldOut && (
              <div className="absolute top-1 left-1">
                <Badge variant="orange" className="text-xs py-0 px-1.5 flex items-center gap-0.5">
                  <Pin className="w-2.5 h-2.5" />
                  推荐
                </Badge>
              </div>
            )}
          </div>
          <div className="flex-1 p-3 flex flex-col min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="font-semibold text-stone-800 text-base truncate">{dish.name}</h4>
              {isSoldOut && (
                <Badge variant="danger" className="flex-shrink-0 flex items-center gap-0.5 text-xs">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  售罄
                </Badge>
              )}
            </div>
            <p className="text-xs text-stone-500 mb-2 line-clamp-2">
              {dish.description || '招牌美味，不容错过'}
            </p>
            <div className="mt-auto flex items-end justify-between">
              <div>
                <span className="text-xl font-bold text-orange-600">
                  {formatPrice(dish.price)}
                </span>
              </div>
              {isSoldOut ? (
                <div className="text-stone-400 text-sm font-medium px-3 py-1.5 rounded-lg bg-stone-100">
                  已售罄
                </div>
              ) : cartItem ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="p-1.5 h-8 w-8"
                    onClick={() => handleRemoveFromCart(dish)}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </Button>
                  <span className="w-6 text-center font-semibold text-stone-800">
                    {cartItem.quantity}
                  </span>
                  <Button
                    variant="primary"
                    size="sm"
                    className="p-1.5 h-8 w-8"
                    onClick={() => handleAddToCart(dish)}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  className="px-4"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => handleAddToCart(dish)}
                >
                  加购
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-stone-50">
      <Header
        title="点餐端菜单"
        subtitle="顾客点餐界面，展示所有在售菜品"
        action={
          <div className="flex items-center gap-2">
            <Badge variant="orange" className="text-sm px-3 py-1">
              今日营业中
            </Badge>
          </div>
        }
      />

      <div className="flex-1 overflow-hidden flex">
        <aside className="w-40 flex-shrink-0 bg-white border-r border-stone-200 overflow-y-auto py-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={cn(
                'w-full px-4 py-3 text-left flex items-center justify-between group transition-colors',
                'border-l-4',
                activeCategory === cat.value
                  ? 'bg-orange-50 border-orange-500 text-orange-700 font-semibold'
                  : 'border-transparent text-stone-600 hover:bg-stone-50'
              )}
            >
              <span>{cat.label}</span>
              {activeCategory === cat.value && (
                <ChevronRight className="w-4 h-4 text-orange-500" />
              )}
            </button>
          ))}
        </aside>

        <div className="flex-1 overflow-y-auto flex flex-col">
          <div className="p-4 bg-white border-b border-stone-200 sticky top-0 z-10">
            <div className="relative max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="搜索菜品名称..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all"
              />
            </div>
          </div>

          <div className="p-4 pb-24">
            {filteredDishes.length === 0 ? (
              <Empty
                title={searchKeyword ? '未找到匹配的菜品' : '该分类暂无在售菜品'}
                description={
                  searchKeyword
                    ? '请尝试其他关键词或切换分类'
                    : '当前分类下没有上架的菜品，请在菜品管理中添加'
                }
              />
            ) : groupedDishes ? (
              <div className="space-y-8">
                {(Object.keys(groupedDishes) as DishCategory[]).map((category) => {
                  const list = groupedDishes[category];
                  if (list.length === 0) return null;
                  return (
                    <section key={category}>
                      <div className="flex items-center gap-2 mb-4">
                        <Badge
                          variant="default"
                          className={cn('text-sm px-3 py-1', CATEGORY_COLORS[category])}
                        >
                          {CATEGORY_LABELS[category]}
                        </Badge>
                        <span className="text-stone-400 text-sm">{list.length} 道菜</span>
                      </div>
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                        {list.map(renderDishCard)}
                      </div>
                    </section>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {filteredDishes.map(renderDishCard)}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 lg:left-40 bg-white border-t border-stone-200 shadow-lg p-3 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => cartTotal.count > 0 && setShowCart(true)}
              className="relative"
            >
              <div className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center shadow-lg hover:bg-orange-600 transition-colors">
                <ShoppingCart className="w-7 h-7 text-white" />
              </div>
              {cartTotal.count > 0 && (
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                  {cartTotal.count > 99 ? '99+' : cartTotal.count}
                </div>
              )}
            </button>
            <div>
              <div className="text-stone-500 text-sm">已选 {cartTotal.count} 件</div>
              <div className="text-2xl font-bold text-orange-600">
                {formatPrice(cartTotal.amount)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="md"
              onClick={handleClearCart}
              disabled={cartTotal.count === 0}
              className="text-stone-500"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              清空
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="px-8 text-base"
              disabled={cartTotal.count === 0}
            >
              去下单
            </Button>
          </div>
        </div>
      </div>

      {showCart && (
        <div className="fixed inset-0 z-50 flex items-stretch justify-end">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowCart(false)}
          />
          <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between p-4 border-b border-stone-200">
              <h3 className="text-lg font-bold text-stone-800">
                已选菜品 ({cartTotal.count})
              </h3>
              <button
                onClick={() => setShowCart(false)}
                className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.size === 0 ? (
                <Empty title="购物车是空的" description="快去添加喜欢的菜品吧" />
              ) : (
                Array.from(cart.values()).map(({ dish, quantity }) => (
                  <div
                    key={dish.id}
                    className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl"
                  >
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-stone-800 truncate">{dish.name}</div>
                      <div className="text-orange-600 font-semibold text-sm mt-0.5">
                        {formatPrice(dish.price)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="p-1 h-7 w-7"
                        onClick={() => handleRemoveFromCart(dish)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-5 text-center font-semibold text-sm">{quantity}</span>
                      <Button
                        variant="primary"
                        size="sm"
                        className="p-1 h-7 w-7"
                        onClick={() => handleAddToCart(dish)}
                        disabled={dish.isSoldOut}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      <button
                        onClick={() => handleDeleteItem(dish.id)}
                        className="p-1.5 hover:bg-red-50 rounded text-stone-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t border-stone-200 space-y-3">
              <div className="flex items-center justify-between text-lg">
                <span className="text-stone-600">合计</span>
                <span className="text-3xl font-bold text-orange-600">
                  {formatPrice(cartTotal.amount)}
                </span>
              </div>
              <Button
                variant="primary"
                size="lg"
                className="w-full py-3 text-base"
                disabled={cartTotal.count === 0}
              >
                确认下单
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
