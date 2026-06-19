import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Dish,
  DishCategory,
  Ingredient,
  DishIngredient,
  SaleOutRecord,
  TimedSchedule,
  SalesStats,
  RecordType,
} from '@/types';
import { generateId } from '@/utils/id';
import {
  mockDishes,
  mockIngredients,
  mockDishIngredients,
  mockSaleOutRecords,
  mockTimedSchedules,
  mockSalesStats,
} from '@/data/mockData';
import { isToday } from '@/utils/format';

interface AppState {
  dishes: Dish[];
  ingredients: Ingredient[];
  dishIngredients: DishIngredient[];
  saleOutRecords: SaleOutRecord[];
  timedSchedules: TimedSchedule[];
  salesStats: SalesStats[];

  filterCategory: DishCategory | 'all';
  filterStatus: 'all' | 'on_sale' | 'off_sale' | 'sold_out';
  searchKeyword: string;

  addDish: (dish: Omit<Dish, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDish: (id: string, dish: Partial<Dish>) => void;
  deleteDish: (id: string) => void;
  toggleOnSale: (id: string) => void;
  toggleSoldOut: (id: string, operator: string, remark?: string) => void;
  setDishTop: (id: string, isTop: boolean) => void;
  updateDishSortOrder: (dishes: Dish[]) => void;

  addSaleOutRecord: (record: Omit<SaleOutRecord, 'id' | 'createdAt'>) => void;

  addIngredient: (ingredient: Omit<Ingredient, 'id'>) => void;
  updateIngredient: (id: string, ingredient: Partial<Ingredient>) => void;
  deleteIngredient: (id: string) => void;

  addDishIngredient: (item: Omit<DishIngredient, 'id'>) => void;
  updateDishIngredient: (id: string, item: Partial<DishIngredient>) => void;
  deleteDishIngredient: (id: string) => void;

  addTimedSchedule: (schedule: Omit<TimedSchedule, 'id'>) => void;
  updateTimedSchedule: (id: string, schedule: Partial<TimedSchedule>) => void;
  deleteTimedSchedule: (id: string) => void;
  checkTimedSchedules: () => void;

  setFilterCategory: (category: DishCategory | 'all') => void;
  setFilterStatus: (status: 'all' | 'on_sale' | 'off_sale' | 'sold_out') => void;
  setSearchKeyword: (keyword: string) => void;

  getFilteredDishes: () => Dish[];
  getDishById: (id: string) => Dish | undefined;
  getDishCost: (dishId: string) => number;
  getDishProfitRate: (dishId: string) => number;
  getTodaySaleOutRecords: () => SaleOutRecord[];
  getSalesStats: () => SalesStats[];
  getDishIngredients: (dishId: string) => (DishIngredient & { ingredient: Ingredient })[];
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      dishes: mockDishes,
      ingredients: mockIngredients,
      dishIngredients: mockDishIngredients,
      saleOutRecords: mockSaleOutRecords,
      timedSchedules: mockTimedSchedules,
      salesStats: mockSalesStats,

      filterCategory: 'all',
      filterStatus: 'all',
      searchKeyword: '',

      addDish: (dish) => {
        const now = new Date().toISOString();
        const newDish: Dish = {
          ...dish,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          dishes: [...state.dishes, newDish],
        }));
      },

      updateDish: (id, dish) => {
        set((state) => ({
          dishes: state.dishes.map((d) =>
            d.id === id ? { ...d, ...dish, updatedAt: new Date().toISOString() } : d
          ),
        }));
      },

      deleteDish: (id) => {
        set((state) => ({
          dishes: state.dishes.filter((d) => d.id !== id),
          dishIngredients: state.dishIngredients.filter((di) => di.dishId !== id),
          timedSchedules: state.timedSchedules.filter((ts) => ts.dishId !== id),
        }));
      },

      toggleOnSale: (id) => {
        const dish = get().getDishById(id);
        if (!dish) return;

        const newIsOnSale = !dish.isOnSale;
        get().updateDish(id, { isOnSale: newIsOnSale });

        const type: RecordType = newIsOnSale ? 'auto_on_sale' : 'auto_off_sale';
        get().addSaleOutRecord({
          dishId: id,
          type,
          operator: '手动操作',
        });
      },

      toggleSoldOut: (id, operator, remark) => {
        const dish = get().getDishById(id);
        if (!dish) return;

        const newIsSoldOut = !dish.isSoldOut;
        get().updateDish(id, { isSoldOut: newIsSoldOut });

        const type: RecordType = newIsSoldOut ? 'sold_out' : 'restored';
        get().addSaleOutRecord({
          dishId: id,
          type,
          operator,
          remark,
        });
      },

      setDishTop: (id, isTop) => {
        get().updateDish(id, { isTop });
      },

      updateDishSortOrder: (dishes) => {
        const updatedDishes = dishes.map((dish, index) => ({
          ...dish,
          sortOrder: index + 1,
        }));
        set({ dishes: updatedDishes });
      },

      addSaleOutRecord: (record) => {
        const newRecord: SaleOutRecord = {
          ...record,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          saleOutRecords: [newRecord, ...state.saleOutRecords],
        }));
      },

      addIngredient: (ingredient) => {
        const newIngredient: Ingredient = {
          ...ingredient,
          id: generateId(),
        };
        set((state) => ({
          ingredients: [...state.ingredients, newIngredient],
        }));
      },

      updateIngredient: (id, ingredient) => {
        set((state) => ({
          ingredients: state.ingredients.map((i) =>
            i.id === id ? { ...i, ...ingredient } : i
          ),
        }));
      },

      deleteIngredient: (id) => {
        set((state) => ({
          ingredients: state.ingredients.filter((i) => i.id !== id),
          dishIngredients: state.dishIngredients.filter((di) => di.ingredientId !== id),
        }));
      },

      addDishIngredient: (item) => {
        const newItem: DishIngredient = {
          ...item,
          id: generateId(),
        };
        set((state) => ({
          dishIngredients: [...state.dishIngredients, newItem],
        }));
      },

      updateDishIngredient: (id, item) => {
        set((state) => ({
          dishIngredients: state.dishIngredients.map((di) =>
            di.id === id ? { ...di, ...item } : di
          ),
        }));
      },

      deleteDishIngredient: (id) => {
        set((state) => ({
          dishIngredients: state.dishIngredients.filter((di) => di.id !== id),
        }));
      },

      addTimedSchedule: (schedule) => {
        const newSchedule: TimedSchedule = {
          ...schedule,
          id: generateId(),
        };
        set((state) => ({
          timedSchedules: [...state.timedSchedules, newSchedule],
        }));
      },

      updateTimedSchedule: (id, schedule) => {
        set((state) => ({
          timedSchedules: state.timedSchedules.map((ts) =>
            ts.id === id ? { ...ts, ...schedule } : ts
          ),
        }));
      },

      deleteTimedSchedule: (id) => {
        set((state) => ({
          timedSchedules: state.timedSchedules.filter((ts) => ts.id !== id),
        }));
      },

      checkTimedSchedules: () => {
        const now = new Date();
        const currentDay = now.getDay();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        const { timedSchedules, dishes, addSaleOutRecord, updateDish } = get();

        timedSchedules.forEach((schedule) => {
          if (!schedule.isEnabled) return;
          if (!schedule.repeatDays.includes(currentDay)) return;

          const dish = dishes.find((d) => d.id === schedule.dishId);
          if (!dish) return;

          const shouldBeOnSale =
            currentTime >= schedule.startTime && currentTime < schedule.endTime;

          if (shouldBeOnSale && !dish.isOnSale) {
            updateDish(dish.id, { isOnSale: true });
            addSaleOutRecord({
              dishId: dish.id,
              type: 'auto_on_sale',
              operator: '系统',
              remark: '定时上架',
            });
          } else if (!shouldBeOnSale && dish.isOnSale) {
            updateDish(dish.id, { isOnSale: false });
            addSaleOutRecord({
              dishId: dish.id,
              type: 'auto_off_sale',
              operator: '系统',
              remark: '定时下架',
            });
          }
        });
      },

      setFilterCategory: (category) => {
        set({ filterCategory: category });
      },

      setFilterStatus: (status) => {
        set({ filterStatus: status });
      },

      setSearchKeyword: (keyword) => {
        set({ searchKeyword: keyword });
      },

      getFilteredDishes: () => {
        const { dishes, filterCategory, filterStatus, searchKeyword } = get();
        let filtered = [...dishes];

        if (filterCategory !== 'all') {
          filtered = filtered.filter((d) => d.category === filterCategory);
        }

        if (filterStatus !== 'all') {
          if (filterStatus === 'on_sale') {
            filtered = filtered.filter((d) => d.isOnSale && !d.isSoldOut);
          } else if (filterStatus === 'off_sale') {
            filtered = filtered.filter((d) => !d.isOnSale);
          } else if (filterStatus === 'sold_out') {
            filtered = filtered.filter((d) => d.isSoldOut);
          }
        }

        if (searchKeyword.trim()) {
          const keyword = searchKeyword.toLowerCase();
          filtered = filtered.filter((d) => d.name.toLowerCase().includes(keyword));
        }

        filtered.sort((a, b) => {
          if (a.isTop && !b.isTop) return -1;
          if (!a.isTop && b.isTop) return 1;
          return a.sortOrder - b.sortOrder;
        });

        return filtered;
      },

      getDishById: (id) => {
        return get().dishes.find((d) => d.id === id);
      },

      getDishCost: (dishId) => {
        const { dishIngredients, ingredients } = get();
        const items = dishIngredients.filter((di) => di.dishId === dishId);

        let totalCost = 0;
        items.forEach((item) => {
          const ingredient = ingredients.find((i) => i.id === item.ingredientId);
          if (ingredient) {
            totalCost += ingredient.unitPrice * item.quantity;
          }
        });

        return Number(totalCost.toFixed(2));
      },

      getDishProfitRate: (dishId) => {
        const dish = get().getDishById(dishId);
        if (!dish || dish.price <= 0) return 0;

        const cost = get().getDishCost(dishId);
        const profit = dish.price - cost;
        return Number((profit / dish.price).toFixed(4));
      },

      getTodaySaleOutRecords: () => {
        return get().saleOutRecords.filter((r) => isToday(r.createdAt));
      },

      getSalesStats: () => {
        return get().salesStats;
      },

      getDishIngredients: (dishId) => {
        const { dishIngredients, ingredients } = get();
        return dishIngredients
          .filter((di) => di.dishId === dishId)
          .map((di) => ({
            ...di,
            ingredient: ingredients.find((i) => i.id === di.ingredientId)!,
          }))
          .filter((item) => item.ingredient);
      },
    }),
    {
      name: 'dish-manager-storage',
    }
  )
);
