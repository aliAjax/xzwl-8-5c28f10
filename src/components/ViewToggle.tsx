import { useMemo } from 'react';
import { LayoutGrid, Archive } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { ViewMode } from '@/types';

const ViewToggle = () => {
  const viewMode = useStore((state) => state.viewMode);
  const setViewMode = useStore((state) => state.setViewMode);
  const meteoritesData = useStore((state) => state.meteorites);
  const filters = useStore((state) => state.filters);
  const getFilteredMeteorites = useStore((state) => state.getFilteredMeteorites);

  const filteredMeteorites = useMemo(() => {
    return getFilteredMeteorites();
  }, [meteoritesData, filters, getFilteredMeteorites]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="text-archive-cream/60 text-sm">
        共找到 <span className="text-archive-gold font-semibold">{filteredMeteorites.length}</span> 件藏品
      </div>
      <div className="inline-flex bg-archive-card archive-border rounded-lg p-1">
        <button
          onClick={() => setViewMode('list' as ViewMode)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            viewMode === 'list'
              ? 'bg-archive-gold text-archive-bg shadow-md'
              : 'text-archive-cream/60 hover:text-archive-cream hover:bg-archive-gold/10'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>卡片列表</span>
        </button>
        <button
          onClick={() => setViewMode('displayCase' as ViewMode)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            viewMode === 'displayCase'
              ? 'bg-archive-gold text-archive-bg shadow-md'
              : 'text-archive-cream/60 hover:text-archive-cream hover:bg-archive-gold/10'
          }`}
        >
          <Archive className="w-4 h-4" />
          <span>展示柜视图</span>
        </button>
      </div>
    </div>
  );
};

export default ViewToggle;
