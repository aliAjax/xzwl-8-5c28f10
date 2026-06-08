import { useMemo, useState, useCallback } from 'react';
import { Inbox, Archive, Scale, Package, LayoutGrid, Play, X, Check, Move, AlertTriangle, ChevronDown, Layers } from 'lucide-react';
import { Meteorite, SALE_STATUS_LABELS, SALE_STATUS_COLORS } from '@/types';
import { useStore } from '@/store/useStore';
import MiniMeteoriteCard from './MiniMeteoriteCard';

interface DisplayCaseGroup {
  displayCase: string;
  meteorites: Meteorite[];
  totalWeight: number;
}

const StatusBadge = ({ status, count }: { status: 'available' | 'reserved' | 'sold'; count: number }) => {
  if (count === 0) return null;
  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${SALE_STATUS_COLORS[status]}/20`}>
      <span className={`w-2 h-2 rounded-full ${SALE_STATUS_COLORS[status]}`} />
      <span className="text-xs text-archive-cream/70">
        {SALE_STATUS_LABELS[status]} {count}
      </span>
    </div>
  );
};

const DisplayCaseView = () => {
  const meteoritesData = useStore((state) => state.meteorites);
  const filters = useStore((state) => state.filters);
  const sort = useStore((state) => state.sort);
  const getFilteredMeteorites = useStore((state) => state.getFilteredMeteorites);
  const openCapacityPlanner = useStore((state) => state.openCapacityPlanner);
  const getDisplayCaseCapacityData = useStore((state) => state.getDisplayCaseCapacityData);
  const caseSimulation = useStore((state) => state.caseSimulation);
  const startCaseSimulation = useStore((state) => state.startCaseSimulation);
  const cancelCaseSimulation = useStore((state) => state.cancelCaseSimulation);
  const confirmCaseSimulation = useStore((state) => state.confirmCaseSimulation);
  const moveMeteoriteToCase = useStore((state) => state.moveMeteoriteToCase);
  const batchMoveMeteoritesToCase = useStore((state) => state.batchMoveMeteoritesToCase);
  const toggleMeteoriteSelection = useStore((state) => state.toggleMeteoriteSelection);
  const clearMeteoriteSelection = useStore((state) => state.clearMeteoriteSelection);
  const selectAllMeteoritesInCase = useStore((state) => state.selectAllMeteoritesInCase);
  const getSimulationMoveCount = useStore((state) => state.getSimulationMoveCount);
  const displayCaseCapacities = useStore((state) => state.displayCaseCapacities);
  const DEFAULT_CAPACITY_LIMIT = 10;

  const [dragOverCase, setDragOverCase] = useState<string | null>(null);
  const [showMoveMenu, setShowMoveMenu] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const filteredMeteorites = useMemo(() => {
    return getFilteredMeteorites();
  }, [meteoritesData, filters, sort, getFilteredMeteorites, caseSimulation.isSimulating, caseSimulation.simulatedMeteorites]);

  const capacityData = useMemo(() => getDisplayCaseCapacityData(caseSimulation.isSimulating), [
    meteoritesData, 
    getDisplayCaseCapacityData, 
    caseSimulation.isSimulating,
    caseSimulation.simulatedMeteorites,
  ]);
  const overCapacityCount = capacityData.filter(c => c.isOverCapacity).length;
  const simulationMoveCount = useMemo(() => getSimulationMoveCount(), [caseSimulation.moveHistory]);
  const selectedCount = useMemo(() => caseSimulation.selectedMeteoriteIds.size, [caseSimulation.selectedMeteoriteIds]);

  const movedMeteoriteMap = useMemo(() => {
    const map = new Map<string, string>();
    caseSimulation.moveHistory.forEach(record => {
      map.set(record.meteoriteId, record.fromCase);
    });
    return map;
  }, [caseSimulation.moveHistory]);

  const allDisplayCases = useMemo(() => {
    const cases = new Set<string>();
    const dataSource = caseSimulation.isSimulating ? caseSimulation.simulatedMeteorites : meteoritesData;
    dataSource.forEach(m => cases.add(m.displayCase));
    Object.keys(displayCaseCapacities).forEach(c => cases.add(c));
    return Array.from(cases).sort();
  }, [filteredMeteorites, displayCaseCapacities, caseSimulation.isSimulating, caseSimulation.simulatedMeteorites, meteoritesData]);

  const sortedCases = useMemo(() => {
    const groupedByCase = allDisplayCases.reduce<Record<string, DisplayCaseGroup>>((acc, caseKey) => {
      acc[caseKey] = {
        displayCase: caseKey,
        meteorites: [],
        totalWeight: 0,
      };
      return acc;
    }, {});

    filteredMeteorites.forEach(meteorite => {
      const caseKey = meteorite.displayCase || '未分组';
      if (groupedByCase[caseKey]) {
        groupedByCase[caseKey].meteorites.push(meteorite);
        groupedByCase[caseKey].totalWeight += meteorite.weight;
      }
    });

    return Object.values(groupedByCase);
  }, [filteredMeteorites, allDisplayCases]);

  const getCaseStatusDistribution = (meteorites: Meteorite[]) => {
    return meteorites.reduce((acc, m) => {
      acc[m.saleStatus]++;
      return acc;
    }, { available: 0, reserved: 0, sold: 0 });
  };

  const handleDragOver = useCallback((e: React.DragEvent, displayCase: string) => {
    if (!caseSimulation.isSimulating) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCase(displayCase);
  }, [caseSimulation.isSimulating]);

  const handleDragLeave = useCallback(() => {
    setDragOverCase(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetCase: string) => {
    if (!caseSimulation.isSimulating) return;
    e.preventDefault();
    setDragOverCase(null);
    
    const meteoriteId = e.dataTransfer.getData('meteoriteId');
    if (meteoriteId) {
      moveMeteoriteToCase(meteoriteId, targetCase);
    }
  }, [caseSimulation.isSimulating, moveMeteoriteToCase]);

  const handleBatchMove = useCallback((targetCase: string) => {
    if (!caseSimulation.isSimulating) return;
    const selectedIds = Array.from(caseSimulation.selectedMeteoriteIds);
    if (selectedIds.length > 0) {
      batchMoveMeteoritesToCase(selectedIds, targetCase);
      clearMeteoriteSelection();
    }
    setShowMoveMenu(null);
  }, [caseSimulation.isSimulating, caseSimulation.selectedMeteoriteIds, batchMoveMeteoritesToCase, clearMeteoriteSelection]);

  const handleStartSimulation = () => {
    startCaseSimulation();
  };

  const handleCancelSimulation = () => {
    cancelCaseSimulation();
    clearMeteoriteSelection();
  };

  const handleConfirmSimulation = () => {
    setShowConfirmDialog(true);
  };

  const executeConfirm = () => {
    const result = confirmCaseSimulation();
    setShowConfirmDialog(false);
    if (result.success && result.updatedCount > 0) {
      console.log(`已成功更新 ${result.updatedCount} 件藏品的展柜位置`);
    }
  };

  const handleSelectAllInCase = (displayCase: string, e: React.MouseEvent) => {
    e.stopPropagation();
    selectAllMeteoritesInCase(displayCase);
  };

  const isCaseAllSelected = (displayCase: string) => {
    const caseMeteorites = filteredMeteorites.filter(m => m.displayCase === displayCase);
    if (caseMeteorites.length === 0) return false;
    return caseMeteorites.every(m => caseSimulation.selectedMeteoriteIds.has(m.id));
  };

  const getCaseCapacityInfo = (displayCase: string) => {
    const caseData = capacityData.find(c => c.displayCase === displayCase);
    if (caseData) {
      return {
        count: caseData.count,
        limit: caseData.capacityLimit,
        isOver: caseData.isOverCapacity,
        distribution: caseData.statusDistribution,
      };
    }
    const count = filteredMeteorites.filter(m => m.displayCase === displayCase).length;
    const limit = displayCaseCapacities[displayCase]?.capacityLimit ?? DEFAULT_CAPACITY_LIMIT;
    const distribution = getCaseStatusDistribution(filteredMeteorites.filter(m => m.displayCase === displayCase));
    return { count, limit, isOver: count > limit, distribution };
  };

  if (filteredMeteorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-archive-card rounded-full flex items-center justify-center mb-6 archive-border">
          <Inbox className="w-10 h-10 text-archive-gold/50" />
        </div>
        <h3 className="font-display text-xl font-semibold text-archive-cream mb-2">
          未找到匹配的藏品
        </h3>
        <p className="text-archive-cream/50 max-w-md">
          请尝试调整筛选条件，或点击"重置筛选"查看全部藏品
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-archive-card archive-border rounded-2xl p-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-archive-cream mb-1">
            展示柜视图
          </h2>
          <p className="text-archive-cream/60 text-sm">
            {caseSimulation.isSimulating 
              ? '调柜模拟中 - 拖拽藏品或选择后批量移动，确认前不会保存更改'
              : '按展示柜分组查看所有陨石藏品'
            }
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {caseSimulation.isSimulating ? (
            <>
              <div className="flex items-center gap-2 bg-archive-gold/20 text-archive-gold px-4 py-2 rounded-xl border border-archive-gold/50">
                <Move className="w-4 h-4 animate-pulse" />
                <span className="text-sm font-medium">已移动 {simulationMoveCount} 件</span>
              </div>
              {selectedCount > 0 && (
                <div className="flex items-center gap-2 bg-archive-gold/15 text-archive-gold px-4 py-2 rounded-xl border border-archive-gold/30">
                  <Check className="w-4 h-4" />
                  <span className="text-sm font-medium">已选择 {selectedCount} 件</span>
                </div>
              )}
              {overCapacityCount > 0 && (
                <div className="flex items-center gap-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-xl border border-red-500/50">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">{overCapacityCount} 个展柜超限</span>
                </div>
              )}
              {selectedCount > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowMoveMenu(showMoveMenu === 'batch' ? null : 'batch')}
                    className="flex items-center gap-2 px-5 py-2.5 bg-archive-gold text-archive-bg rounded-xl font-semibold hover:bg-archive-gold-light transition-all"
                  >
                    <Move className="w-4 h-4" />
                    <span>移动选中到...</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {showMoveMenu === 'batch' && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-archive-card archive-border rounded-xl shadow-xl z-30 py-2 max-h-64 overflow-y-auto">
                      {allDisplayCases.map(dc => (
                        <button
                          key={dc}
                          onClick={() => handleBatchMove(dc)}
                          className="w-full text-left px-4 py-2 text-sm text-archive-cream hover:bg-archive-gold/10 hover:text-archive-gold transition-colors"
                        >
                          展柜 {dc}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={handleCancelSimulation}
                className="flex items-center gap-2 px-5 py-2.5 bg-archive-bg/50 text-archive-cream/70 rounded-xl font-medium hover:bg-archive-bg/80 transition-all border border-archive-gold/20"
              >
                <X className="w-4 h-4" />
                <span>取消</span>
              </button>
              <button
                onClick={handleConfirmSimulation}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all ${
                  overCapacityCount > 0
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 hover:bg-yellow-500/30'
                    : 'bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>确认更改</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleStartSimulation}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-archive-gold to-archive-gold-light text-archive-bg rounded-xl font-semibold hover:shadow-lg hover:shadow-archive-gold/30 transition-all hover:scale-105"
              >
                <Play className="w-4 h-4" />
                <span>开始调柜模拟</span>
              </button>
              <button
                onClick={openCapacityPlanner}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                  overCapacityCount > 0
                    ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30'
                    : 'bg-archive-gold/20 text-archive-gold border border-archive-gold/50 hover:bg-archive-gold/30'
                }`}
              >
                <LayoutGrid className="w-5 h-5" />
                <span>展柜容量规划</span>
                {overCapacityCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                    {overCapacityCount}
                  </span>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {caseSimulation.isSimulating && (
        <div className="bg-gradient-to-r from-archive-gold/10 via-archive-gold/5 to-archive-gold/10 archive-border rounded-xl p-4 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-archive-gold" />
            <span className="text-archive-cream/80 text-sm font-medium">模拟操作提示：</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-archive-cream/60">
            <span>• 拖拽藏品卡片到目标展柜</span>
            <span>• 点击卡片或复选框进行多选</span>
            <span>• 点击"全选"可选择整个展柜</span>
            <span>• 实时查看容量和状态分布</span>
          </div>
          {selectedCount > 0 && (
            <button
              onClick={clearMeteoriteSelection}
              className="ml-auto text-xs text-archive-cream/50 hover:text-archive-gold transition-colors"
            >
              清除选择
            </button>
          )}
        </div>
      )}

      {sortedCases.map((caseGroup, caseIndex) => {
        const capacityInfo = getCaseCapacityInfo(caseGroup.displayCase);
        const allSelected = isCaseAllSelected(caseGroup.displayCase);
        
        return (
          <div
            key={caseGroup.displayCase}
            onDragOver={(e) => handleDragOver(e, caseGroup.displayCase)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, caseGroup.displayCase)}
            className={`bg-archive-card archive-border rounded-2xl overflow-hidden animate-slide-up transition-all duration-300 ${
              dragOverCase === caseGroup.displayCase
                ? 'ring-4 ring-archive-gold/50 ring-offset-4 ring-offset-archive-bg scale-[1.01]'
                : ''
            } ${
              capacityInfo.isOver && caseSimulation.isSimulating
                ? 'border-red-500/50 bg-red-500/5'
                : ''
            }`}
            style={{ animationDelay: `${caseIndex * 80}ms` }}
          >
            <div className="bg-gradient-to-r from-archive-gold/15 to-transparent px-6 py-4 border-b border-archive-gold/20">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center archive-border ${
                    capacityInfo.isOver ? 'bg-red-500/20' : 'bg-archive-gold/20'
                  }`}>
                    <Archive className={`w-6 h-6 ${
                      capacityInfo.isOver ? 'text-red-400' : 'text-archive-gold'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-bold text-archive-cream flex items-center space-x-2">
                      <span className="text-archive-gold">展示柜</span>
                      <span>{caseGroup.displayCase}</span>
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {caseSimulation.isSimulating && (
                        <button
                          onClick={(e) => handleSelectAllInCase(caseGroup.displayCase, e)}
                          className="text-xs text-archive-gold hover:text-archive-gold-light transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          {allSelected ? '取消全选' : '全选'}
                        </button>
                      )}
                      {capacityInfo.isOver && caseSimulation.isSimulating && (
                        <span className="text-xs text-red-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          超出容量 {capacityInfo.count - capacityInfo.limit} 件
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4 flex-wrap gap-y-2">
                  <div className="flex items-center space-x-2 bg-archive-bg/50 px-4 py-2 rounded-lg archive-border">
                    <Package className="w-4 h-4 text-archive-gold" />
                    <span className="text-archive-cream/60 text-sm">藏品数量</span>
                    <span className={`font-semibold text-lg ${
                      capacityInfo.isOver && caseSimulation.isSimulating ? 'text-red-400' : 'text-archive-cream'
                    }`}>
                      {capacityInfo.count}
                    </span>
                    <span className="text-archive-cream/40 text-sm">/ {capacityInfo.limit} 件</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-archive-bg/50 px-4 py-2 rounded-lg archive-border">
                    <Scale className="w-4 h-4 text-archive-gold" />
                    <span className="text-archive-cream/60 text-sm">总重量</span>
                    <span className="text-archive-cream font-semibold text-lg">
                      {caseGroup.totalWeight.toLocaleString()}
                    </span>
                    <span className="text-archive-cream/40 text-sm">克</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status="available" count={capacityInfo.distribution.available} />
                    <StatusBadge status="reserved" count={capacityInfo.distribution.reserved} />
                    <StatusBadge status="sold" count={capacityInfo.distribution.sold} />
                  </div>
                </div>
              </div>
            </div>

            <div 
              className={`p-6 transition-colors duration-300 ${
                dragOverCase === caseGroup.displayCase ? 'bg-archive-gold/5' : ''
              }`}
            >
              {caseGroup.meteorites.length === 0 ? (
                <div className="text-center py-8 text-archive-cream/40">
                  <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">此展柜暂无藏品</p>
                  {caseSimulation.isSimulating && (
                    <p className="text-xs mt-1 text-archive-gold/50">拖拽藏品到此处</p>
                  )}
                </div>
              ) : (
                <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-archive-gold/30 scrollbar-track-transparent">
                  {caseGroup.meteorites.map((meteorite) => (
                    <MiniMeteoriteCard
                      key={meteorite.id}
                      meteorite={meteorite}
                      showSelection={caseSimulation.isSimulating}
                      isSelected={caseSimulation.selectedMeteoriteIds.has(meteorite.id)}
                      onToggleSelect={toggleMeteoriteSelection}
                      isMoved={movedMeteoriteMap.has(meteorite.id)}
                      originalCase={movedMeteoriteMap.get(meteorite.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowConfirmDialog(false)} />
          <div className="relative w-full max-w-md bg-archive-card rounded-2xl archive-border overflow-hidden shadow-2xl shadow-black/50 animate-slide-up">
            <div className="sticky top-0 z-10 bg-archive-card border-b border-archive-gold/20 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-archive-cream">确认调柜更改</h2>
                  <p className="text-archive-cream/50 text-sm">将永久更新藏品的展柜位置</p>
                </div>
              </div>
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="w-10 h-10 bg-archive-bg/80 backdrop-blur-sm rounded-full flex items-center justify-center text-archive-cream/70 hover:text-archive-cream hover:bg-archive-gold/20 transition-all border border-archive-gold/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <p className="text-archive-cream/70 text-sm mb-3">
                  本次调柜将更新 <span className="text-archive-gold font-semibold">{simulationMoveCount}</span> 件藏品的展柜位置。
                </p>
                {overCapacityCount > 0 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
                    <p className="text-yellow-400 text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      有 {overCapacityCount} 个展柜当前处于超容量状态，确认后将仍然保存更改。
                    </p>
                  </div>
                )}
                <p className="text-archive-cream/50 text-xs">
                  确认后数据将写入本地存储，此操作不可撤销。
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="flex-1 px-6 py-3 bg-archive-bg/50 border border-archive-gold/30 rounded-lg text-archive-cream font-semibold hover:bg-archive-gold/10 transition-all"
                >
                  再想想
                </button>
                <button
                  onClick={executeConfirm}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-green-500/30 transition-all"
                >
                  确认保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisplayCaseView;
