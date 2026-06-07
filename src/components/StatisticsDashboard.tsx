import { Package, ShoppingCart, Clock, CheckCircle, Layers, Archive, Scale } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { SALE_STATUS_LABELS, METEORITE_CATEGORIES } from '@/types';

const StatisticsDashboard = () => {
  const getFilteredMeteorites = useStore((state) => state.getFilteredMeteorites);
  const meteorites = getFilteredMeteorites();
  const totalCount = meteorites.length;

  const saleStatusCounts = {
    available: meteorites.filter((m) => m.saleStatus === 'available').length,
    reserved: meteorites.filter((m) => m.saleStatus === 'reserved').length,
    sold: meteorites.filter((m) => m.saleStatus === 'sold').length,
  };

  const categoryCounts = METEORITE_CATEGORIES.map((category) => ({
    name: category,
    count: meteorites.filter((m) => m.category === category).length,
  })).filter((c) => c.count > 0);

  const maxCategoryCount = Math.max(...categoryCounts.map((c) => c.count), 1);

  const displayCaseMap = meteorites.reduce((acc, m) => {
    const caseGroup = m.displayCase.split('-')[0];
    acc[caseGroup] = (acc[caseGroup] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const displayCaseCounts = Object.entries(displayCaseMap)
    .map(([name, count]) => ({ name: `${name}组展柜`, count }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const maxDisplayCaseCount = Math.max(...displayCaseCounts.map((c) => c.count), 1);

  const weightRanges = [
    { label: '0-100g', min: 0, max: 100 },
    { label: '100-500g', min: 100, max: 500 },
    { label: '500-1000g', min: 500, max: 1000 },
    { label: '1000g+', min: 1000, max: Infinity },
  ];

  const weightCounts = weightRanges.map((range) => ({
    ...range,
    count: meteorites.filter((m) => m.weight >= range.min && m.weight < range.max).length,
  }));

  const maxWeightCount = Math.max(...weightCounts.map((w) => w.count), 1);

  const totalWeight = meteorites.reduce((sum, m) => sum + m.weight, 0);

  const StatCard = ({
    icon: Icon,
    label,
    value,
    subValue,
    colorClass,
  }: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    subValue?: string;
    colorClass: string;
  }) => (
    <div className="bg-archive-card/70 backdrop-blur-sm rounded-lg archive-border p-5 card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-archive-cream/60 mb-1">{label}</p>
          <p className="text-3xl font-display font-bold text-archive-cream">{value}</p>
          {subValue && <p className="text-xs text-archive-cream/40 mt-1">{subValue}</p>}
        </div>
        <div className={`w-12 h-12 rounded-lg ${colorClass} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const BarItem = ({
    label,
    count,
    maxCount,
    barColor,
  }: {
    label: string;
    count: number;
    maxCount: number;
    barColor: string;
  }) => {
    const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
    return (
      <div className="flex items-center gap-3">
        <div className="w-28 flex-shrink-0 text-sm text-archive-cream/70 truncate">{label}</div>
        <div className="flex-1 h-5 bg-archive-bg/50 rounded-full overflow-hidden archive-border">
          <div
            className={`h-full ${barColor} rounded-full transition-all duration-500 ease-out`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="w-10 text-right text-sm font-medium text-archive-cream/90">{count}</div>
      </div>
    );
  };

  return (
    <div className="bg-archive-card/30 backdrop-blur-sm border-b border-archive-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center space-x-2 mb-6">
          <Layers className="w-5 h-5 text-archive-gold" />
          <h2 className="font-display text-lg font-semibold text-archive-cream">收藏统计看板</h2>
          <span className="text-xs text-archive-cream/40 ml-2">
            基于当前筛选条件，共 {totalCount} 件藏品
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Package}
            label="藏品总数"
            value={totalCount}
            subValue={`总重量 ${totalWeight.toLocaleString()}g`}
            colorClass="bg-archive-gold"
          />
          <StatCard
            icon={ShoppingCart}
            label={SALE_STATUS_LABELS.available}
            value={saleStatusCounts.available}
            subValue={`占比 ${totalCount > 0 ? Math.round((saleStatusCounts.available / totalCount) * 100) : 0}%`}
            colorClass="bg-archive-available"
          />
          <StatCard
            icon={Clock}
            label={SALE_STATUS_LABELS.reserved}
            value={saleStatusCounts.reserved}
            subValue={`占比 ${totalCount > 0 ? Math.round((saleStatusCounts.reserved / totalCount) * 100) : 0}%`}
            colorClass="bg-archive-reserved"
          />
          <StatCard
            icon={CheckCircle}
            label={SALE_STATUS_LABELS.sold}
            value={saleStatusCounts.sold}
            subValue={`占比 ${totalCount > 0 ? Math.round((saleStatusCounts.sold / totalCount) * 100) : 0}%`}
            colorClass="bg-archive-sold"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-archive-card/50 backdrop-blur-sm rounded-lg archive-border p-5">
            <div className="flex items-center space-x-2 mb-4">
              <Layers className="w-4 h-4 text-archive-gold" />
              <h3 className="font-display text-sm font-semibold text-archive-cream/90">分类分布</h3>
            </div>
            <div className="space-y-2">
              {categoryCounts.length > 0 ? (
                categoryCounts.map((category) => (
                  <BarItem
                    key={category.name}
                    label={category.name}
                    count={category.count}
                    maxCount={maxCategoryCount}
                    barColor="bg-archive-gold/80"
                  />
                ))
              ) : (
                <p className="text-sm text-archive-cream/40 text-center py-4">暂无数据</p>
              )}
            </div>
          </div>

          <div className="bg-archive-card/50 backdrop-blur-sm rounded-lg archive-border p-5">
            <div className="flex items-center space-x-2 mb-4">
              <Archive className="w-4 h-4 text-archive-gold" />
              <h3 className="font-display text-sm font-semibold text-archive-cream/90">展柜分布</h3>
            </div>
            <div className="space-y-2">
              {displayCaseCounts.length > 0 ? (
                displayCaseCounts.map((item) => (
                  <BarItem
                    key={item.name}
                    label={item.name}
                    count={item.count}
                    maxCount={maxDisplayCaseCount}
                    barColor="bg-archive-gold/60"
                  />
                ))
              ) : (
                <p className="text-sm text-archive-cream/40 text-center py-4">暂无数据</p>
              )}
            </div>
          </div>

          <div className="bg-archive-card/50 backdrop-blur-sm rounded-lg archive-border p-5">
            <div className="flex items-center space-x-2 mb-4">
              <Scale className="w-4 h-4 text-archive-gold" />
              <h3 className="font-display text-sm font-semibold text-archive-cream/90">重量区间概览</h3>
            </div>
            <div className="space-y-2">
              {weightCounts.map((range) => (
                <BarItem
                  key={range.label}
                  label={range.label}
                  count={range.count}
                  maxCount={maxWeightCount}
                  barColor="bg-archive-gold/40"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsDashboard;
