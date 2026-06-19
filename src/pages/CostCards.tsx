import { useState } from 'react';
import {
  Plus,
  Trash2,
  DollarSign,
  Percent,
  Calculator,
  ChefHat,
  Search,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { useAppStore } from '@/store/useAppStore';
import { Dish, Ingredient, DishIngredient, CATEGORY_LABELS } from '@/types';
import { formatPrice, getProfitRateLevel } from '@/utils/format';
import { cn } from '@/lib/utils';

export default function CostCards() {
  const {
    dishes,
    ingredients,
    getDishCost,
    getDishProfitRate,
    getDishIngredients,
    addDishIngredient,
    updateDishIngredient,
    deleteDishIngredient,
  } = useAppStore();

  const [expandedDishes, setExpandedDishes] = useState<Set<string>>(new Set());
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const toggleExpand = (dishId: string) => {
    const newExpanded = new Set(expandedDishes);
    if (newExpanded.has(dishId)) {
      newExpanded.delete(dishId);
    } else {
      newExpanded.add(dishId);
    }
    setExpandedDishes(newExpanded);
  };

  const filteredDishes = dishes.filter((dish) => {
    const matchesSearch = dish.name.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || dish.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddIngredient = (dishId: string) => {
    if (ingredients.length > 0) {
      addDishIngredient({
        dishId,
        ingredientId: ingredients[0].id,
        quantity: 1,
      });
    }
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    updateDishIngredient(id, { quantity });
  };

  const handleUpdateIngredient = (id: string, ingredientId: string) => {
    updateDishIngredient(id, { ingredientId });
  };

  const ProfitBadge = ({ rate }: { rate: number }) => {
    const level = getProfitRateLevel(rate);
    const colors = {
      high: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-red-100 text-red-700',
    };
    return (
      <Badge className={colors[level]}>
        <Percent className="w-3 h-3 mr-1" />
        {(rate * 100).toFixed(1)}%
      </Badge>
    );
  };

  return (
    <div className="flex flex-col h-screen">
      <Header
        title="成本卡管理"
        subtitle="管理菜品成本卡，自动计算毛利"
      />

      <div className="flex-1 overflow-y-auto bg-stone-50 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-stone-500">菜品总数</p>
                <p className="text-2xl font-bold text-stone-800">{dishes.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-stone-500">平均成本</p>
                <p className="text-2xl font-bold text-stone-800">
                  {formatPrice(
                    dishes.length > 0
                      ? dishes.reduce((sum, d) => sum + getDishCost(d.id), 0) / dishes.length
                      : 0
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                <Percent className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-stone-500">平均毛利率</p>
                <p className="text-2xl font-bold text-stone-800">
                  {dishes.length > 0
                    ? (
                        (dishes.reduce((sum, d) => sum + getDishProfitRate(d.id), 0) /
                          dishes.length) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-stone-200">
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
            </div>
          </div>

          <div className="divide-y divide-stone-100">
            {filteredDishes.map((dish) => {
              const cost = getDishCost(dish.id);
              const profitRate = getDishProfitRate(dish.id);
              const isExpanded = expandedDishes.has(dish.id);
              const dishIngredients = getDishIngredients(dish.id);

              return (
                <div key={dish.id}>
                  <div
                    className="p-5 cursor-pointer hover:bg-stone-50 transition-colors"
                    onClick={() => toggleExpand(dish.id)}
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className="w-14 h-14 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-stone-800 truncate">
                            {dish.name}
                          </h4>
                          <Badge variant="default">{CATEGORY_LABELS[dish.category]}</Badge>
                        </div>
                        <p className="text-sm text-stone-500">
                          {dishIngredients.length} 种原材料
                        </p>
                      </div>

                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="text-sm text-stone-500">售价</p>
                          <p className="font-semibold text-stone-800">
                            {formatPrice(dish.price)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-stone-500">成本</p>
                          <p className="font-semibold text-blue-600">{formatPrice(cost)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-stone-500">毛利</p>
                          <p className="font-semibold text-green-600">
                            {formatPrice(dish.price - cost)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-stone-500 mb-1">毛利率</p>
                          <ProfitBadge rate={profitRate} />
                        </div>
                        <button className="p-2 text-stone-400 hover:text-stone-600">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-5 bg-stone-50/50">
                      <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
                        <div className="p-4 border-b border-stone-200 flex items-center justify-between">
                          <h5 className="font-medium text-stone-800 flex items-center gap-2">
                            <Calculator className="w-4 h-4 text-orange-500" />
                            成本明细
                          </h5>
                          <Button
                            size="sm"
                            variant="outline"
                            icon={<Plus className="w-4 h-4" />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddIngredient(dish.id);
                            }}
                          >
                            添加原材料
                          </Button>
                        </div>

                        <table className="w-full">
                          <thead className="bg-stone-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                                原材料
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                                用量
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                                单位
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                                单价
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                                小计
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider w-20">
                                操作
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100">
                            {dishIngredients.length > 0 ? (
                              dishIngredients.map((item) => (
                                <tr key={item.id} className="hover:bg-stone-50">
                                  <td className="px-4 py-3">
                                    <select
                                      value={item.ingredientId}
                                      onChange={(e) =>
                                        handleUpdateIngredient(item.id, e.target.value)
                                      }
                                      className="w-full px-2 py-1.5 border border-stone-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-sm bg-white"
                                    >
                                      {ingredients.map((ing) => (
                                        <option key={ing.id} value={ing.id}>
                                          {ing.name}
                                        </option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="px-4 py-3">
                                    <input
                                      type="number"
                                      step="0.1"
                                      min="0"
                                      value={item.quantity}
                                      onChange={(e) =>
                                        handleUpdateQuantity(
                                          item.id,
                                          parseFloat(e.target.value) || 0
                                        )
                                      }
                                      className="w-24 px-2 py-1.5 border border-stone-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-sm"
                                    />
                                  </td>
                                  <td className="px-4 py-3 text-sm text-stone-600">
                                    {item.ingredient.unit}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-stone-600">
                                    {formatPrice(item.ingredient.unitPrice)}
                                  </td>
                                  <td className="px-4 py-3 font-medium text-stone-800">
                                    {formatPrice(
                                      item.ingredient.unitPrice * item.quantity
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteDishIngredient(item.id);
                                      }}
                                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan={6}
                                  className="px-4 py-8 text-center text-stone-400"
                                >
                                  暂无原材料，点击上方按钮添加
                                </td>
                              </tr>
                            )}
                          </tbody>
                          {dishIngredients.length > 0 && (
                            <tfoot className="bg-stone-50 border-t border-stone-200">
                              <tr>
                                <td
                                  colSpan={4}
                                  className="px-4 py-3 text-right font-medium text-stone-600"
                                >
                                  总成本
                                </td>
                                <td className="px-4 py-3 font-bold text-orange-600 text-lg">
                                  {formatPrice(cost)}
                                </td>
                                <td></td>
                              </tr>
                            </tfoot>
                          )}
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredDishes.length === 0 && (
            <div className="p-12 text-center text-stone-400">
              <Calculator className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>没有找到匹配的菜品</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
