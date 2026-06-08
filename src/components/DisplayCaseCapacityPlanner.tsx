import { useState, useMemo } from 'react';
import { X, Archive, Package, Scale, AlertTriangle, Settings, CheckCircle, Clock, Play, Move, Check, Layers } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { SALE_STATUS_LABELS, SALE_STATUS_COLORS, DisplayCaseCapacityData } from '@/types';

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

const DisplayCaseCard = ({ 
  caseData, 
  onUpdateCapacity,
  isSimulating = false,
}: { 
  caseData: DisplayCaseCapacityData; 
  onUpdateCapacity: (displayCase: string, capacity: number) => void;
  isSimulating?: boolean;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempCapacity, setTempCapacity] = useState(caseData.capacityLimit.toString());
  
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

  return (
    <div 
      className={`relative bg-archive-card archive-border rounded-xl p-5 transition-all duration-300 ${
        caseData.isOverCapacity 
          ? 'border-red-500/50 bg-red-500/5 shadow-lg shadow-red-500/10' 
          : caseData.isEmpty 
            ? 'opacity-70' 
            : 'hover:shadow-xl hover:shadow-black/20'
      }`}
    >
      {caseData.isOverCapacity && (
        <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 rounded-bl-lg rounded-tr-lg text-xs font-semibold flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          容量超限
          {isSimulating && <span className="text-yellow-300 ml-1">· 模拟</span>}
        </div>
      )}
      
      {caseData.isEmpty && (
        <div className="absolute top-0 right-0 bg-archive-cream/20 text-archive-cream/70 px-3 py-1 rounded-bl-lg rounded-tr-lg text-xs font-medium">
          空展柜
        </div>
      )}
      
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
        
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="p-2 rounded-lg hover:bg-archive-gold/10 transition-colors text-archive-cream/50 hover:text-archive-gold"
          title="设置容量"
        >
          <Settings className="w-4 h-4" />
        </button>
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
  } = useStore();
  
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const capacityData = useMemo(() => getDisplayCaseCapacityData(caseSimulation.isSimulating), [
    getDisplayCaseCapacityData, 
    caseSimulation.isSimulating,
    caseSimulation.simulatedMeteorites,
  ]);
  
  const overCapacityCount = capacityData.filter(c => c.isOverCapacity).length;
  const emptyCount = capacityData.filter(c => c.isEmpty).length;
  const totalCount = capacityData.reduce((sum, c) => sum + c.count, 0);
  const totalWeight = capacityData.reduce((sum, c) => sum + c.totalWeight, 0);
  const simulationMoveCount = useMemo(() => getSimulationMoveCount(), [caseSimulation.moveHistory]);
  
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
      
      <div className="relative w-full max-w-5xl max-h-[85vh] bg-archive-card rounded-2xl archive-border overflow-hidden shadow-2xl shadow-black/50 flex flex-col animate-fade-in">
        <div className="sticky top-0 z-10 bg-archive-card border-b border-archive-gold/20 px-6 py-4 flex items-center justify-between">
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
                {caseSimulation.isSimulating && (
                  <span className="text-archive-gold ml-2">· 已移动 {simulationMoveCount} 件</span>
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
                    overCapacityCount > 0
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 hover:bg-yellow-500/30'
                      : 'bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30'
                  }`}
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
              <span className="text-xs text-archive-cream/80 font-medium">模拟模式</span>
            </div>
            <div className="text-xs text-archive-cream/60">
              在展柜视图中进行拖拽移动，此处实时预览容量变化
            </div>
            {overCapacityCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-red-400 ml-auto">
                <AlertTriangle className="w-3 h-3" />
                {overCapacityCount} 个展柜超容
              </div>
            )}
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
