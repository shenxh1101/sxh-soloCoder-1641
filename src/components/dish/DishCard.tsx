import {
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  AlertTriangle,
  Pin,
  PinOff,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Dish, CATEGORY_LABELS, CATEGORY_COLORS } from '@/types';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { formatPrice } from '@/utils/format';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

interface DishCardProps {
  dish: Dish;
  onEdit: (dish: Dish) => void;
  onDelete: (dish: Dish) => void;
  onToggleSoldOut: (dish: Dish) => void;
}

export function DishCard({ dish, onEdit, onDelete, onToggleSoldOut }: DishCardProps) {
  const { setDishTop, toggleOnSale } = useAppStore();

  const getStatusBadge = () => {
    if (dish.isSoldOut) {
      return (
        <Badge variant="danger" className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          售罄
        </Badge>
      );
    }
    if (dish.isOnSale) {
      return (
        <Badge variant="success" className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          在售
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="flex items-center gap-1">
        <Ban className="w-3 h-3" />
        下架
      </Badge>
    );
  };

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-stone-200 overflow-hidden group',
        'transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
        dish.isSoldOut && 'opacity-75',
        !dish.isOnSale && 'border-dashed'
      )}
    >
      <div className={cn(
        'relative aspect-square overflow-hidden bg-stone-100',
        !dish.isOnSale && 'grayscale'
      )}>
        <img
          src={dish.image}
          alt={dish.name}
          className={cn(
            'w-full h-full object-cover transition-transform duration-500',
            'group-hover:scale-110',
            dish.isSoldOut && 'grayscale'
          )}
        />
        {dish.isTop && (
          <div className="absolute top-3 left-3">
            <Badge variant="orange" className="flex items-center gap-1">
              <Pin className="w-3 h-3" />
              推荐
            </Badge>
          </div>
        )}
        <div className="absolute top-3 right-3">{getStatusBadge()}</div>
        {dish.isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm rotate-[-15deg] shadow-lg">
              已售罄
            </div>
          </div>
        )}
        {!dish.isOnSale && !dish.isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="bg-stone-700 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
              已下架
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-stone-800 text-lg">{dish.name}</h3>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Badge variant="default" className={CATEGORY_COLORS[dish.category]}>
            {CATEGORY_LABELS[dish.category]}
          </Badge>
        </div>

        {dish.description && (
          <p className="text-sm text-stone-500 mb-3 line-clamp-2">{dish.description}</p>
        )}

        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-2xl font-bold text-orange-600">{formatPrice(dish.price)}</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Button
              variant={dish.isOnSale ? 'secondary' : 'success'}
              size="sm"
              className="flex-1"
              icon={dish.isOnSale ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              onClick={() => toggleOnSale(dish.id)}
            >
              {dish.isOnSale ? '下架' : '上架'}
            </Button>
            <Button
              variant={dish.isSoldOut ? 'success' : 'danger'}
              size="sm"
              className="flex-1"
              onClick={() => onToggleSoldOut(dish)}
              disabled={!dish.isOnSale && !dish.isSoldOut}
            >
              {dish.isSoldOut ? '恢复售卖' : '沽清'}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 p-2"
              onClick={() => setDishTop(dish.id, !dish.isTop)}
              title={dish.isTop ? '取消置顶' : '置顶推荐'}
            >
              {dish.isTop ? (
                <span className="flex items-center gap-1 text-orange-600">
                  <PinOff className="w-4 h-4" />
                  取消置顶
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Pin className="w-4 h-4" />
                  置顶
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 p-2"
              onClick={() => onEdit(dish)}
            >
              <span className="flex items-center gap-1">
                <Edit className="w-4 h-4" />
                编辑
              </span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="p-2 text-red-500 hover:text-red-600"
              onClick={() => onDelete(dish)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
