import { Filter, RotateCcw, Scale, Tag, ShoppingBag } from 'lucide-react';
import { useStore, minWeight, maxWeight } from '@/store/useStore';
import { METEORITE_CATEGORIES, SALE_STATUS_LABELS, SaleStatus } from '@/types';

const FilterPanel = () => {
  const { filters, setCategoryFilter, setWeightFilter, setSaleStatusFilter, resetFilters } = useStore();

  const handleMinWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const min = parseInt(e.target.value) || 0;
    const max = Math.max(min, filters.maxWeight);
    setWeightFilter(min, max);
  };

  const handleMaxWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const max = parseInt(e.target.value) || maxWeight + 100;
    const min = Math.min(filters.minWeight, max);
    setWeightFilter(min, max);
  };

  const hasActiveFilters = filters.category !== 'all' || 
    filters.minWeight > 0 || 
    filters.maxWeight < maxWeight + 100 || 
    filters.saleStatus !== 'all';

  return (
    <div className="bg-archive-card/50 backdrop-blur-sm border-b border-archive-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-archive-gold" />
            <h2 className="font-display text-lg font-semibold text-archive-cream">筛选条件</h2>
          </div>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center space-x-1 text-sm text-archive-gold/70 hover:text-archive-gold transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>重置筛选</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Tag className="w-4 h-4 text-archive-gold" />
              <label className="text-sm font-medium text-archive-cream/80">陨石分类</label>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                  filters.category === 'all'
                    ? 'bg-archive-gold text-archive-bg font-medium shadow-md shadow-archive-gold/30'
                    : 'bg-archive-bg/50 text-archive-cream/70 hover:bg-archive-gold/10 hover:text-archive-cream border border-archive-border'
                }`}
              >
                全部
              </button>
              {METEORITE_CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setCategoryFilter(category)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                    filters.category === category
                      ? 'bg-archive-gold text-archive-bg font-medium shadow-md shadow-archive-gold/30'
                      : 'bg-archive-bg/50 text-archive-cream/70 hover:bg-archive-gold/10 hover:text-archive-cream border border-archive-border'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Scale className="w-4 h-4 text-archive-gold" />
              <label className="text-sm font-medium text-archive-cream/80">
                重量范围: {filters.minWeight}g - {filters.maxWeight}g
              </label>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <label className="text-xs text-archive-cream/50 block mb-1">最小重量</label>
                  <input
                    type="range"
                    min={minWeight}
                    max={maxWeight + 100}
                    value={filters.minWeight}
                    onChange={handleMinWeightChange}
                    className="w-full h-2 bg-archive-border rounded-lg appearance-none cursor-pointer accent-archive-gold"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-archive-cream/50 block mb-1">最大重量</label>
                  <input
                    type="range"
                    min={minWeight}
                    max={maxWeight + 100}
                    value={filters.maxWeight}
                    onChange={handleMaxWeightChange}
                    className="w-full h-2 bg-archive-border rounded-lg appearance-none cursor-pointer accent-archive-gold"
                  />
                </div>
              </div>
              <div className="flex justify-between text-xs text-archive-cream/50">
                <span>{minWeight}g</span>
                <span>{maxWeight + 100}g</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-3">
              <ShoppingBag className="w-4 h-4 text-archive-gold" />
              <label className="text-sm font-medium text-archive-cream/80">出售状态</label>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['all', 'available', 'reserved', 'sold'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setSaleStatusFilter(status as SaleStatus | 'all')}
                  className={`px-4 py-2 text-sm rounded-md transition-all flex items-center space-x-2 ${
                    filters.saleStatus === status
                      ? status === 'available'
                        ? 'bg-archive-available text-white shadow-md shadow-archive-available/30'
                        : status === 'reserved'
                        ? 'bg-archive-reserved text-white shadow-md shadow-archive-reserved/30'
                        : status === 'sold'
                        ? 'bg-archive-sold text-white shadow-md shadow-archive-sold/30'
                        : 'bg-archive-gold text-archive-bg font-medium shadow-md shadow-archive-gold/30'
                      : 'bg-archive-bg/50 text-archive-cream/70 hover:bg-archive-gold/10 hover:text-archive-cream border border-archive-border'
                  }`}
                >
                  {status !== 'all' && (
                    <span className="w-2 h-2 rounded-full bg-white" />
                  )}
                  <span>{SALE_STATUS_LABELS[status]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
