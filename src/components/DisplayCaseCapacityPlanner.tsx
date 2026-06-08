import { useState, useMemo, useCallback } from 'react';
import { X, Archive, Package, Scale, AlertTriangle, Settings, CheckCircle, Clock, Play, Move, Check, Layers, ChevronDown, Inbox, Eye } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { SALE_STATUS_LABELS, SALE_STATUS_COLORS, DisplayCaseCapacityData, Meteorite, SALE_STATUS_SORT_ORDER } from '@/types';

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

const CapacityBar = ({ current, max, isSimulating }: { current: number; max: number; isSimulating?: boolean }) => {
  const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0;
  const isOver = current > max;
  
  let barColor = 'bg-archive-gold';
  if (isOver) {
    barColor = 'bg-red-500';
  } else if (percentage >= 80) {
    barColor = 'bg-yellow-500';
  }
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-archive-cream/50">容量使用</span>
        <span className={`font-medium ${isOver ? 'text-red-400' : 'text-archive-cream/70'}`}>
          {current} / {max}
        </span>
      </div>
      <div className="h-2 bg-archive-bg/50 rounded-full overflow-hidden archive-border">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {isOver && (
        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          超出容量 {current - max} 件
          {isSimulating && <span className="text-yellow-400 ml-1">(模拟中)</span>}
        </p>
      )}
    </div>
  );
};

const MiniMeteoriteItem = ({ 
  meteorite, 
  isSelected,
  onToggleSelect,
  showSelection,
  isMoved,
  originalCase,
  onView,
}: { 
  meteorite: Meteorite;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  showSelection: boolean;
  isMoved: boolean;
  originalCase?: string;
  onView: (meteorite: Meteorite) => void;
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (showSelection) {
      e.stopPropagation();
      onToggleSelect(meteorite.id);
    } else {
      onView(meteorite);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group flex items-center gap-2 p-1.5 rounded-lg transition-all cursor-pointer ${
        isSelected 
          ? 'bg-archive-gold/20 border border-archive-gold/50' 
          : 'hover:bg-archive-bg/50 border border-transparent'
      } ${isMoved ? 'border-dashed border-archive-gold/50' : ''}`}
    >
      {showSelection && (
        <div 
          className="w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all"
          style={{
            backgroundColor: isSelected ? 'rgb(212 175 55)' : 'transparent',
            borderColor: isSelected ? 'rgb(212 175 55)' : 'rgba(255,255,255,0.2)',
          }}
        >
          {isSelected && <Check className="w-3 h-3 text-archive-bg" />}
        </div>
      )}
      <img
        src={meteorite.imageUrl}
        alt={meteorite.name}
        className="w-8 h-8 rounded object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-archive-cream font-medium truncate">
          {meteorite.name}
        </p>
        <p className="text-[10px] text-archive-cream/50">
          {meteorite.weight.toLocaleString()}g
        </p>
      </div>
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${SALE_STATUS_COLORS[meteorite.saleStatus]}`} />
      {isMoved && originalCase && (
        <span className="text-[9px] bg-archive-gold/30 text-archive-gold px-1.5 py-0.5 rounded flex-shrink-0">
          来自{originalCase}
        </span>
      )}
      {!showSelection && (
        <Eye className="w-3 h-3 text-archive-cream/30 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
      )}
    </div>
  );
};

const DisplayCaseCard = ({ 
  caseData, 
  onUpdateCapacity,
  isSimulating = false,
  onToggleSelect,
  selectedMeteoriteIds,
  movedMeteoriteMap,
  allDisplayCases,
  onBatchMove,
  onSelectAll,
  onViewMeteorite,
}: { 
  caseData: DisplayCaseCapacityData; 
  onUpdateCapacity: (displayCase: string, capacity: number) => void;
  isSimulating?: boolean;
  onToggleSelect: (id: string) => void;
  selectedMeteoriteIds: Set<string>;
  movedMeteoriteMap: Map<string, string>;
  allDisplayCases: string[];
  onBatchMove: (meteoriteIds: string[], targetCase: string) => void;
  onSelectAll: (displayCase: string) => void;
  onViewMeteorite: (meteorite: Meteorite) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempCapacity, setTempCapacity] = useState(caseData.capacityLimit.toString());
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [expanded, setExpanded] = useState(isSimulating);

  const caseSelectedCount = caseData.meteorites.filter(m => selectedMeteoriteIds.has(m.id)).length;
  const allSelected = caseData.meteorites.length > 0 && caseSelectedCount === caseData.meteorites.length;
  const someSelected = caseSelectedCount > 0 && caseSelectedCount < caseData.meteorites.length;

  const sortedMeteorites = useMemo(() => {
    return [...caseData.meteorites].sort((a, b) => {
      const statusCompare = SALE_STATUS_SORT_ORDER[a.saleStatus] - SALE_STATUS_SORT_ORDER[b.saleStatus];
      if (statusCompare !== 0) return statusCompare;
      return b.weight - a.weight;
    });
  }, [caseData.meteorites]);
  
  const handleSave = () => {
    const num = parseInt(tempCapacity);
    if (!isNaN(num) && num >= 0) {
      onUpdateCapacity(caseData.displayCase, num);
      setIsEditing(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setTempCapacity(caseData.capacityLimit.toString());
      setIsEditing(false);
    }
  };

  const handleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectAll(caseData.displayCase);
  };

  const handleMoveSelected = (targetCase: string) => {
    const selectedIds = caseData.meteorites
      .filter(m => selectedMeteoriteIds.has(m.id))
      .map(m => m.id);
    if (selectedIds.length > 0) {
      onBatchMove(selectedIds, targetCase);
    }
    setShowMoveMenu(false);
  };

  const handleMoveAll = (targetCase: string) => {
    const allIds = caseData.meteorites.map(m => m.id);
    if (allIds.length > 0) {
      onBatchMove(allIds, targetCase);
    }
    setShowMoveMenu(false);
  };

  return (
    <div 
      className={`relative bg-archive-card archive-border rounded-xl overflow-hidden transition-all duration-300 ${
        caseData.isOverCapacity 
          ? 'border-red-500/50 bg-red-500/5 shadow-lg shadow-red-500/10' 
          : caseData.isEmpty 
            ? 'opacity-80' 
            : 'hover:shadow-xl hover:shadow-black/20'
      }`}
    >
      {caseData.isOverCapacity && (
        <div className="absolute top-0 right-0 z-10 bg-red-500 text-white px-3 py-1 rounded-bl-lg rounded-tr-lg text-xs font-semibold flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          容量超限
          {isSimulating && <span className="text-yellow-300 ml-1">· 模拟</span>}
        </div>
      )}
      
      {caseData.isEmpty && (
        <div className="absolute top-0 right-0 z-10 bg-archive-gold/30 text-archive-gold px-3 py-1 rounded-bl-lg rounded-tr-lg text-xs font-medium flex items-center gap-1">
          <Inbox className="w-3 h-3" />
          空展柜
        </div>
      )}
      
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              caseData.isOverCapacity 
                ? 'bg-red-500/20' 
                : caseData.isEmpty 
                  ? 'bg-archive-cream/10' 
                  : 'bg-archive-gold/20'
            }`}>
              <Archive className={`w-6 h-6 ${
                caseData.isOverCapacity 
                  ? 'text-red-400' 
                  : caseData.isEmpty 
                    ? 'text-archive-cream/50' 
                    : 'text-archive-gold'
              }`} />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-archive-cream">
                展柜 {caseData.displayCase}
              </h3>
              <p className="text-archive-cream/50 text-sm">
                {caseData.isEmpty ? '暂无藏品' : `${caseData.count} 件藏品`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {isSimulating && !caseData.isEmpty && (
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowMoveMenu(!showMoveMenu); }}
                  className="p-2 rounded-lg hover:bg-archive-gold/10 transition-colors text-archive-cream/50 hover:text-archive-gold"
                  title="移动藏品"
                >
                  <Move className="w-4 h-4" />
                </button>
                {showMoveMenu && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-archive-card archive-border rounded-xl shadow-xl z-30 py-2 max-h-72 overflow-y-auto">
                    {caseSelectedCount > 0 && (
                      <div className="px-3 py-1">
                        <p className="text-[10px] text-archive-cream/40 uppercase tracking-wider mb-1">移动选中 ({caseSelectedCount}件)</p>
                        {allDisplayCases.filter(dc => dc !== caseData.displayCase).map(dc => (
                          <button
                            key={dc}
                            onClick={() => handleMoveSelected(dc)}
                            className="w-full text-left px-2 py-1.5 text-sm text-archive-cream hover:bg-archive-gold/10 hover:text-archive-gold transition-colors rounded"
                          >
                            → 展柜 {dc}
                          </button>
                        ))}
                      </div>
                    )}
                    {caseSelectedCount > 0 && caseData.count > caseSelectedCount && (
                      <div className="border-t border-archive-gold/10 my-1" />
                    )}
                    <div className="px-3 py-1">
                      <p className="text-[10px] text-archive-cream/40 uppercase tracking-wider mb-1">移动全部 ({caseData.count}件)</p>
                      {allDisplayCases.filter(dc => dc !== caseData.displayCase).map(dc => (
                        <button
                          key={dc}
                          onClick={() => handleMoveAll(dc)}
                          className="w-full text-left px-2 py-1.5 text-sm text-archive-cream hover:bg-archive-gold/10 hover:text-archive-gold transition-colors rounded"
                        >
                          → 展柜 {dc}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setIsEditing(!isEditing); }}
              className="p-2 rounded-lg hover:bg-archive-gold/10 transition-colors text-archive-cream/50 hover:text-archive-gold"
              title="设置容量"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-archive-bg/50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-archive-cream/50 text-xs mb-1">
                <Package className="w-3 h-3" />
                <span>藏品数量</span>
              </div>
              <p className={`text-2xl font-display font-bold ${
                caseData.isOverCapacity ? 'text-red-400' : 'text-archive-cream'
              }`}>
                {caseData.count}
              </p>
            </div>
            <div className="bg-archive-bg/50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-archive-cream/50 text-xs mb-1">
                <Scale className="w-3 h-3" />
                <span>总重量</span>
              </div>
              <p className="text-2xl font-display font-bold text-archive-cream">
                {caseData.totalWeight.toLocaleString()}
                <span className="text-sm text-archive-cream/50 ml-1">g</span>
              </p>
            </div>
          </div>
          
          {isEditing ? (
            <div className="bg-archive-bg/50 rounded-lg p-3">
              <label className="text-xs text-archive-cream/50 mb-2 block">设置容量上限</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={tempCapacity}
                  onChange={(e) => setTempCapacity(e.target.value)}
                  onKeyDown={handleKeyDown}
                  min="0"
                  className="flex-1 px-3 py-2 bg-archive-card border border-archive-gold/30 rounded-lg text-archive-cream text-sm focus:outline-none focus:border-archive-gold focus:ring-1 focus:ring-archive-gold/30"
                  autoFocus
                />
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-archive-gold text-archive-bg text-sm font-medium rounded-lg hover:bg-archive-gold-light transition-colors"
                >
                  确定
                </button>
                <button
                  onClick={() => {
                    setTempCapacity(caseData.capacityLimit.toString());
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 bg-archive-bg/50 text-archive-cream/70 text-sm rounded-lg hover:bg-archive-bg/80 transition-colors border border-archive-gold/20"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <CapacityBar current={caseData.count} max={caseData.capacityLimit} isSimulating={isSimulating} />
          )}
          
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status="available" count={caseData.statusDistribution.available} />
            <StatusBadge status="reserved" count={caseData.statusDistribution.reserved} />
            <StatusBadge status="sold" count={caseData.statusDistribution.sold} />
            {caseData.isEmpty && (
              <span className="text-xs text-archive-cream/30">暂无状态数据</span>
            )}
          </div>

          {isSimulating && (
            <div className="border-t border-archive-gold/10 pt-3">
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                  className="flex items-center gap-1 text-xs text-archive-cream/60 hover:text-archive-gold transition-colors"
                >
                  <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                  {expanded ? '收起藏品' : `展开藏品 (${caseData.count}件)`}
                </button>
                {!caseData.isEmpty && (
                  <button
                    onClick={handleSelectAll}
                    className="text-xs text-archive-gold hover:text-archive-gold-light transition-colors flex items-center gap-1"
                  >
                    <Check className={`w-3 h-3 ${allSelected ? 'opacity-100' : someSelected ? 'opacity-50' : 'opacity-30'}`} />
                    {allSelected ? '取消全选' : '全选'}
                  </button>
                )}
              </div>
              
              {expanded && (
                <div className={`space-y-1 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-archive-gold/30 scrollbar-track-transparent ${
                  caseData.isEmpty ? 'py-4' : 'pr-1'
                }`}>
                  {caseData.isEmpty ? (
                    <div className="text-center text-archive-cream/40 py-2">
                      <Inbox className="w-6 h-6 mx-auto mb-1 opacity-50" />
                      <p className="text-xs">空展柜，可作为移动目标</p>
                    </div>
                  ) : (
                    sortedMeteorites.map((meteorite) => (
                      <MiniMeteoriteItem
                        key={meteorite.id}
                        meteorite={meteorite}
                        isSelected={selectedMeteoriteIds.has(meteorite.id)}
                        onToggleSelect={onToggleSelect}
                        showSelection={isSimulating}
                        isMoved={movedMeteoriteMap.has(meteorite.id)}
                        originalCase={movedMeteoriteMap.get(meteorite.id)}
                        onView={onViewMeteorite}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DisplayCaseCapacityPlanner = () => {
  const { 
    isCapacityPlannerOpen, 
    closeCapacityPlanner, 
    getDisplayCaseCapacityData,
    setDisplayCaseCapacity,
    caseSimulation,
    startCaseSimulation,
    cancelCaseSimulation,
    confirmCaseSimulation,
    getSimulationMoveCount,
    toggleMeteoriteSelection,
    batchMoveMeteoritesToCase,
    selectAllMeteoritesInCase,
    openModal,
    meteorites: meteoritesData,
    displayCaseCapacities,
  } = useStore();
  
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const capacityData = useMemo(() => getDisplayCaseCapacityData(caseSimulation.isSimulating), [
    getDisplayCaseCapacityData, 
    caseSimulation.isSimulating,
    caseSimulation.simulatedMeteorites,
  ]);

  const allDisplayCases = useMemo(() => {
    const cases = new Set<string>();
    const dataSource = caseSimulation.isSimulating ? caseSimulation.simulatedMeteorites : meteoritesData;
    dataSource.forEach(m => cases.add(m.displayCase));
    Object.keys(displayCaseCapacities).forEach(c => cases.add(c));
    return Array.from(cases).sort();
  }, [caseSimulation.isSimulating, caseSimulation.simulatedMeteorites, meteoritesData, displayCaseCapacities]);
  
  const overCapacityCount = capacityData.filter(c => c.isOverCapacity).length;
  const emptyCount = capacityData.filter(c => c.isEmpty).length;
  const totalCount = capacityData.reduce((sum, c) => sum + c.count, 0);
  const totalWeight = capacityData.reduce((sum, c) => sum + c.totalWeight, 0);
  const simulationMoveCount = useMemo(() => getSimulationMoveCount(), [caseSimulation.moveHistory]);
  const selectedCount = caseSimulation.selectedMeteoriteIds.size;

  const movedMeteoriteMap = useMemo(() => {
    const map = new Map<string, string>();
    caseSimulation.moveHistory.forEach(record => {
      map.set(record.meteoriteId, record.fromCase);
    });
    return map;
  }, [caseSimulation.moveHistory]);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (showConfirmDialog) {
        setShowConfirmDialog(false);
      } else if (caseSimulation.isSimulating) {
        cancelCaseSimulation();
      } else {
        closeCapacityPlanner();
      }
    }
  };
  
  const handleStartSimulation = () => {
    startCaseSimulation();
  };
  
  const handleCancelSimulation = () => {
    cancelCaseSimulation();
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

  const handleClose = () => {
    if (caseSimulation.isSimulating) {
      cancelCaseSimulation();
    }
    closeCapacityPlanner();
  };

  const handleBatchMove = useCallback((meteoriteIds: string[], targetCase: string) => {
    batchMoveMeteoritesToCase(meteoriteIds, targetCase);
  }, [batchMoveMeteoritesToCase]);

  const handleSelectAll = useCallback((displayCase: string) => {
    selectAllMeteoritesInCase(displayCase);
  }, [selectAllMeteoritesInCase]);

  const handleViewMeteorite = useCallback((meteorite: Meteorite) => {
    openModal(meteorite);
  }, [openModal]);
  
  if (!isCapacityPlannerOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      <div className="relative w-full max-w-6xl max-h-[85vh] bg-archive-card rounded-2xl archive-border overflow-hidden shadow-2xl shadow-black/50 flex flex-col animate-fade-in">
        <div className="sticky top-0 z-20 bg-archive-card border-b border-archive-gold/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              caseSimulation.isSimulating 
                ? 'bg-gradient-to-br from-archive-gold to-archive-gold-light' 
                : 'bg-gradient-to-br from-archive-gold to-archive-gold-light'
            }`}>
              <Archive className={`w-5 h-5 ${
                caseSimulation.isSimulating ? 'text-archive-bg animate-pulse' : 'text-archive-bg'
              }`} />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-archive-cream flex items-center gap-2">
                展柜容量规划
                {caseSimulation.isSimulating && (
                  <span className="text-xs bg-archive-gold/20 text-archive-gold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Move className="w-3 h-3" />
                    调柜模拟中
                  </span>
                )}
              </h2>
              <p className="text-archive-cream/50 text-sm">
                共 {capacityData.length} 个展柜 · {totalCount} 件藏品 · 总重 {totalWeight.toLocaleString()}g
                {caseSimulation.isSimulating && simulationMoveCount > 0 && (
                  <span className="text-archive-gold ml-2">· 已移动 {simulationMoveCount} 件</span>
                )}
                {caseSimulation.isSimulating && selectedCount > 0 && (
                  <span className="text-archive-gold/70 ml-2">· 已选择 {selectedCount} 件</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {caseSimulation.isSimulating ? (
              <>
                <button
                  onClick={handleCancelSimulation}
                  className="px-4 py-2 bg-archive-bg/50 text-archive-cream/70 text-sm font-medium rounded-lg hover:bg-archive-bg/80 transition-all border border-archive-gold/20 flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  取消模拟
                </button>
                <button
                  onClick={handleConfirmSimulation}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition-all ${
                    simulationMoveCount === 0
                      ? 'bg-archive-cream/10 text-archive-cream/40 cursor-not-allowed border border-archive-cream/10'
                      : overCapacityCount > 0
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 hover:bg-yellow-500/30'
                        : 'bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30'
                  }`}
                  disabled={simulationMoveCount === 0}
                >
                  <Check className="w-4 h-4" />
                  确认更改
                </button>
              </>
            ) : (
              <button
                onClick={handleStartSimulation}
                className="px-4 py-2 bg-gradient-to-r from-archive-gold to-archive-gold-light text-archive-bg text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-archive-gold/30 transition-all flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                开始调柜模拟
              </button>
            )}
            <button
              onClick={handleClose}
              className="w-10 h-10 bg-archive-bg/80 backdrop-blur-sm rounded-full flex items-center justify-center text-archive-cream/70 hover:text-archive-cream hover:bg-archive-gold/20 transition-all border border-archive-gold/20"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {caseSimulation.isSimulating && (
          <div className="px-6 py-3 border-b border-archive-gold/10 bg-gradient-to-r from-archive-gold/10 via-archive-gold/5 to-archive-gold/10 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-archive-gold" />
              <span className="text-xs text-archive-cream/80 font-medium">调柜模拟模式</span>
            </div>
            <div className="text-xs text-archive-cream/60">
              点击藏品选择，使用移动按钮批量调整，实时预览容量变化
            </div>
            <div className="flex items-center gap-4 ml-auto">
              {overCapacityCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-red-400">
                  <AlertTriangle className="w-3 h-3" />
                  {overCapacityCount} 个展柜超容
                </div>
              )}
              {emptyCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-archive-cream/50">
                  <Inbox className="w-3 h-3" />
                  {emptyCount} 个空展柜
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="px-6 py-4 border-b border-archive-gold/10 bg-archive-bg/30">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-archive-gold" />
              <span className="text-sm text-archive-cream/70">
                总展柜数: <span className="text-archive-cream font-semibold">{capacityData.length}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm text-archive-cream/70">
                正常: <span className="text-archive-cream font-semibold">{capacityData.length - overCapacityCount - emptyCount}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-4 h-4 ${caseSimulation.isSimulating && overCapacityCount > 0 ? 'text-yellow-400' : 'text-red-400'}`} />
              <span className="text-sm text-archive-cream/70">
                超限: <span className={`font-semibold ${caseSimulation.isSimulating && overCapacityCount > 0 ? 'text-yellow-400' : 'text-red-400'}`}>{overCapacityCount}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-archive-cream/40" />
              <span className="text-sm text-archive-cream/70">
                空展柜: <span className="text-archive-cream/50 font-semibold">{emptyCount}</span>
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {capacityData.map((caseData) => (
              <DisplayCaseCard
                key={caseData.displayCase}
                caseData={caseData}
                onUpdateCapacity={setDisplayCaseCapacity}
                isSimulating={caseSimulation.isSimulating}
                onToggleSelect={toggleMeteoriteSelection}
                selectedMeteoriteIds={caseSimulation.selectedMeteoriteIds}
                movedMeteoriteMap={movedMeteoriteMap}
                allDisplayCases={allDisplayCases}
                onBatchMove={handleBatchMove}
                onSelectAll={handleSelectAll}
                onViewMeteorite={handleViewMeteorite}
              />
            ))}
          </div>
        </div>
      </div>

      {showConfirmDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowConfirmDialog(false)} />
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

export default DisplayCaseCapacityPlanner;
