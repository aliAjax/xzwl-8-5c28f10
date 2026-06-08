import { useMemo, useState } from 'react';
import { LayoutGrid, Archive, Download, AlertCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { ViewMode } from '@/types';
import { exportToCSV } from '@/utils/exportCSV';

const ViewToggle = () => {
  const viewMode = useStore((state) => state.viewMode);
  const setViewMode = useStore((state) => state.setViewMode);
  const meteoritesData = useStore((state) => state.meteorites);
  const filters = useStore((state) => state.filters);
  const getFilteredMeteorites = useStore((state) => state.getFilteredMeteorites);
  const [showEmptyAlert, setShowEmptyAlert] = useState(false);

  const filteredMeteorites = useMemo(() => {
    return getFilteredMeteorites();
  }, [meteoritesData, filters, getFilteredMeteorites]);

  const handleExport = () => {
    if (filteredMeteorites.length === 0) {
      setShowEmptyAlert(true);
      setTimeout(() => setShowEmptyAlert(false), 3000);
      return;
    }
    exportToCSV(filteredMeteorites, '陨石藏品列表');
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="flex items-center space-x-4">
        <div className="text-archive-cream/60 text-sm">
          共找到 <span className="text-archive-gold font-semibold">{filteredMeteorites.length}</span> 件藏品
        </div>
        {showEmptyAlert && (
          <div className="flex items-center space-x-1 text-sm text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-md animate-pulse">
            <AlertCircle className="w-4 h-4" />
            <span>当前筛选结果为空，无法导出</span>
          </div>
        )}
      </div>
      <div className="flex items-center space-x-3">
        <button
          onClick={handleExport}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            filteredMeteorites.length === 0
              ? 'bg-archive-card/50 text-archive-cream/30 cursor-not-allowed archive-border pointer-events-auto'
              : 'bg-archive-gold/20 text-archive-gold hover:bg-archive-gold/30 archive-border hover:shadow-md hover:shadow-archive-gold/20'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>导出CSV</span>
        </button>
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
    </div>
  );
};

export default ViewToggle;
