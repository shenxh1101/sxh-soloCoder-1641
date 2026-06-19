import { useState, useEffect } from 'react';
import { Image as ImageIcon, Clock, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { Dish, DishCategory, CATEGORY_LABELS, TimedSchedule } from '@/types';
import { Button } from '@/components/common/Button';
import { useAppStore } from '@/store/useAppStore';
import { generateId } from '@/utils/id';
import { cn } from '@/lib/utils';

interface DishFormProps {
  dish?: Dish | null;
  onSubmit: (data: Omit<Dish, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const categories: { value: DishCategory; label: string }[] = [
  { value: 'hot', label: '热菜' },
  { value: 'cold', label: '凉菜' },
  { value: 'staple', label: '主食' },
  { value: 'drink', label: '饮品' },
];

const weekDays = [
  { value: 1, label: '一' },
  { value: 2, label: '二' },
  { value: 3, label: '三' },
  { value: 4, label: '四' },
  { value: 5, label: '五' },
  { value: 6, label: '六' },
  { value: 0, label: '日' },
];

export function DishForm({ dish, onSubmit, onCancel }: DishFormProps) {
  const { timedSchedules, addTimedSchedule, updateTimedSchedule, deleteTimedSchedule } =
    useAppStore();

  const [formData, setFormData] = useState({
    name: '',
    category: 'hot' as DishCategory,
    price: 0,
    image: '',
    isOnSale: true,
    isSoldOut: false,
    isTop: false,
    sortOrder: 0,
    description: '',
  });

  const [showTimedSchedule, setShowTimedSchedule] = useState(false);
  const [schedules, setSchedules] = useState<TimedSchedule[]>([]);

  useEffect(() => {
    if (dish) {
      setFormData({
        name: dish.name,
        category: dish.category,
        price: dish.price,
        image: dish.image,
        isOnSale: dish.isOnSale,
        isSoldOut: dish.isSoldOut,
        isTop: dish.isTop,
        sortOrder: dish.sortOrder,
        description: dish.description || '',
      });

      const dishSchedules = timedSchedules.filter((s) => s.dishId === dish.id);
      setSchedules(dishSchedules);
    } else {
      setFormData({
        name: '',
        category: 'hot',
        price: 0,
        image: '',
        isOnSale: true,
        isSoldOut: false,
        isTop: false,
        sortOrder: 0,
        description: '',
      });
      setSchedules([]);
    }
  }, [dish, timedSchedules]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);

    if (dish) {
      schedules.forEach((schedule) => {
        if (timedSchedules.find((s) => s.id === schedule.id)) {
          updateTimedSchedule(schedule.id, schedule);
        } else {
          addTimedSchedule(schedule);
        }
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addSchedule = () => {
    const newSchedule: TimedSchedule = {
      id: generateId(),
      dishId: dish?.id || '',
      startTime: '06:00',
      endTime: '10:00',
      isEnabled: true,
      repeatDays: [1, 2, 3, 4, 5],
    };
    setSchedules((prev) => [...prev, newSchedule]);
  };

  const updateSchedule = (id: string, updates: Partial<TimedSchedule>) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const removeSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    if (dish && timedSchedules.find((s) => s.id === id)) {
      deleteTimedSchedule(id);
    }
  };

  const toggleDay = (scheduleId: string, day: number) => {
    const schedule = schedules.find((s) => s.id === scheduleId);
    if (!schedule) return;

    const newDays = schedule.repeatDays.includes(day)
      ? schedule.repeatDays.filter((d) => d !== day)
      : [...schedule.repeatDays, day].sort();

    updateSchedule(scheduleId, { repeatDays: newDays });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex gap-6">
        <div className="flex-shrink-0">
          <label className="block text-sm font-medium text-stone-700 mb-2">菜品图片</label>
          <label className="cursor-pointer">
            <div className="w-40 h-40 border-2 border-dashed border-stone-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-orange-400 hover:bg-orange-50/50 transition-colors overflow-hidden">
              {formData.image ? (
                <img
                  src={formData.image}
                  alt="预览"
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <ImageIcon className="w-8 h-8 text-stone-400" />
                  <span className="text-sm text-stone-500">点击上传图片</span>
                </>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              菜品名称
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-colors"
              placeholder="请输入菜品名称"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                菜品分类
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    category: e.target.value as DishCategory,
                  }))
                }
                className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-colors bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                售价（元）
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    price: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-colors"
                placeholder="0.00"
                required
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">菜品描述</label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          rows={3}
          className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-colors resize-none"
          placeholder="请输入菜品描述"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg">
          <div>
            <p className="font-medium text-stone-800">上架状态</p>
            <p className="text-sm text-stone-500">
              {formData.isOnSale ? '已上架' : '已下架'}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isOnSale}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, isOnSale: e.target.checked }))
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg">
          <div>
            <p className="font-medium text-stone-800">沽清状态</p>
            <p className="text-sm text-stone-500">
              {formData.isSoldOut ? '已售罄' : '可售卖'}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isSoldOut}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, isSoldOut: e.target.checked }))
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg">
          <div>
            <p className="font-medium text-stone-800">推荐置顶</p>
            <p className="text-sm text-stone-500">
              {formData.isTop ? '已推荐' : '未推荐'}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isTop}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, isTop: e.target.checked }))
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
          </label>
        </div>
      </div>

      <div className="border border-stone-200 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowTimedSchedule(!showTimedSchedule)}
          className="w-full flex items-center justify-between p-4 bg-stone-50 hover:bg-stone-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            <span className="font-medium text-stone-800">定时上架设置</span>
            {schedules.length > 0 && (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                {schedules.length} 个时段
              </span>
            )}
          </div>
          {showTimedSchedule ? (
            <ChevronUp className="w-5 h-5 text-stone-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-stone-500" />
          )}
        </button>

        {showTimedSchedule && (
          <div className="p-4 space-y-4">
            {schedules.length > 0 ? (
              schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="p-4 border border-stone-200 rounded-lg bg-white"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={schedule.isEnabled}
                          onChange={(e) =>
                            updateSchedule(schedule.id, { isEnabled: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                      </label>
                      <span className="text-sm font-medium text-stone-700">
                        {schedule.isEnabled ? '已启用' : '已禁用'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSchedule(schedule.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex-1">
                      <label className="block text-xs text-stone-500 mb-1">上架时间</label>
                      <input
                        type="time"
                        value={schedule.startTime}
                        onChange={(e) =>
                          updateSchedule(schedule.id, { startTime: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                      />
                    </div>
                    <span className="text-stone-400 mt-5">至</span>
                    <div className="flex-1">
                      <label className="block text-xs text-stone-500 mb-1">下架时间</label>
                      <input
                        type="time"
                        value={schedule.endTime}
                        onChange={(e) =>
                          updateSchedule(schedule.id, { endTime: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-stone-500 mb-2">重复周期</label>
                    <div className="flex gap-2">
                      {weekDays.map((day) => (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => toggleDay(schedule.id, day.value)}
                          className={cn(
                            'w-8 h-8 rounded-full text-sm font-medium transition-colors',
                            schedule.repeatDays.includes(day.value)
                              ? 'bg-orange-500 text-white'
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                          )}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-stone-400 text-sm">
                暂无定时上架设置
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={addSchedule}
              className="w-full"
            >
              添加时段
            </Button>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">保存</Button>
      </div>
    </form>
  );
}
