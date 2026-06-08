import { useState } from 'react';
import { X, Archive, Package, Scale, AlertTriangle, Settings, CheckCircle, Clock, ShoppingCart } from 'lucide-react';
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

const CapacityBar = ({ current, max }: { current: number; max: number }) => {
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
        </p>
      )}
    </div>
  );
};

const DisplayCaseCard = ({ 
  caseData, 
  onUpdateCapacity 
}: { 
  caseData: DisplayCaseCapacityData; 
  onUpdateCapacity: (displayCase: string, capacity: number) => void;
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
          <CapacityBar current={caseData.count} max={caseData.capacityLimit} />
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
    setDisplayCaseCapacity 
  } = useStore();
  
  const capacityData = getDisplayCaseCapacityData();
  
  const overCapacityCount = capacityData.filter(c => c.isOverCapacity).length;
  const emptyCount = capacityData.filter(c => c.isEmpty).length;
  const totalCount = capacityData.reduce((sum, c) => sum + c.count, 0);
  const totalWeight = capacityData.reduce((sum, c) => sum + c.totalWeight, 0);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeCapacityPlanner();
    }
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
        onClick={closeCapacityPlanner}
      />
      
      <div className="relative w-full max-w-5xl max-h-[85vh] bg-archive-card rounded-2xl archive-border overflow-hidden shadow-2xl shadow-black/50 flex flex-col animate-fade-in">
        <div className="sticky top-0 z-10 bg-archive-card border-b border-archive-gold/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-archive-gold to-archive-gold-light rounded-lg flex items-center justify-center">
              <Archive className="w-5 h-5 text-archive-bg" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-archive-cream">展柜容量规划</h2>
              <p className="text-archive-cream/50 text-sm">
                共 {capacityData.length} 个展柜 · {totalCount} 件藏品 · 总重 {totalWeight.toLocaleString()}g
              </p>
            </div>
          </div>
          <button
            onClick={closeCapacityPlanner}
            className="w-10 h-10 bg-archive-bg/80 backdrop-blur-sm rounded-full flex items-center justify-center text-archive-cream/70 hover:text-archive-cream hover:bg-archive-gold/20 transition-all border border-archive-gold/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
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
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-sm text-archive-cream/70">
                超限: <span className="text-red-400 font-semibold">{overCapacityCount}</span>
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
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisplayCaseCapacityPlanner;
