import { Eye, Check, Move } from 'lucide-react';
import { Meteorite, SALE_STATUS_COLORS } from '@/types';
import { useStore } from '@/store/useStore';

interface MiniMeteoriteCardProps {
  meteorite: Meteorite;
  showSelection?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  isDragging?: boolean;
  isMoved?: boolean;
  originalCase?: string;
}

const MiniMeteoriteCard = ({ 
  meteorite, 
  showSelection = false, 
  isSelected = false,
  onToggleSelect,
  isDragging = false,
  isMoved = false,
  originalCase,
}: MiniMeteoriteCardProps) => {
  const { openModal, caseSimulation } = useStore();

  const handleDragStart = (e: React.DragEvent) => {
    if (!caseSimulation.isSimulating) return;
    e.dataTransfer.setData('meteoriteId', meteorite.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleClick = (e: React.MouseEvent) => {
    if (caseSimulation.isSimulating && showSelection) {
      e.stopPropagation();
      onToggleSelect?.(meteorite.id);
    } else {
      openModal(meteorite);
    }
  };

  return (
    <div
      draggable={caseSimulation.isSimulating}
      onDragStart={handleDragStart}
      onClick={handleClick}
      className={`group relative bg-archive-bg/60 archive-border rounded-lg overflow-hidden cursor-pointer card-hover flex-shrink-0 w-28 transition-all duration-300 ${
        isSelected ? 'ring-2 ring-archive-gold ring-offset-2 ring-offset-archive-card scale-105' : ''
      } ${isDragging ? 'opacity-50' : ''} ${
        isMoved ? 'border-dashed border-archive-gold/70' : ''
      }`}
    >
      {caseSimulation.isSimulating && showSelection && (
        <div 
          className="absolute top-1.5 left-1.5 z-20 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect?.(meteorite.id);
          }}
          style={{
            backgroundColor: isSelected ? 'rgb(212 175 55)' : 'transparent',
            borderColor: isSelected ? 'rgb(212 175 55)' : 'rgba(255,255,255,0.3)',
          }}
        >
          {isSelected && <Check className="w-3.5 h-3.5 text-archive-bg" />}
        </div>
      )}

      {isMoved && originalCase && (
        <div className="absolute top-1.5 right-1.5 z-20 bg-archive-gold/90 text-archive-bg text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
          <Move className="w-3 h-3" />
          <span>来自{originalCase}</span>
        </div>
      )}

      <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-start p-1.5">
        <div
          className={`px-1.5 py-0.5 rounded text-xs font-medium text-white ${SALE_STATUS_COLORS[meteorite.saleStatus]} ${
            showSelection && caseSimulation.isSimulating ? 'ml-7' : ''
          }`}
        >
          {meteorite.saleStatus === 'available' ? '在售' : meteorite.saleStatus === 'reserved' ? '预留' : '已售'}
        </div>
      </div>

      <div className="relative aspect-square overflow-hidden">
        <img
          src={meteorite.imageUrl}
          alt={meteorite.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-archive-card via-transparent to-transparent opacity-70" />
        <div className={`absolute inset-0 transition-colors duration-300 ${
          caseSimulation.isSimulating && showSelection
            ? isSelected ? 'bg-archive-gold/25' : 'bg-archive-gold/0 group-hover:bg-archive-gold/10'
            : 'bg-archive-gold/0 group-hover:bg-archive-gold/15'
        }`} />
        {!caseSimulation.isSimulating && (
          <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-7 h-7 bg-archive-gold/90 rounded-full flex items-center justify-center shadow-lg">
              <Eye className="w-3.5 h-3.5 text-archive-bg" />
            </div>
          </div>
        )}
      </div>

      <div className="p-2">
        <h4 className="font-display text-sm font-medium text-archive-cream truncate group-hover:text-archive-gold transition-colors">
          {meteorite.name}
        </h4>
        <p className="text-xs text-archive-cream/50 truncate">
          {meteorite.weight.toLocaleString()} 克
        </p>
      </div>
    </div>
  );
};

export default MiniMeteoriteCard;
