import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Percent,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Badge } from '@/components/common/Badge';
import { useAppStore } from '@/store/useAppStore';
import { formatPrice, formatDateTime } from '@/utils/format';
import { RECORD_TYPE_LABELS } from '@/types';
import { CATEGORY_LABELS } from '@/types';

const CATEGORY_COLORS = {
  hot: '#FF6B35',
  cold: '#2D5016',
  staple: '#EAB308',
  drink: '#3B82F6',
};

export default function Statistics() {
  const { getSalesStats, getTodaySaleOutRecords, getDishById, getDishProfitRate } = useAppStore();

  const salesStats = getSalesStats();
  const saleOutRecords = getTodaySaleOutRecords();

  const totalQuantity = salesStats.reduce((sum, s) => sum + s.quantity, 0);
  const totalAmount = salesStats.reduce((sum, s) => sum + s.amount, 0);
  const soldOutCount = saleOutRecords.filter((r) => r.type === 'sold_out').length;
  const avgProfitRate =
    salesStats.length > 0
      ? salesStats.reduce((sum, s) => sum + getDishProfitRate(s.dishId), 0) / salesStats.length
      : 0;

  const categoryStats = salesStats.reduce((acc, stat) => {
    const category = stat.category;
    if (!acc[category]) {
      acc[category] = { name: CATEGORY_LABELS[category], value: 0, amount: 0 };
    }
    acc[category].value += stat.quantity;
    acc[category].amount += stat.amount;
    return acc;
  }, {} as Record<string, { name: string; value: number; amount: number }>);

  const pieData = Object.values(categoryStats);

  const topDishes = [...salesStats]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  const statCards = [
    {
      title: '今日总销量',
      value: `${totalQuantity} 份`,
      change: '+12.5%',
      trend: 'up',
      icon: TrendingUp,
      color: 'bg-orange-500',
      lightColor: 'bg-orange-50',
      iconColor: 'text-orange-500',
    },
    {
      title: '今日销售额',
      value: formatPrice(totalAmount),
      change: '+8.3%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
      iconColor: 'text-green-500',
    },
    {
      title: '沽清次数',
      value: `${soldOutCount} 次`,
      change: '-2次',
      trend: 'down',
      icon: AlertTriangle,
      color: 'bg-red-500',
      lightColor: 'bg-red-50',
      iconColor: 'text-red-500',
    },
    {
      title: '平均毛利率',
      value: `${(avgProfitRate * 100).toFixed(1)}%`,
      change: '+2.1%',
      trend: 'up',
      icon: Percent,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      iconColor: 'text-blue-500',
    },
  ];

  return (
    <div className="flex flex-col h-screen">
      <Header title="统计报表" subtitle="查看当日销量数据和沽清记录" />

      <div className="flex-1 overflow-y-auto bg-stone-50 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {statCards.map((card, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl ${card.lightColor} flex items-center justify-center`}
                >
                  <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${
                    card.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {card.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {card.change}
                </div>
              </div>
              <p className="text-2xl font-bold text-stone-800 mb-1">{card.value}</p>
              <p className="text-sm text-stone-500">{card.title}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200 p-5">
            <h3 className="text-lg font-semibold text-stone-800 mb-4">销量排行 TOP 10</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topDishes} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    dataKey="dishName"
                    type="category"
                    width={80}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e7e5e4',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    formatter={(value: number) => [`${value} 份`, '销量']}
                  />
                  <Bar
                    dataKey="quantity"
                    fill="#FF6B35"
                    radius={[0, 6, 6, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <h3 className="text-lg font-semibold text-stone-800 mb-4">分类销量占比</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => {
                      const categoryKey = Object.keys(CATEGORY_LABELS).find(
                        (k) => CATEGORY_LABELS[k as keyof typeof CATEGORY_LABELS] === entry.name
                      );
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            CATEGORY_COLORS[
                              categoryKey as keyof typeof CATEGORY_COLORS
                            ] || '#9ca3af'
                          }
                        />
                      );
                    })}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, _name: string, props: any) => [
                      `${value} 份`,
                      props.payload.name,
                    ]}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e7e5e4',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value: string) => (
                      <span className="text-sm text-stone-600">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <h3 className="text-lg font-semibold text-stone-800 mb-4">销售额排行</h3>
            <div className="space-y-3">
              {[...salesStats]
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 8)
                .map((stat, index) => (
                  <div
                    key={stat.dishId}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-stone-50 transition-colors"
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0
                          ? 'bg-yellow-100 text-yellow-700'
                          : index === 1
                          ? 'bg-stone-200 text-stone-600'
                          : index === 2
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-stone-800 truncate">{stat.dishName}</p>
                      <p className="text-sm text-stone-500">{stat.quantity} 份</p>
                    </div>
                    <p className="font-semibold text-orange-600">{formatPrice(stat.amount)}</p>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <h3 className="text-lg font-semibold text-stone-800 mb-4">今日沽清记录</h3>
            <div className="space-y-4">
              {saleOutRecords.length > 0 ? (
                <div className="relative">
                  <div className="absolute left-[18px] top-2 bottom-2 w-px bg-stone-200" />
                  {saleOutRecords.slice(0, 8).map((record) => {
                    const dish = getDishById(record.dishId);
                    const isSoldOut = record.type === 'sold_out';
                    return (
                      <div key={record.id} className="relative pl-10 pb-4 last:pb-0">
                        <div
                          className={`absolute left-[10px] top-1 w-4 h-4 rounded-full border-2 border-white ${
                            isSoldOut ? 'bg-red-500' : 'bg-green-500'
                          }`}
                        />
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-medium text-stone-800 truncate">
                              {dish?.name || '未知菜品'}
                            </p>
                            <p className="text-sm text-stone-500">{record.operator}</p>
                            {record.remark && (
                              <p className="text-sm text-stone-400 mt-1">{record.remark}</p>
                            )}
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <Badge variant={isSoldOut ? 'danger' : 'success'}>
                              {RECORD_TYPE_LABELS[record.type]}
                            </Badge>
                            <p className="text-xs text-stone-400 mt-1 flex items-center gap-1 justify-end">
                              <Clock className="w-3 h-3" />
                              {formatDateTime(record.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-stone-400">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>今日暂无沽清记录</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
