export type DishCategory = 'hot' | 'cold' | 'staple' | 'drink';

export interface Dish {
  id: string;
  name: string;
  category: DishCategory;
  price: number;
  image: string;
  isOnSale: boolean;
  isSoldOut: boolean;
  sortOrder: number;
  isTop: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  unitPrice: number;
}

export interface DishIngredient {
  id: string;
  dishId: string;
  ingredientId: string;
  quantity: number;
}

export type RecordType = 'sold_out' | 'restored' | 'auto_on_sale' | 'auto_off_sale';

export interface SaleOutRecord {
  id: string;
  dishId: string;
  type: RecordType;
  operator: string;
  remark?: string;
  createdAt: string;
}

export interface TimedSchedule {
  id: string;
  dishId: string;
  startTime: string;
  endTime: string;
  isEnabled: boolean;
  repeatDays: number[];
}

export interface SalesStats {
  dishId: string;
  dishName: string;
  quantity: number;
  amount: number;
  category: DishCategory;
}

export const CATEGORY_LABELS: Record<DishCategory, string> = {
  hot: '热菜',
  cold: '凉菜',
  staple: '主食',
  drink: '饮品',
};

export const CATEGORY_COLORS: Record<DishCategory, string> = {
  hot: 'bg-orange-100 text-orange-700',
  cold: 'bg-green-100 text-green-700',
  staple: 'bg-yellow-100 text-yellow-700',
  drink: 'bg-blue-100 text-blue-700',
};

export const RECORD_TYPE_LABELS: Record<RecordType, string> = {
  sold_out: '沽清',
  restored: '恢复售卖',
  auto_on_sale: '定时上架',
  auto_off_sale: '定时下架',
};
