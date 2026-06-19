import { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { DishCard } from '@/components/dish/DishCard';
import { DishForm } from '@/components/dish/DishForm';
import { Button } from '@/components/common/Button';
import { Drawer } from '@/components/common/Drawer';
import { Modal } from '@/components/common/Modal';
import Empty from '@/components/Empty';
import { useAppStore } from '@/store/useAppStore';
import { Dish, DishCategory, CATEGORY_LABELS, TimedSchedule } from '@/types';
import { cn } from '@/lib/utils';

const categories: (DishCategory | 'all')[] = ['all', 'hot', 'cold', 'staple', 'drink'];

const statusFilters = [
  { value: 'all', label: '全部' },
  { value: 'on_sale', label: '在售' },
  { value: 'off_sale', label: '下架' },
  { value: 'sold_out', label: '售罄' },
];

export default function DishList() {
  const {
    getFilteredDishes,
    filterCategory,
    filterStatus,
    searchKeyword,
    setFilterCategory,
    setFilterStatus,
    setSearchKeyword,
    addDish,
    updateDish,
    deleteDish,
    toggleSoldOut,
    addTimedSchedule,
    updateTimedSchedule,
    deleteTimedSchedulesByDishId,
  } = useAppStore();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Dish | null>(null);
  const [soldOutConfirm, setSoldOutConfirm] = useState<Dish | null>(null);
  const [remark, setRemark] = useState('');

  const dishes = getFilteredDishes();

  const handleAdd = () => {
    setEditingDish(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (dish: Dish) => {
    setEditingDish(dish);
    setIsDrawerOpen(true);
  };

  const handleDelete = (dish: Dish) => {
    setDeleteConfirm(dish);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteDish(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  const handleToggleSoldOut = (dish: Dish) => {
    if (!dish.isSoldOut) {
      setSoldOutConfirm(dish);
      setRemark('');
    } else {
      toggleSoldOut(dish.id, '张师傅');
    }
  };

  const confirmSoldOut = () => {
    if (soldOutConfirm) {
      toggleSoldOut(soldOutConfirm.id, '张师傅', remark || undefined);
      setSoldOutConfirm(null);
    }
  };

  const handleSubmit = (
    data: Omit<Dish, 'id' | 'createdAt' | 'updatedAt'>,
    schedules: TimedSchedule[]
  ) => {
    if (editingDish) {
      updateDish(editingDish.id, data);
      deleteTimedSchedulesByDishId(editingDish.id);
      schedules.forEach((s) => {
        addTimedSchedule({ ...s, dishId: editingDish.id });
      });
    } else {
      const newDish = addDish(data);
      schedules.forEach((s) => {
        addTimedSchedule({ ...s, dishId: newDish.id });
      });
    }
    setIsDrawerOpen(false);
    setEditingDish(null);
  };

  return (
    <div className="flex flex-col h-screen">
      <Header
        title="菜品管理"
        subtitle="管理所有菜品信息、上下架与沽清状态"
        action={
          <Button icon={<Plus className="w-4 h-4" />} onClick={handleAdd}>
            新增菜品
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto bg-stone-50 p-6">
        <div className="bg-white rounded-xl border border-stone-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[240px] max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type="text"
                  placeholder="搜索菜品名称..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-stone-500" />
              <span className="text-sm text-stone-600">状态：</span>
              <div className="flex gap-1">
                {statusFilters.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => setFilterStatus(status.value as any)}
                    className={cn(
                      'px-3 py-1.5 text-sm rounded-lg transition-colors',
                      filterStatus === status.value
                        ? 'bg-orange-500 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    )}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  filterCategory === cat
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                )}
              >
                {cat === 'all' ? '全部分类' : CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>

        {dishes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
            {dishes.map((dish) => (
              <DishCard
                key={dish.id}
                dish={dish}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleSoldOut={handleToggleSoldOut}
              />
            ))}
          </div>
        ) : (
          <Empty
            title="暂无菜品"
            description="点击右上角新增菜品按钮添加第一个菜品"
            action={
              <Button icon={<Plus className="w-4 h-4" />} onClick={handleAdd}>
                新增菜品
              </Button>
            }
          />
        )}
      </div>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingDish ? '编辑菜品' : '新增菜品'}
        size="lg"
      >
        <DishForm
          dish={editingDish}
          onSubmit={handleSubmit}
          onCancel={() => setIsDrawerOpen(false)}
        />
      </Drawer>

      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="确认删除"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              取消
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              确认删除
            </Button>
          </div>
        }
      >
        <p className="text-stone-600">
          确定要删除菜品
          <span className="font-semibold text-stone-800">「{deleteConfirm?.name}」</span>
          吗？删除后无法恢复。
        </p>
      </Modal>

      <Modal
        isOpen={!!soldOutConfirm}
        onClose={() => setSoldOutConfirm(null)}
        title="沽清确认"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setSoldOutConfirm(null)}>
              取消
            </Button>
            <Button variant="danger" onClick={confirmSoldOut}>
              确认沽清
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-stone-600">
            确定要将菜品
            <span className="font-semibold text-stone-800">
              「{soldOutConfirm?.name}」
            </span>
            标记为沽清吗？
          </p>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              沽清备注（可选）
            </label>
            <input
              type="text"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="例如：今日已售罄"
              className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-colors"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
