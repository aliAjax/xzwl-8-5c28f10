import { useState } from 'react';
import { Bookmark, Plus, X, Trash2, Check } from 'lucide-react';
import { useStore, maxWeight } from '@/store/useStore';
import { SALE_STATUS_LABELS, SaleStatus, FilterState } from '@/types';

const FilterViews = () => {
  const {
    filterViews,
    activeFilterViewId,
    applyFilterView,
    deleteFilterView,
    saveFilterView,
    clearActiveFilterView,
    filters,
    resetFilters,
  } = useStore();

  const [isAdding, setIsAdding] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  const [viewToDelete, setViewToDelete] = useState<string | null>(null);

  const getFilterDescription = (filters: FilterState) => {
    const parts = [];
    if (filters.category !== 'all') {
      parts.push(filters.category);
    }
    if (filters.minWeight > 0 || filters.maxWeight < maxWeight + 100) {
      parts.push(`${filters.minWeight}g-${filters.maxWeight}g`);
    }
    if (filters.saleStatus !== 'all') {
      parts.push(SALE_STATUS_LABELS[filters.saleStatus as SaleStatus | 'all']);
    }
    return parts.length > 0 ? parts.join(' · ') : '全部';
  };

  const handleSaveView = () => {
    if (newViewName.trim()) {
      saveFilterView(newViewName.trim());
      setNewViewName('');
      setIsAdding(false);
    }
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewViewName('');
  };

  const handleApplyView = (id: string) => {
    if (activeFilterViewId !== id) {
      applyFilterView(id);
    }
  };

  const handleReset = () => {
    resetFilters();
    clearActiveFilterView();
  };

  const hasActiveFilters = filters.category !== 'all' || 
    filters.minWeight > 0 || 
    filters.maxWeight < maxWeight + 100 || 
    filters.saleStatus !== 'all';

  return (
    <div className="bg-archive-card/30 backdrop-blur-sm border-b border-archive-gold/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center space-x-4 overflow-x-auto scrollbar-hide">
          <div className="flex items-center space-x-2 text-archive-gold shrink-0">
            <Bookmark className="w-4 h-4" />
            <span className="text-sm font-medium">筛选视图</span>
          </div>

          <button
            onClick={handleReset}
            className={`shrink-0 px-3 py-1.5 text-sm rounded-md transition-all flex items-center space-x-2 ${
              activeFilterViewId === null && !hasActiveFilters
                ? 'bg-archive-gold text-archive-bg font-medium shadow-md shadow-archive-gold/30'
                : 'bg-archive-bg/50 text-archive-cream/70 hover:bg-archive-gold/10 hover:text-archive-cream border border-archive-border'
            }`}
          >
            <span>全部</span>
          </button>

          {filterViews.map((view) => (
            <div
              key={view.id}
              className="relative group shrink-0"
              onMouseEnter={() => setViewToDelete(null)}
            >
              <button
                onClick={() => handleApplyView(view.id)}
                className={`px-3 py-1.5 text-sm rounded-md transition-all flex items-center space-x-2 ${
                  activeFilterViewId === view.id
                    ? 'bg-archive-gold text-archive-bg font-medium shadow-md shadow-archive-gold/30'
                    : 'bg-archive-bg/50 text-archive-cream/70 hover:bg-archive-gold/10 hover:text-archive-cream border border-archive-border'
                }`}
              >
                <span className="max-w-[120px] truncate">{view.name}</span>
              </button>
              
              <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewToDelete(viewToDelete === view.id ? null : view.id);
                  }}
                  className="w-5 h-5 bg-archive-sold text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {viewToDelete === view.id && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-archive-card border border-archive-gold/30 rounded-lg shadow-lg p-3 z-20 min-w-[200px]">
                  <p className="text-sm text-archive-cream mb-2">确定删除视图 "{view.name}"？</p>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setViewToDelete(null)}
                      className="px-3 py-1 text-xs text-archive-cream/70 hover:text-archive-cream transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={() => {
                        deleteFilterView(view.id);
                        setViewToDelete(null);
                      }}
                      className="px-3 py-1 text-xs bg-archive-sold text-white rounded hover:bg-red-600 transition-colors flex items-center space-x-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>删除</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isAdding ? (
            <div className="flex items-center space-x-2 shrink-0">
              <input
                type="text"
                value={newViewName}
                onChange={(e) => setNewViewName(e.target.value)}
                placeholder="输入视图名称..."
                className="px-3 py-1.5 text-sm bg-archive-bg border border-archive-gold/30 rounded-md text-archive-cream placeholder-archive-cream/40 focus:outline-none focus:border-archive-gold w-40"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveView();
                  if (e.key === 'Escape') handleCancelAdd();
                }}
              />
              <button
                onClick={handleSaveView}
                disabled={!newViewName.trim()}
                className="p-1.5 bg-archive-available text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancelAdd}
                className="p-1.5 bg-archive-border text-archive-cream/70 rounded-md hover:bg-archive-gold/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="shrink-0 px-3 py-1.5 text-sm rounded-md transition-all flex items-center space-x-2 bg-archive-bg/50 text-archive-cream/70 hover:bg-archive-gold/10 hover:text-archive-gold border border-dashed border-archive-gold/30 hover:border-archive-gold/60"
            >
              <Plus className="w-4 h-4" />
              <span>保存视图</span>
            </button>
          )}

          {activeFilterViewId && (
            <div className="ml-auto shrink-0 text-xs text-archive-cream/50">
              {getFilterDescription(filterViews.find(v => v.id === activeFilterViewId)?.filters || filters)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterViews;
